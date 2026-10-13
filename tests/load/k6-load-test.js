import http from 'k6/http';
import { check, sleep, group } from 'k6';

// ─── K6 Load & Stress Test Configuration ──────────────────────────────
export const options = {
  scenarios: {
    // 1. Sustained Browse Traffic (70% typical export traffic)
    browse_traffic: {
      executor: 'ramping-vus',
      startVUs: 5,
      stages: [
        { duration: '30s', target: 25 },
        { duration: '1m', target: 50 },
        { duration: '30s', target: 0 },
      ],
      gracefulRampDown: '10s',
      exec: 'browseJourney',
    },
    // 2. High-Frequency Keyword Search (20% traffic)
    search_traffic: {
      executor: 'ramping-vus',
      startVUs: 2,
      stages: [
        { duration: '20s', target: 15 },
        { duration: '40s', target: 30 },
        { duration: '20s', target: 0 },
      ],
      gracefulRampDown: '5s',
      exec: 'searchJourney',
    },
    // 3. Peak RFQ Burst & Rate Limit Resilience (10% traffic)
    rfq_burst: {
      executor: 'ramping-arrival-rate',
      startRate: 2,
      timeUnit: '1s',
      preAllocatedVUs: 10,
      maxVUs: 40,
      stages: [
        { duration: '20s', target: 10 },
        { duration: '30s', target: 25 },
        { duration: '10s', target: 0 },
      ],
      exec: 'rfqBurstJourney',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.02'], // Less than 2% errors tolerated under peak stress
    'http_req_duration{scenario:browse_traffic}': ['p(95)<300', 'p(99)<600'], // Sub-300ms p95 browse
    'http_req_duration{scenario:search_traffic}': ['p(95)<350', 'p(99)<700'], // Sub-350ms p95 search
    'http_req_duration{scenario:rfq_burst}': ['p(95)<800', 'p(99)<1500'], // Sub-800ms p95 RFQ writes
  },
};

const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:5000/api/v1';

const HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

// ─── Scenario 1: Browse Catalogue Journey ─────────────────────────────
export function browseJourney() {
  group('Catalogue Browse', () => {
    // Categories taxonomy
    const catRes = http.get(`${BASE_URL}/categories`, { headers: HEADERS });
    check(catRes, {
      'categories status 200': (r) => r.status === 200,
      'categories returned data': (r) => JSON.parse(r.body).success === true,
    });

    sleep(0.5);

    // Paginated product listing
    const prodRes = http.get(`${BASE_URL}/products?limit=12&page=1`, { headers: HEADERS });
    check(prodRes, {
      'products status 200': (r) => r.status === 200,
      'products array valid': (r) => JSON.parse(r.body).data.length > 0,
    });

    sleep(1);

    // Commodity Detail
    const detailRes = http.get(`${BASE_URL}/products/castor-oil-and-derivatives`, { headers: HEADERS });
    check(detailRes, {
      'product detail status valid': (r) => r.status === 200 || r.status === 404,
    });

    sleep(1);
  });
}

// ─── Scenario 2: Search Autocomplete & Filter Journey ─────────────────
export function searchJourney() {
  group('Commodity Search', () => {
    const queries = ['oil', 'onion', 'cumin', 'organic', 'spice'];
    const q = queries[Math.floor(Math.random() * queries.length)];

    // Autocomplete endpoint
    const suggestRes = http.get(`${BASE_URL}/search/suggest?q=${q}`, { headers: HEADERS });
    check(suggestRes, {
      'suggest status 200': (r) => r.status === 200,
      'suggest latency < 200ms': (r) => r.timings.duration < 200,
    });

    sleep(0.3);

    // Keyword filtered search
    const searchRes = http.get(`${BASE_URL}/products?q=${q}&limit=8`, { headers: HEADERS });
    check(searchRes, {
      'search status 200': (r) => r.status === 200,
    });

    sleep(0.7);
  });
}

// ─── Scenario 3: RFQ Burst Submissions ────────────────────────────────
export function rfqBurstJourney() {
  group('RFQ Submission Burst', () => {
    const rfqPayload = JSON.stringify({
      name: `Stress Tester ${__VU}-${__ITER}`,
      email: `loadtest-${__VU}-${__ITER}@international-buyer.com`,
      company: 'Global Import Consortium Ltd',
      country: 'United Arab Emirates',
      destinationPort: 'Jebel Ali',
      incoterm: 'CIF',
      items: [{ productName: 'Dehydrated White Onion Flakes', quantity: 25, unit: 'MT' }],
      message: 'Automated peak burst load test inquiry for pricing validation.',
    });

    const res = http.post(`${BASE_URL}/inquiries`, rfqPayload, { headers: HEADERS });
    check(res, {
      'rfq created or rate limited': (r) => r.status === 201 || r.status === 429,
    });

    sleep(1);
  });
}
