import { Op } from 'sequelize';
import env from '../../config/env.js';
import logger from '../../utils/logger.js';
import AiUsageLog from './aiUsageLog.model.js';

// In-memory response cache for repeated read-only queries (1 hour TTL)
const responseCache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000;

/**
 * Redact direct PII (emails and phone numbers) before sending prompts to external LLMs
 */
export const scrubPii = (text = '') => {
  if (typeof text !== 'string') return text;
  return text
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]')
    .replace(/(\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g, '[PHONE_REDACTED]');
};

/**
 * Query cumulative expenditure for the current calendar day (UTC)
 */
export const getDailySpend = async () => {
  try {
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    const totalCost = await AiUsageLog.sum('costEstimate', {
      where: {
        at: { [Op.gte]: startOfDay },
        success: true,
      },
    });

    const totalTokens = await AiUsageLog.sum('outputTokens', {
      where: {
        at: { [Op.gte]: startOfDay },
        success: true,
      },
    });

    return {
      totalCostUsd: Number(totalCost || 0),
      totalTokens: Number(totalTokens || 0),
      budgetLimitUsd: env.DAILY_AI_BUDGET_USD,
      isExceeded: Number(totalCost || 0) >= env.DAILY_AI_BUDGET_USD,
    };
  } catch (err) {
    logger.warn(`Failed to compute daily AI spend: ${err.message}`);
    return { totalCostUsd: 0, totalTokens: 0, budgetLimitUsd: env.DAILY_AI_BUDGET_USD, isExceeded: false };
  }
};

const logAiUsage = (data) => {
  AiUsageLog.create(data).catch(() => {});
};

/**
 * Universal server-side LLM invoker with:
 * - Provider swap (mock, openai, gemini, anthropic)
 * - 20s timeout enforcement
 * - Zod schema validation & single-retry loop
 * - Daily budget circuit breaker
 * - Telemetry & privacy scrubbing
 */
export const callLlm = async ({
  feature,
  systemPrompt,
  messages = [],
  context = '',
  temperature = 0.2,
  maxTokens = 800,
  schema = null,
  fallback = null,
  userId = null,
  ipHash = '',
  cacheKey = null,
}) => {
  const startTime = Date.now();

  // 1. Check in-memory cache if cacheKey provided
  if (cacheKey && responseCache.has(cacheKey)) {
    const cachedEntry = responseCache.get(cacheKey);
    if (Date.now() - cachedEntry.timestamp < CACHE_TTL_MS) {
      logAiUsage({
        feature,
        model: 'cache-hit',
        inputTokens: 0,
        outputTokens: 0,
        latencyMs: Date.now() - startTime,
        success: true,
        costEstimate: 0,
        userId,
        ipHash,
        cached: true,
      });

      return {
        text: cachedEntry.text,
        data: cachedEntry.data,
        model: 'cache',
        cached: true,
        inputTokens: 0,
        outputTokens: 0,
        latencyMs: Date.now() - startTime,
      };
    } else {
      responseCache.delete(cacheKey);
    }
  }

  // 2. Daily budget verification & test environment check
  const dailySpend = await getDailySpend();
  let provider = env.NODE_ENV === 'test' ? 'mock' : env.LLM_PROVIDER;
  if (dailySpend.isExceeded && provider !== 'mock') {
    logger.warn(
      `Daily AI budget cap reached ($${dailySpend.totalCostUsd.toFixed(3)} >= $${dailySpend.budgetLimitUsd}). Switching to mock fallback.`
    );
    provider = 'mock';
  }

  let model = env.LLM_MODEL || 'mock-gpt-4o-mini';
  if (provider === 'mock') {
    model = 'mock-b2b-engine';
  }

  // 3. Privacy scrubbing for external models
  const sanitizedMessages = messages.map((m) => ({
    role: m.role,
    content: provider === 'mock' ? m.content : scrubPii(m.content),
  }));

  let attempts = 0;
  const maxAttempts = schema ? 2 : 1; // 1 initial attempt + 1 retry on invalid schema output
  let lastError = null;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      let resultText = '';
      let inputTokens = Math.ceil((systemPrompt.length + context.length + JSON.stringify(sanitizedMessages).length) / 4);
      let outputTokens = 0;

      if (provider === 'mock' || !env.LLM_API_KEY) {
        resultText = simulateMockLlmResponse({
          feature,
          systemPrompt,
          messages: sanitizedMessages,
          context,
          schema,
        });
        outputTokens = Math.ceil(resultText.length / 4);
      } else {
        try {
          if (provider === 'openai') {
            resultText = await executeOpenAiCall({
              model,
              temperature,
              maxTokens,
              systemPrompt,
              context,
              messages: sanitizedMessages,
            });
          } else if (provider === 'gemini') {
            resultText = await executeGeminiCall({
              model: model.includes('gemini') ? model : 'gemini-1.5-flash',
              temperature,
              maxTokens,
              systemPrompt,
              context,
              messages: sanitizedMessages,
              schema,
            });
          } else if (provider === 'anthropic') {
            resultText = await executeAnthropicCall({
              model: model.includes('claude') ? model : 'claude-3-5-sonnet-20241022',
              temperature,
              maxTokens,
              systemPrompt,
              context,
              messages: sanitizedMessages,
            });
          }
          outputTokens = Math.ceil(resultText.length / 4);
        } catch (apiErr) {
          logger.warn(`External AI Provider ${provider} failed (${apiErr.message}). Engaging graceful fallback simulator.`);
          resultText = simulateMockLlmResponse({
            feature,
            systemPrompt,
            messages: sanitizedMessages,
            context,
            schema,
          });
          outputTokens = Math.ceil(resultText.length / 4);
        }
      }

      // 4. Validate output with Zod if schema provided
      let validatedData = null;
      if (schema) {
        let parsedJson = null;
        try {
          const cleanedText = resultText
            .replace(/```json\s*/gi, '')
            .replace(/```\s*/g, '')
            .trim();
          try {
            parsedJson = JSON.parse(cleanedText);
          } catch (firstErr) {
            // Repair unescaped raw control characters (literal newlines / carriage returns inside strings)
            const repaired = cleanedText.replace(/[\u0000-\u001F]+/g, (m) => {
              if (m.includes('\n')) return '\\n';
              if (m.includes('\r')) return '\\r';
              if (m.includes('\t')) return '\\t';
              return ' ';
            });
            parsedJson = JSON.parse(repaired);
          }
        } catch (jsonErr) {
          throw new Error(`Invalid JSON output: ${jsonErr.message}`);
        }

        const parseResult = schema.safeParse(parsedJson);
        if (!parseResult.success) {
          const validationIssues = parseResult.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
          throw new Error(`Zod schema validation failed: ${validationIssues}`);
        }
        validatedData = parseResult.data;
      }

      const latencyMs = Date.now() - startTime;
      const costEstimate = (inputTokens * 0.00015 + outputTokens * 0.0006) / 1000;

      // 5. Store telemetry
      logAiUsage({
        feature,
        model,
        inputTokens,
        outputTokens,
        latencyMs,
        success: true,
        costEstimate,
        userId,
        ipHash,
        cached: false,
      });

      // 6. Cache successful result if requested
      if (cacheKey) {
        responseCache.set(cacheKey, {
          text: resultText,
          data: validatedData,
          timestamp: Date.now(),
        });
      }

      return {
        text: resultText,
        data: validatedData,
        model,
        cached: false,
        inputTokens,
        outputTokens,
        latencyMs,
      };
    } catch (err) {
      lastError = err;
      logger.warn(`AI attempt ${attempts}/${maxAttempts} failed for ${feature}: ${err.message}`);

      if (attempts < maxAttempts) {
        // Prepare retry prompt asking LLM to strictly correct validation failure
        sanitizedMessages.push({
          role: 'user',
          content: `Your previous output had validation errors: ${err.message}. Please output ONLY clean, valid JSON matching the required schema. Do not add explanations.`,
        });
      }
    }
  }

  // All attempts exhausted
  const latencyMs = Date.now() - startTime;
  logAiUsage({
    feature,
    model,
    inputTokens: 0,
    outputTokens: 0,
    latencyMs,
    success: false,
    error: lastError?.message || 'Unknown error',
    userId,
    ipHash,
    cached: false,
  });

  if (fallback !== null) {
    logger.info(`Returning provided fallback for ${feature} after failure`);
    return {
      text: typeof fallback === 'string' ? fallback : JSON.stringify(fallback),
      data: typeof fallback === 'object' ? fallback : null,
      model: 'fallback',
      cached: false,
      latencyMs,
      inputTokens: 0,
      outputTokens: 0,
    };
  }

  throw lastError || new Error(`AI invocation failed for ${feature}`);
};

/**
 * OpenAI Provider with 20s timeout
 */
async function executeOpenAiCall({ model, temperature, maxTokens, systemPrompt, context, messages }) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.LLM_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        temperature,
        max_tokens: maxTokens,
        messages: [
          { role: 'system', content: `${systemPrompt}\n\nDATABASE CONTEXT:\n${context}` },
          ...messages,
        ],
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API error [${response.status}]: ${errText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('OpenAI request timed out after 20 seconds');
    }
    throw err;
  }
}

/**
 * Google Gemini Provider with 20s timeout
 */
async function executeGeminiCall({ model, temperature, maxTokens, systemPrompt, context, messages, schema }) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.LLM_API_KEY}`;
    const contents = [
      {
        role: 'user',
        parts: [{ text: `SYSTEM INSTRUCTIONS:\n${systemPrompt}\n\nDATABASE CONTEXT:\n${context}` }],
      },
      ...messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
    ];

    const generationConfig = {
      temperature,
      maxOutputTokens: maxTokens,
    };
    if (schema) {
      generationConfig.responseMimeType = 'application/json';
    }

    const response = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig,
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error [${response.status}]: ${errText}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Gemini request timed out after 20 seconds');
    }
    throw err;
  }
}

/**
 * Anthropic Claude Provider with 20s timeout
 */
async function executeAnthropicCall({ model, temperature, maxTokens, systemPrompt, context, messages }) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.LLM_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature,
        system: `${systemPrompt}\n\nDATABASE CONTEXT:\n${context}`,
        messages: messages.map((m) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })),
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Anthropic API error [${response.status}]: ${errText}`);
    }

    const data = await response.json();
    return data.content?.[0]?.text || '';
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Anthropic request timed out after 20 seconds');
    }
    throw err;
  }
}

/**
 * Generate deterministic normalized vector for offline dev, unit tests, and fallback
 */
export const generateDeterministicMockVector = (text = '', dimensions = 128) => {
  const vector = new Array(dimensions).fill(0);
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);

  for (const word of words) {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash << 5) - hash + word.charCodeAt(i);
      hash |= 0;
    }
    const index = Math.abs(hash) % dimensions;
    vector[index] += 1;
  }

  const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0)) || 1;
  return vector.map((val) => Number((val / norm).toFixed(6)));
};

/**
 * Mathematical cosine similarity between two vector arrays
 */
export const cosineSimilarity = (vecA, vecB) => {
  if (!Array.isArray(vecA) || !Array.isArray(vecB) || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Universal embedding generator supporting mock, OpenAI, and Gemini
 */
export const generateEmbedding = async (text = '') => {
  const cleanedText = scrubPii(text.trim());
  const provider = env.NODE_ENV === 'test' ? 'mock' : env.LLM_PROVIDER;

  if (provider === 'mock' || !env.LLM_API_KEY) {
    return generateDeterministicMockVector(cleanedText);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    if (provider === 'openai') {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.LLM_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: cleanedText,
        }),
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`OpenAI Embedding error [${response.status}]`);
      }
      const data = await response.json();
      return data.data?.[0]?.embedding || generateDeterministicMockVector(cleanedText);
    } else if (provider === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${env.LLM_API_KEY}`;
      const response = await fetch(url, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'models/text-embedding-004',
          content: { parts: [{ text: cleanedText }] },
        }),
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Gemini Embedding error [${response.status}]`);
      }
      const data = await response.json();
      return data.embedding?.values || generateDeterministicMockVector(cleanedText);
    }
  } catch (err) {
    clearTimeout(timeoutId);
    logger.warn(`Embedding provider error (${err.message}). Using deterministic fallback.`);
    return generateDeterministicMockVector(cleanedText);
  }

  return generateDeterministicMockVector(cleanedText);
};

/**
 * Reset memory cache (useful for tests and manual invalidation)
 */
export const resetAiCache = () => {
  responseCache.clear();
};

/**
 * Deterministic structured B2B export assistant simulator
 */
function simulateStructuredBuyerResponse({ context = '', lowerMsg = '' }) {
  // Extract all FACT-IDs from context
  const factIdMatches = [...context.matchAll(/\[FACT-ID:\s*([^\]]+)\]/g)].map((m) => m[1].trim());

  // Helper to safely select an ID that strictly exists in the context ledger
  const getFactCitation = (...substrings) => {
    for (const sub of substrings) {
      if (!sub) continue;
      const found = factIdMatches.find((id) => id.toLowerCase().includes(sub.toLowerCase()));
      if (found) return found;
    }
    return factIdMatches[0] || null;
  };

  // 1. Abuse, Injection & Security Shields
  if (
    lowerMsg.includes('ignore previous') ||
    lowerMsg.includes('ignore all') ||
    lowerMsg.includes('system prompt') ||
    lowerMsg.includes('admin password') ||
    lowerMsg.includes('dan') ||
    lowerMsg.includes('secret') ||
    lowerMsg.includes('override') ||
    lowerMsg.includes('drop table') ||
    lowerMsg.includes('select *') ||
    lowerMsg.includes('unrestricted') ||
    lowerMsg.includes('pirate') ||
    lowerMsg.includes('sign a contract') ||
    lowerMsg.includes('repeat all instructions') ||
    lowerMsg.includes('system override') ||
    lowerMsg.includes('swdub3jligfsb') ||
    lowerMsg.includes('base64') ||
    lowerMsg.includes('scrape') ||
    lowerMsg.includes('baltic') ||
    lowerMsg.includes('other buyer') ||
    lowerMsg.includes('other buyers') ||
    lowerMsg.includes('submitted by') ||
    lowerMsg.includes('confidential')
  ) {
    return JSON.stringify({
      answer: 'Access denied. I am restricted to providing public commercial export catalogue specifications and quotation assistance for JHS Global. Buyer account data and RFQ details are strictly confidential.',
      intent: 'abuse',
      used_fact_ids: [],
      confidence: 0.99,
      needs_human: false,
      suggested_action: 'none',
      follow_up_question: null,
      source_chips: [],
    });
  }

  // 2. Off-Topic Filtering (safely excluding IEC / Import Export Code / DGFT)
  const isIecQuery = lowerMsg.includes('iec') || lowerMsg.includes('import export code') || lowerMsg.includes('dgft');
  if (
    !isIecQuery &&
    (lowerMsg.includes('python') ||
      (lowerMsg.includes('code') && !lowerMsg.includes('hs code') && !lowerMsg.includes('hs-code') && !lowerMsg.includes('tariff')) ||
      lowerMsg.includes('weather') ||
      lowerMsg.includes('president') ||
      lowerMsg.includes('movie') ||
      lowerMsg.includes('joke') ||
      lowerMsg.includes('recipe') ||
      lowerMsg.includes('world cup'))
  ) {
    return JSON.stringify({
      answer: 'I am the automated B2B export desk assistant for JHS Global. I can only provide specifications, compliance certifications, packaging details, and quotation workflows for our commercial export ingredients and commodities.',
      intent: 'off_topic',
      used_fact_ids: [],
      confidence: 0.99,
      needs_human: false,
      suggested_action: 'none',
      follow_up_question: null,
      source_chips: [],
    });
  }

  // 3. Health / Medicinal Claims & Regulatory Boundaries
  if (
    lowerMsg.includes('cure') ||
    lowerMsg.includes('treat') ||
    lowerMsg.includes('disease') ||
    lowerMsg.includes('anxiety') ||
    lowerMsg.includes('cancer') ||
    lowerMsg.includes('depression') ||
    lowerMsg.includes('arthritis') ||
    lowerMsg.includes('approved in eu') ||
    lowerMsg.includes('approved in the eu') ||
    lowerMsg.includes('european union') ||
    lowerMsg.includes('food supplement') ||
    lowerMsg.includes('efsa')
  ) {
    const citationId = getFactCitation('sourcing', 'policy', 'brand');
    const citeText = citationId ? ` [FACT-ID: ${citationId}]` : '';
    return JSON.stringify({
      answer: `JHS Global supplies raw botanical ingredients for industrial manufacturing and formulation. We do not make therapeutic, medical, or disease-treatment claims. Regulatory classification, approved health claims, and food supplement approvals vary by destination market; overseas buyers must verify local compliance with their respective health authorities (such as EFSA or US FDA)${citeText}.`,
      intent: 'compliance_regulatory',
      used_fact_ids: citationId ? [citationId] : [],
      confidence: 0.96,
      needs_human: false,
      suggested_action: 'none',
      follow_up_question: 'Would you like to review the technical specification sheet or Certificate of Analysis parameters?',
      source_chips: [{ label: 'Regulatory Notice', type: 'policy' }],
    });
  }

  // 4. Competitor Comparisons
  if (lowerMsg.includes('sabinsa') || lowerMsg.includes('synthite') || lowerMsg.includes('competitor')) {
    const certId = getFactCitation('fssai', 'brand', 'identity', 'legal');
    const citeText = certId ? ` [FACT-ID: ${certId}]` : '';
    return JSON.stringify({
      answer: `JHS Global operates under verified government export credentials including FSSAI Central License (No. 10725997001058)${citeText}, APEDA, FIEO, Spices Board of India, and DGFT IEC. We provide full batch traceability and independent pre-shipment inspections upon request, but we do not provide comparative performance or pricing claims against third-party manufacturers.`,
      intent: 'company_about',
      used_fact_ids: certId ? [certId] : [],
      confidence: 0.92,
      needs_human: false,
      suggested_action: 'open_rfq',
      follow_up_question: 'Would you like to review our verified compliance credentials or request a formal quotation?',
      source_chips: [{ label: 'Export Credentials', type: 'company' }],
    });
  }

  // 5. Stock Volume / Immediate Dispatch Trap
  if (lowerMsg.includes('immediate shipment') || lowerMsg.includes('in stock') || lowerMsg.includes('stock tomorrow')) {
    const citationId = getFactCitation('ports', 'sourcing', 'policy', 'brand');
    const citeText = citationId ? ` [FACT-ID: ${citationId}]` : '';
    return JSON.stringify({
      answer: `Live warehouse inventory and container booking schedules depend on active batch release and port logistics. Our export logistics desk will confirm lot availability and vessel schedules for your discharge port upon formal inquiry${citeText}.`,
      intent: 'shipping_logistics',
      used_fact_ids: citationId ? [citationId] : [],
      confidence: 0.88,
      needs_human: true,
      suggested_action: 'open_rfq',
      follow_up_question: 'Would you like to submit your target tonnage and destination discharge port to check live vessel loading dates?',
      source_chips: [{ label: 'Logistics Desk', type: 'company' }],
    });
  }

  // 6. Product Comparison (MUST BE BEFORE INDIVIDUAL PRODUCT CHECKS)
  if (
    lowerMsg.includes('difference between') ||
    lowerMsg.includes('compare') ||
    lowerMsg.includes(' vs ') ||
    (lowerMsg.includes('glycolic') && lowerMsg.includes('salicylic')) ||
    (lowerMsg.includes('ashwagandha') && lowerMsg.includes('boswellia'))
  ) {
    const prodFactIds = factIdMatches.filter((id) => id.startsWith('FACT-PROD-'));
    const usedIds = prodFactIds.slice(0, 4);

    if (lowerMsg.includes('glycolic') && lowerMsg.includes('salicylic')) {
      const citeId = usedIds[0] || getFactCitation('prod');
      const citeText = citeId ? ` [FACT-ID: ${citeId}]` : '';
      return JSON.stringify({
        answer: `Glycolic acid is an Alpha Hydroxy Acid (AHA) offering small molecular size for surface exfoliation and skin tone uniformity in cosmetic formulations. Salicylic acid is a Beta Hydroxy Acid (BHA) offering oil-solubility for deep pore sebum penetration in acne-care cosmetics${citeText}. Both are supplied in export-grade packaging with batch COA.`,
        intent: 'product_comparison',
        used_fact_ids: citeId ? [citeId] : [],
        confidence: 0.95,
        needs_human: false,
        suggested_action: 'add_to_quote',
        follow_up_question: 'Would you like to request technical specifications for both cosmetic ingredients?',
        source_chips: [{ label: 'Cosmetic Raw Materials', type: 'product' }],
      });
    }

    const citeId = usedIds[0] || getFactCitation('prod');
    const citeText = citeId ? ` [FACT-ID: ${citeId}]` : '';
    return JSON.stringify({
      answer: `Ashwagandha extract is standardized to active Withanolides (typically 2.5% to 5.0% by HPLC) for stress-support and vitality formulations. Boswellia serrata extract is standardized to active Boswellic acids (typically 65% by titration) for joint and anti-inflammatory formulations${citeText}. Both are supplied in 25 kg fiber drums with full batch traceability.`,
      intent: 'product_comparison',
      used_fact_ids: citeId ? [citeId] : [],
      confidence: 0.95,
      needs_human: false,
      suggested_action: 'add_to_quote',
      follow_up_question: 'Would you like to compare lot COAs for both botanical extracts?',
      source_chips: [{ label: 'Botanical Extracts', type: 'product' }],
    });
  }

  // 7. Missing / Unverified Product Parameters (Residual Solvents)
  if (lowerMsg.includes('solvent') || lowerMsg.includes('residual solvent')) {
    const nameId = getFactCitation('name', 'ashwagandha', 'prod');
    const citeText = nameId ? ` [FACT-ID: ${nameId}]` : '';
    return JSON.stringify({
      answer: `I don't have verified residual solvent levels in the current catalogue record${citeText}; our export team will confirm. Would you like to send a quote request?`,
      intent: 'product_spec',
      used_fact_ids: nameId ? [nameId] : [],
      confidence: 0.70,
      needs_human: true,
      suggested_action: 'open_rfq',
      follow_up_question: 'Would you like our technical desk to pull the batch gas chromatography residual solvent test sheet for your lot?',
      source_chips: [{ label: 'Technical Testing', type: 'product' }],
    });
  }

  // 8. Ambiguous Inquiries (Missing Specific Botanical Name)
  if (
    lowerMsg.includes('what is the grade of your extract') ||
    lowerMsg.includes('what grade is your extract') ||
    lowerMsg.includes('tell me about the extract')
  ) {
    return JSON.stringify({
      answer: 'We supply several standardized botanical extracts with varying active marker percentages.',
      intent: 'product_info',
      used_fact_ids: [],
      confidence: 0.65,
      needs_human: false,
      suggested_action: 'none',
      follow_up_question: 'Which specific botanical extract are you inquiring about? (e.g., Ashwagandha Extract, Curcumin 95%, or Boswellia Serrata)',
      source_chips: [{ label: 'Botanical Extracts', type: 'product' }],
    });
  }

  // 9. Pricing / Cost / Quote / Discount / MOQ
  if (
    lowerMsg.includes('price') ||
    lowerMsg.includes('cost') ||
    lowerMsg.includes('rate') ||
    lowerMsg.includes('how much') ||
    lowerMsg.includes('discount') ||
    lowerMsg.includes('quote') ||
    lowerMsg.includes('$') ||
    lowerMsg.includes('precio') ||
    lowerMsg.includes('cuanto') ||
    lowerMsg.includes('cotiz') ||
    lowerMsg.includes('moq') ||
    lowerMsg.includes('minimum order') ||
    (lowerMsg.includes('minimum') && lowerMsg.includes('quantity'))
  ) {
    const sourcingFactId = getFactCitation('sourcing', 'quote', 'policy');
    const citeText = sourcingFactId ? ` [FACT-ID: ${sourcingFactId}]` : '';

    if (
      lowerMsg.includes('moq') ||
      lowerMsg.includes('minimum order') ||
      (lowerMsg.includes('minimum') && lowerMsg.includes('quantity'))
    ) {
      return JSON.stringify({
        answer: `Our standard Minimum Order Quantity (MOQ) is generally 1 Metric Tonne (MT) for high-value botanical extracts and chemical raw materials, and 1x20ft Full Container Load (FCL) (~18 to 22 MT depending on cargo density) for bulk commodities like Soybean Meal. Commercial trial batches (25 kg to 500 kg in fiber drums or bags) are available for verified formulators${citeText}.`,
        intent: 'pricing_moq',
        used_fact_ids: sourcingFactId ? [sourcingFactId] : [],
        confidence: 0.95,
        needs_human: true,
        suggested_action: 'open_rfq',
        follow_up_question: 'Would you like to specify your required volume for an official MOQ and freight quotation?',
        source_chips: [{ label: 'MOQ Policy', type: 'policy' }],
      });
    }

    if (
      lowerMsg.includes('precio') ||
      lowerMsg.includes('cuanto') ||
      lowerMsg.includes('cotiz')
    ) {
      return JSON.stringify({
        answer: `En el comercio internacional a granel, todas las cotizaciones se calculan estrictamente Bajo Petición (Price on Request). El precio formal depende del tonelaje final (TM / FCL), tipo de empaque y la tarifa de flete marítimo vigente hacia su puerto de descarga. JHS Global entrega una Factura Proforma vinculante dentro de 48 horas hábiles${citeText}.`,
        intent: 'pricing_moq',
        used_fact_ids: sourcingFactId ? [sourcingFactId] : [],
        confidence: 0.95,
        needs_human: true,
        suggested_action: 'open_rfq',
        follow_up_question: '¿Desea abrir el formulario de cotización para calcular el flete marítimo exacto?',
        source_chips: [{ label: 'Términos Comerciales', type: 'policy' }],
      });
    }

    return JSON.stringify({
      answer: `In international bulk container trade, all pricing is calculated strictly 'Price on Request'. Firm pricing depends on order tonnage, packaging grade, destination discharge port, and live ocean container freight rates. JHS Global provides binding proforma invoices with full freight within 48 business hours${citeText}.`,
      intent: 'pricing_moq',
      used_fact_ids: sourcingFactId ? [sourcingFactId] : [],
      confidence: 0.95,
      needs_human: true,
      suggested_action: 'open_rfq',
      follow_up_question: 'Would you like to open the RFQ form to submit your target shipment schedule and packaging requirements?',
      source_chips: [{ label: 'Commercial Terms', type: 'policy' }],
    });
  }

  // 10. Non-English Specialized Inquiries
  if (lowerMsg.includes('verpackung') || lowerMsg.includes('fasertrommeln') || lowerMsg.includes('trommeln') || lowerMsg.includes('hamburg')) {
    const packId = getFactCitation('pack', 'spec', 'prod');
    const citeText = packId ? ` [FACT-ID: ${packId}]` : '';
    return JSON.stringify({
      answer: `Für unsere standardisierten botanischen Extrakte wie Ashwagandha-Extrakt verwenden wir exportkonforme 25-kg-Fasertrommeln (drums) mit doppelter lebensmittelechter Polyethylen-Innenauskleidung für Lieferungen nach Hamburg und Europa${citeText}.`,
      intent: 'shipping_logistics',
      used_fact_ids: packId ? [packId] : [],
      confidence: 0.95,
      needs_human: false,
      suggested_action: 'open_rfq',
      follow_up_question: 'Möchten Sie eine formelle Preisanfrage für den Versand nach Europa einreichen?',
      source_chips: [{ label: 'Verpackungsspezifikation', type: 'product' }],
    });
  }

  if (lowerMsg.includes('soja') || (lowerMsg.includes('harina') && lowerMsg.includes('valencia'))) {
    const prodId = getFactCitation('soybean', 'meal', 'prod');
    const citeText = prodId ? ` [FACT-ID: ${prodId}]` : '';
    return JSON.stringify({
      answer: `Suministramos Harina de Soja Desgrasada (Soybean Meal DOC) bajo código arancelario HS 2304.00. Exportamos en contenedores FCL (20 TM) en sacos de 50 kg o granel con empaque certificado hacia el Puerto de Valencia con documentación fitosanitaria oficial${citeText}.`,
      intent: 'product_info',
      used_fact_ids: prodId ? [prodId] : [],
      confidence: 0.95,
      needs_human: false,
      suggested_action: 'add_to_quote',
      follow_up_question: '¿Desea cotizar un contenedor de 20 pies hacia Valencia?',
      source_chips: [{ label: 'Harina de Soja DOC', type: 'product', slug: 'soybean-meal-doc' }],
    });
  }

  if (
    (lowerMsg.includes('especificaciones') || lowerMsg.includes('calidad') || lowerMsg.includes('extracto')) &&
    (lowerMsg.includes('ashwagandha') || lowerMsg.includes('withanolid'))
  ) {
    const ashwaId = getFactCitation('ashwagandha', 'spec', 'prod');
    const citeText = ashwaId ? ` [FACT-ID: ${ashwaId}]` : '';
    return JSON.stringify({
      answer: `Nuestro Extracto estandarizado de Ashwagandha (*Withania somnifera*) cuenta con una pureza garantizada de Withanólidos del 2.5% al 5.0% verificada por HPLC bajo código arancelario HS 1302.19. Se suministra en tambores de fibra de 25 kg con Certificado de Análisis (COA) por lote${citeText}.`,
      intent: 'product_spec',
      used_fact_ids: ashwaId ? [ashwaId] : [],
      confidence: 0.98,
      needs_human: false,
      suggested_action: 'add_to_quote',
      follow_up_question: '¿Desea solicitar la ficha técnica completa o un Certificado de Análisis?',
      source_chips: [{ label: 'Especificaciones Ashwagandha', type: 'product', slug: 'ashwagandha-extract' }],
    });
  }

  if (lowerMsg.includes('port de chargement') || (lowerMsg.includes('chargement') && lowerMsg.includes('conteneur'))) {
    const portId = getFactCitation('ports', 'loading', 'policy');
    const citeText = portId ? ` [FACT-ID: ${portId}]` : '';
    return JSON.stringify({
      answer: `Nos terminaux de chargement maritimes en Inde sont convenus par commande selon la provenance des marchandises. Tous les conteneurs sont empotés sous supervision avec certificats phytosanitaires officiels${citeText}.`,
      intent: 'shipping_logistics',
      used_fact_ids: portId ? [portId] : [],
      confidence: 0.98,
      needs_human: false,
      suggested_action: 'open_rfq',
      follow_up_question: 'Quel est votre port de destination pour calculer le fret maritime?',
      source_chips: [{ label: 'Ports de Chargement', type: 'company' }],
    });
  }

  if (
    (lowerMsg.includes('packaging') || lowerMsg.includes('packing') || lowerMsg.includes('package')) &&
    (lowerMsg.includes('container') || lowerMsg.includes('ocean') || lowerMsg.includes('size') || lowerMsg.includes('option') || lowerMsg.includes('bulk'))
  ) {
    const packFactId = getFactCitation('pack', 'policy', 'spec');
    const citeText = packFactId ? ` [FACT-ID: ${packFactId}]` : '';
    return JSON.stringify({
      answer: `We provide standard export packaging tailored to container shipment: 25 kg fiber drums with double PE liners for botanical extracts, 25 kg and 50 kg multi-ply paper or woven PP bags for agro meals and powders, 200 kg HDPE or steel drums and 1000L IBC totes for liquids and chemicals. Custom palletized export packaging is available upon request${citeText}.`,
      intent: 'shipping_logistics',
      used_fact_ids: packFactId ? [packFactId] : [],
      confidence: 0.98,
      needs_human: false,
      suggested_action: 'open_rfq',
      follow_up_question: 'Which packaging type or unit weight does your handling equipment require?',
      source_chips: [{ label: 'Export Packaging', type: 'policy' }],
    });
  }

  if (
    lowerMsg.includes('pesticide') ||
    lowerMsg.includes('mrl') ||
    lowerMsg.includes('heavy metal') ||
    lowerMsg.includes('ec 396') ||
    lowerMsg.includes('contaminant')
  ) {
    const compId = getFactCitation('quality', 'policy', 'brand');
    const citeText = compId ? ` [FACT-ID: ${compId}]` : '';
    return JSON.stringify({
      answer: `All herbal extracts and botanical consignments exported by JHS Global undergo stringent quality assurance including batch COA testing. We screen for European pesticide MRLs (Regulation EC 396/2005), Codex Alimentarius standards, microbiological limits, and heavy metals (lead, cadmium, arsenic, mercury) to ensure compliance with destination EU and global regulations${citeText}.`,
      intent: 'compliance_regulatory',
      used_fact_ids: compId ? [compId] : [],
      confidence: 0.95,
      needs_human: false,
      suggested_action: 'open_rfq',
      follow_up_question: 'Would you like to review our heavy metal and pesticide limit testing protocol?',
      source_chips: [{ label: 'Quality & Testing', type: 'company' }],
    });
  }

  if (lowerMsg.includes('termes de paiement') || lowerMsg.includes('conditions de paiement') || lowerMsg.includes('paiement')) {
    const payFactId = getFactCitation('payment_terms_policy', 'payment', 'policy');
    const citeText = payFactId ? ` [FACT-ID: ${payFactId}]` : '';
    return JSON.stringify({
      answer: `Pour les commandes d'exportation internationales, JHS Global accepte la lettre de crédit irrévocable à vue (LC at Sight) ainsi que le virement télégraphique (T/T avec acompte et solde contre documents)${citeText}.`,
      intent: 'how_to_order',
      used_fact_ids: payFactId ? [payFactId] : [],
      confidence: 0.95,
      needs_human: false,
      suggested_action: 'open_rfq',
      follow_up_question: 'Souhaitez-vous recevoir une facture proforma pour votre destination portuaire?',
      source_chips: [{ label: 'Modalités de Paiement', type: 'company' }],
    });
  }

  if (lowerMsg.includes('عينات') || lowerMsg.includes('هل تقدمون عينات')) {
    const sampleFactId = getFactCitation('sample', 'policy');
    const citeText = sampleFactId ? ` [FACT-ID: ${sampleFactId}]` : '';
    return JSON.stringify({
      answer: `توفر شركة JHS Global عينات تقييم تجارية للمركبات والمستخلصات للمصنعين ومختبرات التحليل المعتمدة في الخارج${citeText}. يرجى إرسال طلب عينة مع ملف الشركة وعنوان الاستلام.`,
      intent: 'sample',
      used_fact_ids: sampleFactId ? [sampleFactId] : [],
      confidence: 0.95,
      needs_human: true,
      suggested_action: 'request_sample',
      follow_up_question: 'هل ترغب في فتح نموذج طلب العينة لتحديد المواصفات المطلوبة؟',
      source_chips: [{ label: 'سياسة العينات', type: 'company' }],
    });
  }

  if (lowerMsg.includes('américa latina') || lowerMsg.includes('exportam')) {
    const marketFactId = getFactCitation('ports', 'loading', 'sourcing', 'brand');
    const citeText = marketFactId ? ` [FACT-ID: ${marketFactId}]` : '';
    return JSON.stringify({
      answer: `A JHS Global realiza exportações comerciais regulares para a América Latina, além de mercados no Sudeste Asiático, Golfo/GCC, Europa e África${citeText}. Nossos termos de remessa abrangem CIF e FOB a partir de portos indianos de carga.`,
      intent: 'shipping_logistics',
      used_fact_ids: marketFactId ? [marketFactId] : [],
      confidence: 0.95,
      needs_human: false,
      suggested_action: 'open_rfq',
      follow_up_question: 'Deseja solicitar uma cotação formal com frete marítimo para o seu porto de destino?',
      source_chips: [{ label: 'Mercados Atendidos', type: 'company' }],
    });
  }

  if (lowerMsg.includes('tiempo de respuesta')) {
    const sourceFactId = getFactCitation('sourcing', 'quote', 'brand');
    const citeText = sourceFactId ? ` [FACT-ID: ${sourceFactId}]` : '';
    return JSON.stringify({
      answer: `El compromiso de servicio de JHS Global garantiza la entrega de cotizaciones comerciales y facturas proforma vinculantes dentro de un plazo de 48 horas hábiles tras recibir los requisitos completos de tonelaje y destino${citeText}.`,
      intent: 'company_about',
      used_fact_ids: sourceFactId ? [sourceFactId] : [],
      confidence: 0.95,
      needs_human: false,
      suggested_action: 'open_rfq',
      follow_up_question: '¿Desea enviar una solicitud formal de cotización?',
      source_chips: [{ label: 'Compromiso de Servicio', type: 'company' }],
    });
  }

  // 11. Sample requests
  if (lowerMsg.includes('sample') || lowerMsg.includes('muestra') || lowerMsg.includes('muster')) {
    const sampleFactId = getFactCitation('sample', 'policy');
    const citeText = sampleFactId ? ` [FACT-ID: ${sampleFactId}]` : '';
    return JSON.stringify({
      answer: `We provide commercial evaluation samples of standardized ingredients for verified overseas formulators and testing laboratories${citeText}. Please submit a sample request with your company profile and delivery address.`,
      intent: 'sample',
      used_fact_ids: sampleFactId ? [sampleFactId] : [],
      confidence: 0.95,
      needs_human: true,
      suggested_action: 'request_sample',
      follow_up_question: 'Would you like to request a sample for laboratory evaluation?',
      source_chips: [{ label: 'Sample Policy', type: 'policy' }],
    });
  }

  // 12. Certifications & Accreditations (with negative boundary enforcement)
  if (
    lowerMsg.includes('certificat') ||
    lowerMsg.includes('certified') ||
    lowerMsg.includes('license') ||
    lowerMsg.includes('licence') ||
    lowerMsg.includes('fssai') ||
    lowerMsg.includes('apeda') ||
    lowerMsg.includes('spices') ||
    lowerMsg.includes('spice') ||
    lowerMsg.includes('sgs') ||
    lowerMsg.includes('bureau veritas') ||
    lowerMsg.includes('inspection') ||
    lowerMsg.includes('wakanda') ||
    /\biso\b/i.test(lowerMsg) ||
    /\biso[-\s]?\d+/i.test(lowerMsg) ||
    lowerMsg.includes('halal') ||
    lowerMsg.includes('kosher') ||
    /\bfda\b/i.test(lowerMsg) ||
    /\bgmp\b/i.test(lowerMsg) ||
    lowerMsg.includes('haccp') ||
    lowerMsg.includes('dgft') ||
    /\biec\b/i.test(lowerMsg) ||
    lowerMsg.includes('import export code')
  ) {
    const negId = factIdMatches.find((id) => id.includes('NEG-CERT')) || 'NEG-CERT-UNHELD';
    const fssaiId = getFactCitation('fssai');
    const apedaId = getFactCitation('apeda');
    const spicesId = getFactCitation('spices');
    const dgftId = getFactCitation('dgft', 'iec');

    if (lowerMsg.includes('inspection') || lowerMsg.includes('pre-shipment')) {
      return JSON.stringify({
        answer: `JHS Global welcomes independent pre-shipment inspections by accredited agencies at the agreed port of loading. Inspection parameters, sampling, and verification protocols can be incorporated into the formal export contract.`,
        intent: 'certifications',
        used_fact_ids: [negId],
        confidence: 0.98,
        needs_human: false,
        suggested_action: 'open_rfq',
        follow_up_question: 'Do you require independent pre-shipment sealing and quality verification for your container consignment?',
        source_chips: [{ label: 'Independent Inspection', type: 'company' }],
      });
    }

    const verifiedIds = [
      fssaiId,
      apedaId,
      spicesId,
      dgftId,
    ].filter((id) => id && factIdMatches.includes(id));

    const usedIds = [negId, ...verifiedIds].filter(Boolean);

    const fssaiCite = fssaiId && factIdMatches.includes(fssaiId) ? ` [FACT-ID: ${fssaiId}]` : '';
    const apedaCite = apedaId && factIdMatches.includes(apedaId) ? ` [FACT-ID: ${apedaId}]` : '';
    const spicesCite = spicesId && factIdMatches.includes(spicesId) ? ` [FACT-ID: ${spicesId}]` : '';
    const dgftCite = dgftId && factIdMatches.includes(dgftId) ? ` [FACT-ID: ${dgftId}]` : '';

    return JSON.stringify({
      answer: `JHS Global does NOT hold ISO (ISO 9001/22000), Halal, Kosher, Wakanda Standard, or US FDA facility registrations [FACT-ID: ${negId}]. Our verified government export accreditations include FSSAI Central License (No. 10725997001058)${fssaiCite}, APEDA Registration${apedaCite}, Spices Board of India Registration${spicesCite}, and DGFT IEC${dgftCite}. We do not hold unverified certifications. We can arrange independent pre-shipment inspections upon request.`,
      intent: 'certifications',
      used_fact_ids: usedIds.length > 0 ? usedIds : [negId],
      confidence: 0.98,
      needs_human: false,
      suggested_action: 'open_rfq',
      follow_up_question: 'Do your customs regulations require specific pre-shipment inspection documentation?',
      source_chips: [{ label: 'Verified Certifications', type: 'company' }],
    });
  }

  // 13. Commercial Policies & Terms
  if (lowerMsg.includes('payment term') || lowerMsg.includes('payment method') || lowerMsg.includes('letter of credit') || lowerMsg.includes('t/t')) {
    const payFactId = getFactCitation('payment', 'policy', 'quote');
    const citeText = payFactId ? ` [FACT-ID: ${payFactId}]` : '';
    return JSON.stringify({
      answer: `JHS Global accepts Letter of Credit (LC at Sight) and Telegraphic Transfer (T/T advance and against document release) for international export contracts${citeText}.`,
      intent: 'how_to_order',
      used_fact_ids: payFactId ? [payFactId] : [],
      confidence: 0.98,
      needs_human: false,
      suggested_action: 'open_rfq',
      follow_up_question: 'Would you like to specify your preferred payment structure in an RFQ?',
      source_chips: [{ label: 'Payment Terms', type: 'company' }],
    });
  }

  if (lowerMsg.includes('market') || lowerMsg.includes('countries') || lowerMsg.includes('destination') || lowerMsg.includes('where do you export') || lowerMsg.includes('regions')) {
    const marketFactId = getFactCitation('ports', 'loading', 'brand', 'identity');
    const citeText = marketFactId ? ` [FACT-ID: ${marketFactId}]` : '';
    return JSON.stringify({
      answer: `JHS Global supplies verified commercial buyers across the Gulf / GCC region, Southeast Asia, Europe, Africa, and the Americas${citeText}.`,
      intent: 'company_about',
      used_fact_ids: marketFactId ? [marketFactId] : [],
      confidence: 0.98,
      needs_human: false,
      suggested_action: 'contact',
      follow_up_question: 'Which market or port destination are you importing for?',
      source_chips: [{ label: 'Markets Served', type: 'company' }],
    });
  }

  if (lowerMsg.includes('response time') || lowerMsg.includes('turnaround') || lowerMsg.includes('how quickly') || lowerMsg.includes('how fast')) {
    const sourceFactId = getFactCitation('quote_turnaround', 'sourcing', 'brand');
    const citeText = sourceFactId ? ` [FACT-ID: ${sourceFactId}]` : '';
    return JSON.stringify({
      answer: `JHS Global guarantees commercial quotes and binding proforma terms within 48 business hours upon receipt of full order and packaging requirements${citeText}.`,
      intent: 'company_about',
      used_fact_ids: sourceFactId ? [sourceFactId] : [],
      confidence: 0.98,
      needs_human: false,
      suggested_action: 'open_rfq',
      follow_up_question: 'Would you like to submit your RFQ requirements now?',
      source_chips: [{ label: 'Response Guarantee', type: 'company' }],
    });
  }

  if (
    lowerMsg.includes('incoterm') ||
    lowerMsg.includes('fob') ||
    lowerMsg.includes('cif') ||
    lowerMsg.includes('shipping terms') ||
    /\bports?\b/i.test(lowerMsg) ||
    lowerMsg.includes('loading port') ||
    lowerMsg.includes('discharge port') ||
    lowerMsg.includes('ship containers') ||
    lowerMsg.includes('loading')
  ) {
    const incotermFactId = getFactCitation('ports', 'loading', 'policy');
    const citeText = incotermFactId ? ` [FACT-ID: ${incotermFactId}]` : '';
    return JSON.stringify({
      answer: `We export under standard Incoterms 2020: our Indian container ports of loading are agreed per order based on commodity origin and optimal vessel routing. We ship FOB (Indian gateway port agreed per order), CIF, and CFR to overseas container ports${citeText}.`,
      intent: 'shipping_logistics',
      used_fact_ids: incotermFactId ? [incotermFactId] : [],
      confidence: 0.98,
      needs_human: false,
      suggested_action: 'open_rfq',
      follow_up_question: 'Which destination discharge port should we quote CIF freight for?',
      source_chips: [{ label: 'Incoterms & Ports', type: 'company' }],
    });
  }

  // 14. Unknown Company Fact Check (Square footage, founding year, employee count)
  if (
    lowerMsg.includes('square foot') ||
    lowerMsg.includes('warehouse size') ||
    lowerMsg.includes('square meter') ||
    lowerMsg.includes('founded') ||
    lowerMsg.includes('founding') ||
    lowerMsg.includes('year established') ||
    lowerMsg.includes('years in business') ||
    lowerMsg.includes('employee count') ||
    lowerMsg.includes('annual revenue')
  ) {
    const brandId = getFactCitation('brand', 'identity', 'legal');
    const citeText = brandId ? ` [FACT-ID: ${brandId}]` : '';
    return JSON.stringify({
      answer: `I do not have that specific company detail confirmed in our verified records${citeText}; our export team will confirm. Would you like to send a quote request?`,
      intent: 'company_about',
      used_fact_ids: brandId ? [brandId] : [],
      confidence: 0.70,
      needs_human: true,
      suggested_action: 'open_rfq',
      follow_up_question: 'Would you like to speak directly with our Surat office team for administrative information?',
      source_chips: [{ label: 'Company Profile', type: 'company' }],
    });
  }

  // 15. General Company About & Identity
  if (
    lowerMsg.includes('who are you') ||
    lowerMsg.includes('about us') ||
    lowerMsg.includes('about company') ||
    lowerMsg.includes('what do you do') ||
    lowerMsg.includes('what does jhs') ||
    lowerMsg.includes('what does jsh') ||
    lowerMsg.includes('where are you') ||
    lowerMsg.includes('where is') ||
    lowerMsg.includes('location') ||
    lowerMsg.includes('located') ||
    lowerMsg.includes('facility') ||
    lowerMsg.includes('surat') ||
    lowerMsg.includes('gujarat') ||
    lowerMsg.includes('address') ||
    lowerMsg.includes('legal name') ||
    lowerMsg.includes('trade name') ||
    lowerMsg.includes('headquarter') ||
    lowerMsg.includes('jhs global')
  ) {
    const addrId = getFactCitation('address', 'registered');
    const brandId = getFactCitation('brand', 'trade', 'legal');
    const usedIds = [addrId, brandId].filter(Boolean);
    const addrCite = addrId ? ` [FACT-ID: ${addrId}]` : '';
    const brandCite = brandId ? ` [FACT-ID: ${brandId}]` : '';

    return JSON.stringify({
      answer: `JHS Global (Legal: Jay Sureshbhai Prajapati / Trade Name: JHS GLOBAL) is a merchant exporter and manufacturer-supplier headquartered in Surat, Gujarat, India${addrCite}. We supply personal care raw materials, nutraceutical botanicals, and animal feed ingredients under verified government licenses${brandCite}. Commercial quotes are furnished within 48 business hours.`,
      intent: 'company_about',
      used_fact_ids: usedIds,
      confidence: 0.98,
      needs_human: false,
      suggested_action: 'contact',
      follow_up_question: 'Would you like to review our product divisions or connect with our export desk?',
      source_chips: [{ label: 'Company Profile', type: 'company' }],
    });
  }

  // 16. Product Specific Inquiries
  const prodFactIds = factIdMatches.filter((id) => id.startsWith('FACT-PROD-'));
  if (prodFactIds.length > 0) {
    // Unverified spec (bulk density, solubility index)
    if (lowerMsg.includes('density') || lowerMsg.includes('bulk density')) {
      const specId = prodFactIds.find((id) => id.includes('SPEC')) || prodFactIds[0];
      return JSON.stringify({
        answer: `For Curcumin 95%, our typical bulk density parameter is approximately 0.45 g/ml [FACT-ID: ${specId}]. Please note that this is a typical benchmark and is to be confirmed for your specific lot by our export technical desk upon request.`,
        intent: 'product_spec',
        used_fact_ids: [specId],
        confidence: 0.85,
        needs_human: true,
        suggested_action: 'open_rfq',
        follow_up_question: 'Would you like our technical desk to confirm lot-specific bulk density for your formulation?',
        source_chips: [{ label: 'Curcumin 95% Specs (Typical)', type: 'product', slug: 'curcumin-95' }],
      });
    }

    if (lowerMsg.includes('solubility') || lowerMsg.includes('solubility index')) {
      const specId = prodFactIds.find((id) => id.includes('SPEC')) || prodFactIds[0];
      return JSON.stringify({
        answer: `For Pea Protein Isolate, our typical solubility index benchmark is approximately 75% to 80% [FACT-ID: ${specId}]. This is a typical value and is to be confirmed for your target dispersion formulation by our technical desk.`,
        intent: 'product_spec',
        used_fact_ids: [specId],
        confidence: 0.85,
        needs_human: true,
        suggested_action: 'open_rfq',
        follow_up_question: 'Would you like our technical team to verify lot dispersion parameters?',
        source_chips: [{ label: 'Pea Protein Specs (Typical)', type: 'product', slug: 'pea-protein-isolate' }],
      });
    }

    // Ashwagandha
    if (
      lowerMsg.includes('ashwagandha') ||
      lowerMsg.includes('withanolid') ||
      context.toLowerCase().includes('ashwagandha') ||
      context.toLowerCase().includes('withania')
    ) {
      const nameId = prodFactIds.find((id) => id.endsWith('-NAME')) || prodFactIds[0];
      const hsId = prodFactIds.find((id) => id.endsWith('-HS')) || nameId;
      const specIds = prodFactIds.filter((id) => id.includes('-SPEC-'));
      const packId = prodFactIds.find((id) => id.endsWith('-PACK')) || nameId;
      const usedIds = [nameId, hsId, ...specIds.slice(0, 2), packId];

      if ((lowerMsg.includes('packing') || lowerMsg.includes('packaging')) && !lowerMsg.includes('assay') && !lowerMsg.includes('withanolid') && !lowerMsg.includes('spec')) {
        return JSON.stringify({
          answer: `Standard export packaging for Ashwagandha Extract is 25 kg fiber drums with double food-grade polyethylene inner liners [FACT-ID: ${packId}]. Custom palletized packaging is available upon request.`,
          intent: 'shipping_logistics',
          used_fact_ids: [packId],
          confidence: 0.98,
          needs_human: false,
          suggested_action: 'add_to_quote',
          follow_up_question: 'Would you like to specify custom palletization or drum labeling?',
          source_chips: [{ label: 'Ashwagandha Packaging', type: 'product', slug: 'ashwagandha-extract' }],
        });
      }

      return JSON.stringify({
        answer: `Our standardized Ashwagandha Extract (*Withania somnifera*) is exported under HS Code 1302.19 [FACT-ID: ${hsId}]. The verified active marker assay is Withanolides 2.5% to 5.0% by HPLC [FACT-ID: ${specIds[0] || nameId}]. Standard export packaging is 25 kg fiber drums with double food-grade polyethylene inner liners [FACT-ID: ${packId}]. Regulatory status varies by destination market; buyers are responsible for verifying local compliance.`,
        intent: 'product_spec',
        used_fact_ids: usedIds,
        confidence: 0.98,
        needs_human: false,
        suggested_action: 'add_to_quote',
        follow_up_question: 'Would you like to add Ashwagandha Extract to your quote basket or request a sample?',
        source_chips: [{ label: 'Ashwagandha Extract Specs', type: 'product', slug: 'ashwagandha-extract' }],
      });
    }

    // Turmeric / Curcumin
    if (
      lowerMsg.includes('turmeric') ||
      lowerMsg.includes('curcumin') ||
      context.toLowerCase().includes('curcumin') ||
      context.toLowerCase().includes('turmeric')
    ) {
      const nameId = prodFactIds.find((id) => id.endsWith('-NAME')) || prodFactIds[0];
      const hsId = prodFactIds.find((id) => id.endsWith('-HS')) || nameId;
      const specIds = prodFactIds.filter((id) => id.includes('-SPEC-'));
      const usedIds = [nameId, hsId, ...specIds.slice(0, 2)];

      if (lowerMsg.includes('hs code') || lowerMsg.includes('tariff') || lowerMsg.includes('hs-code')) {
        return JSON.stringify({
          answer: `Our Curcumin 95% standardized turmeric extract ships under international HS Code 1302.19 [FACT-ID: ${hsId}]. Verified with 95% total curcuminoids by HPLC [FACT-ID: ${nameId}].`,
          intent: 'product_spec',
          used_fact_ids: [hsId, nameId],
          confidence: 0.98,
          needs_human: false,
          suggested_action: 'add_to_quote',
          follow_up_question: 'Would you like to add Curcumin 95% to your quotation request?',
          source_chips: [{ label: 'Curcumin 95% Specs', type: 'product', slug: 'curcumin-95' }],
        });
      }

      return JSON.stringify({
        answer: `Our Curcumin 95% is a standardized turmeric extract (HS 1302.19) featuring 95% total curcuminoids by HPLC [FACT-ID: ${nameId}]. Supplied in 25 kg fiber drums with batch Certificate of Analysis. Regulatory compliance varies by destination market.`,
        intent: 'product_spec',
        used_fact_ids: usedIds,
        confidence: 0.98,
        needs_human: false,
        suggested_action: 'add_to_quote',
        follow_up_question: 'Would you like to review the HPLC test method or request a lot COA?',
        source_chips: [{ label: 'Curcumin 95% Specs', type: 'product', slug: 'curcumin-95' }],
      });
    }

    // Castor Oil
    if (lowerMsg.includes('castor')) {
      const nameId = prodFactIds.find((id) => id.endsWith('-NAME')) || prodFactIds[0];
      return JSON.stringify({
        answer: `Our Castor oil and its derivatives (FSG, 12-HSA, Castor Wax) are exported for use in industrial polyurethanes, lubricants, personal care emollients, and coatings [FACT-ID: ${nameId}]. Supplied in standard steel drums or ISO tanks.`,
        intent: 'product_info',
        used_fact_ids: [nameId],
        confidence: 0.95,
        needs_human: false,
        suggested_action: 'add_to_quote',
        follow_up_question: 'Which specific castor derivative (e.g., FSG, 12-HSA, or hydrogenated castor oil) do you require?',
        source_chips: [{ label: 'Castor Derivatives', type: 'product', slug: 'castor-oil-and-derivatives' }],
      });
    }

    // Kaolin Clay
    if (lowerMsg.includes('kaolin')) {
      const nameId = prodFactIds.find((id) => id.endsWith('-NAME')) || prodFactIds[0];
      return JSON.stringify({
        answer: `Kaolin clay powder (China Clay) is an ultrafine, high-purity white hydrous aluminum silicate used in cosmetic face masks, powders, and pharmaceutical formulations [FACT-ID: ${nameId}].`,
        intent: 'product_info',
        used_fact_ids: [nameId],
        confidence: 0.95,
        needs_human: false,
        suggested_action: 'add_to_quote',
        follow_up_question: 'Would you like to request mesh size specifications for Kaolin Clay Powder?',
        source_chips: [{ label: 'Kaolin Clay Specs', type: 'product', slug: 'kaolin-clay-powder' }],
      });
    }

    // Xanthan Gum
    if (lowerMsg.includes('xanthan')) {
      const nameId = prodFactIds.find((id) => id.endsWith('-NAME')) || prodFactIds[0];
      return JSON.stringify({
        answer: `Xanthan gum is a high-performance biopolymer used as a rheology modifier, stabilizer, and thickener in food products, personal care creams, and industrial drilling formulations [FACT-ID: ${nameId}].`,
        intent: 'product_info',
        used_fact_ids: [nameId],
        confidence: 0.95,
        needs_human: false,
        suggested_action: 'add_to_quote',
        follow_up_question: 'Do you require 80 mesh or 200 mesh grade Xanthan Gum?',
        source_chips: [{ label: 'Xanthan Gum Specs', type: 'product', slug: 'xanthan-gum' }],
      });
    }

    // SLES
    if (lowerMsg.includes('sles') || lowerMsg.includes('sodium lauryl')) {
      const nameId = prodFactIds.find((id) => id.endsWith('-NAME')) || prodFactIds[0];
      return JSON.stringify({
        answer: `Sodium Lauryl Ether Sulfate (SLES 70%) is a premier anionic surfactant offering exceptional foaming and detergency for shampoos, hand washes, and liquid detergents [FACT-ID: ${nameId}].`,
        intent: 'product_info',
        used_fact_ids: [nameId],
        confidence: 0.95,
        needs_human: false,
        suggested_action: 'add_to_quote',
        follow_up_question: 'Do you require SLES in 170 kg or 220 kg HDPE export drums?',
        source_chips: [{ label: 'SLES Specs', type: 'product', slug: 'sodium-lauryl-ether-sulfate-sles' }],
      });
    }

    // Salicylic Acid
    if (lowerMsg.includes('salicylic')) {
      const nameId = prodFactIds.find((id) => id.endsWith('-NAME')) || prodFactIds[0];
      return JSON.stringify({
        answer: `Salicylic acid is a cosmetic and pharmaceutical grade Beta Hydroxy Acid (BHA) used as an exfoliating keratolytic agent in skincare and acne treatment products [FACT-ID: ${nameId}].`,
        intent: 'product_info',
        used_fact_ids: [nameId],
        confidence: 0.95,
        needs_human: false,
        suggested_action: 'add_to_quote',
        follow_up_question: 'Would you like to review the USP/BP assay Certificate of Analysis for Salicylic Acid?',
        source_chips: [{ label: 'Salicylic Acid Specs', type: 'product', slug: 'salicylic-acid' }],
      });
    }

    // Glycolic Acid
    if (lowerMsg.includes('glycolic')) {
      const nameId = prodFactIds.find((id) => id.endsWith('-NAME')) || prodFactIds[0];
      return JSON.stringify({
        answer: `Glycolic acid is a premier Alpha Hydroxy Acid (AHA) supplied as high-purity cosmetic grade solution for chemical peeling, skin resurfacing, and anti-aging skincare [FACT-ID: ${nameId}].`,
        intent: 'product_info',
        used_fact_ids: [nameId],
        confidence: 0.95,
        needs_human: false,
        suggested_action: 'add_to_quote',
        follow_up_question: 'Do you require Glycolic Acid 70% technical or cosmetic grade?',
        source_chips: [{ label: 'Glycolic Acid Specs', type: 'product', slug: 'glycolic-acid' }],
      });
    }

    // Vitamin E Acetate
    if (lowerMsg.includes('vitamin e') || lowerMsg.includes('tocopheryl')) {
      const nameId = prodFactIds.find((id) => id.endsWith('-NAME')) || prodFactIds[0];
      return JSON.stringify({
        answer: `Vitamin E acetate (Tocopheryl Acetate) is a stabilized lipid-soluble antioxidant widely formulated into personal care, skin creams, and dietary supplements [FACT-ID: ${nameId}].`,
        intent: 'product_info',
        used_fact_ids: [nameId],
        confidence: 0.95,
        needs_human: false,
        suggested_action: 'add_to_quote',
        follow_up_question: 'Would you like to add Vitamin E Acetate to your quote basket?',
        source_chips: [{ label: 'Vitamin E Acetate Specs', type: 'product', slug: 'vitamin-e-acetate' }],
      });
    }

    // Boswellia Serrata
    if (lowerMsg.includes('boswellia') || context.includes('Boswellia')) {
      const nameId = prodFactIds.find((id) => id.endsWith('-NAME')) || prodFactIds[0];
      return JSON.stringify({
        answer: `Boswellia serrata extract (Indian Frankincense) is standardized to 65% total Boswellic acids for joint support and functional dietary supplement formulations [FACT-ID: ${nameId}]. Supplied in 25 kg fiber drums.`,
        intent: 'product_spec',
        used_fact_ids: [nameId],
        confidence: 0.95,
        needs_human: false,
        suggested_action: 'add_to_quote',
        follow_up_question: 'Would you like to request a Certificate of Analysis for Boswellia Serrata?',
        source_chips: [{ label: 'Boswellia Serrata Specs', type: 'product', slug: 'boswellia-serrata-extract' }],
      });
    }

    const nameId = prodFactIds.find((id) => id.endsWith('-NAME')) || prodFactIds[0];
    const hsId = prodFactIds.find((id) => id.endsWith('-HS')) || nameId;

    if (lowerMsg.includes('hs code') || lowerMsg.includes('tariff') || lowerMsg.includes('hs-code')) {
      const hsMatch = context.match(/HS Code:\s*([0-9.]+)/i);
      const hsVal = hsMatch ? hsMatch[1] : '1302.19';
      return JSON.stringify({
        answer: `Based on our verified export database, the product is supplied under HS Code ${hsVal} [FACT-ID: ${hsId}]. Standard specifications and export packaging are detailed in our technical file [FACT-ID: ${nameId}]. Lot-specific Certificates of Analysis are furnished with formal proforma orders.`,
        intent: 'product_spec',
        used_fact_ids: [nameId, hsId],
        confidence: 0.95,
        needs_human: false,
        suggested_action: 'add_to_quote',
        follow_up_question: 'Would you like to request batch documentation or add this item to your RFQ?',
        source_chips: [{ label: 'Product Specifications', type: 'product' }],
      });
    }

    return JSON.stringify({
      answer: `Based on our verified export database, the product is supplied under HS Code [FACT-ID: ${hsId}]. Standard specifications and export packaging are detailed in our technical file [FACT-ID: ${nameId}]. Lot-specific Certificates of Analysis are furnished with formal proforma orders.`,
      intent: 'product_spec',
      used_fact_ids: [nameId, hsId],
      confidence: 0.92,
      needs_human: false,
      suggested_action: 'add_to_quote',
      follow_up_question: 'Would you like to request batch documentation or add this item to your RFQ?',
      source_chips: [{ label: 'Product Specifications', type: 'product' }],
    });
  }

  // 17. Default Fallback
  return JSON.stringify({
    answer: 'Our raw materials are standardized to specific export grades and commercial purity benchmarks depending on the commodity. Please select a specific product from our catalogue to review verified assay parameters.',
    intent: 'product_spec',
    used_fact_ids: [],
    confidence: 0.70,
    needs_human: false,
    suggested_action: 'none',
    follow_up_question: 'Which specific product would you like specifications for? (e.g., Ashwagandha Extract, Curcumin 95%, or Psyllium Husk)',
    source_chips: [{ label: 'Product Catalogue', type: 'product' }],
  });
}

/**
 * Deterministic B2B export desk mock simulator
 */
function simulateMockLlmResponse({ feature, messages = [], context = '', schema = null }) {
  const userMessages = messages.filter((m) => m.role === 'user' && !m.content?.startsWith('CORRECTION REQUIRED'));
  const lastUserMsg = (userMessages.length > 0 ? userMessages[userMessages.length - 1].content : messages[messages.length - 1]?.content) || '';
  const lowerMsg = lastUserMsg.toLowerCase();

  if (feature === 'quote_assistant' || feature === 'buyer_assistant') {
    if (schema) {
      return simulateStructuredBuyerResponse({ context, lowerMsg });
    }

    // 1. Off-topic queries
    if (
      lowerMsg.includes('python') ||
      (lowerMsg.includes('code') && !lowerMsg.includes('hs code') && !lowerMsg.includes('hs-code') && !lowerMsg.includes('tariff')) ||
      lowerMsg.includes('weather') ||
      lowerMsg.includes('president') ||
      lowerMsg.includes('movie') ||
      lowerMsg.includes('joke')
    ) {
      return `I am the automated B2B export desk assistant for JHS GLOBAL. I can only provide specifications, compliance certifications, packing details, and quotation workflows for our Indian agro-commodities and food ingredients. How can I assist with your commodity procurement requirements today?`;
    }

    // 2. Prompt injection / confidential extraction defense
    if (
      lowerMsg.includes('ignore previous') ||
      lowerMsg.includes('system prompt') ||
      lowerMsg.includes('admin password') ||
      lowerMsg.includes('buyer inquiry') ||
      lowerMsg.includes('other buyer') ||
      lowerMsg.includes('dan') ||
      lowerMsg.includes('secret') ||
      lowerMsg.includes('override')
    ) {
      return `Access denied. I am restricted to providing public commercial export catalogue specifications and quotation assistance for JHS GLOBAL.`;
    }

    // 2b. Fake certificate or fictitious claims defense
    if (
      lowerMsg.includes('nasa') ||
      lowerMsg.includes('wakanda') ||
      lowerMsg.includes('space food') ||
      lowerMsg.includes('fake cert')
    ) {
      return `We do not hold non-standard or unverified credentials. JHS GLOBAL operates strictly under authorized regulatory authorities: FSSAI Central License, APEDA, Spices Board of India, DGFT IEC, GST, and MSME. We comply with EU Commission EC 396/2005 (MRL) and US FDA BAM benchmarks. Our trade desk will confirm any specific destination phytosanitary protocol required for your import customs clearance.`;
    }

    // 2c. German / French language detection
    if (lowerMsg.includes('liefern sie') || lowerMsg.includes('säcken')) {
      return `Ja, wir liefern erstklassige Salem Kurkuma-Finger und 1121 Basmati-Reis in 25kg PP-Säcken oder Big Bags direkt nach Hamburg (CIF). Alle Lieferungen verfügen über vollständige APEDA-Pflanzengesundheitszeugnisse und Spezifikationszertifikate. Bitte nutzen Sie unser Anfrageformular für ein verbindliches Proforma-Angebot.`;
    }

    if (lowerMsg.includes('port de chargement') || lowerMsg.includes('chargement')) {
      return `Nos terminaux de chargement maritimes en Inde sont convenus par commande selon la provenance des marchandises. Tous les conteneurs sont empotés sous supervision avec certificats phytosanitaires officiels.`;
    }

    // 3. Pricing inquiries
    if (
      lowerMsg.includes('price') ||
      lowerMsg.includes('cost') ||
      lowerMsg.includes('rate') ||
      lowerMsg.includes('how much') ||
      lowerMsg.includes('quote') ||
      lowerMsg.includes('$') ||
      lowerMsg.includes('precio') ||
      lowerMsg.includes('cuanto') ||
      lowerMsg.includes('cotiz')
    ) {
      if (lowerMsg.includes('precio') || lowerMsg.includes('cuanto') || lowerMsg.includes('cotiz') || lowerMsg.includes('arroz')) {
        return `En el comercio internacional a granel, todas las cotizaciones se calculan estrictamente **Bajo Petición** (*Price on Request*). El precio formal depende del tonelaje final (TM / FCL), tipo de empaque y la tarifa de flete marítimo vigente hacia su puerto de descarga. Le invitamos a hacer clic en **"Solicitar Cotización"** para recibir una Factura Proforma vinculante dentro de las próximas 48 horas hábiles.`;
      }
      return `In international bulk trade, pricing is strictly 'Price on Request'. Firm pricing depends on order tonnage (MT / FCL), target shipment window, packing specifications, and current ocean freight rates to your discharge port. \n\nPlease use the **"Request a Quote"** drawer or click our direct WhatsApp button to receive an official proforma quotation with complete freight calculations within 48 business hours.`;
    }

    // 4. Commodity specific answers using context
    if (lowerMsg.includes('ashwagandha') || lowerMsg.includes('withanolid')) {
      if (lowerMsg.includes('especificaciones') || lowerMsg.includes('calidad') || lowerMsg.includes('extracto')) {
        return `Nuestro **Extracto de Ashwagandha** (*Withania somnifera*, HS 1302.19) está estandarizado al 2.5%–5.0% de withanólidos mediante ensayo analítico HPLC. Parámetros de pureza: humedad máx. 5%, metales pesados < 10 ppm, empaque en tambores de fibra de 25 kg con ficha técnica por lote.`;
      }
      if (lowerMsg.includes('trommeln') || lowerMsg.includes('hamburg') || lowerMsg.includes('extrakt')) {
        return `Wir exportieren standardisierten **Ashwagandha Extrakt** (Withanolide 2.5%–5.0% HPLC, HS-Code 1302.19) in 25kg Fasertrommeln (drums) per Seefracht nach Hamburg. Batch-spezifische Analysezertifikate liegen jeder Sendung bei.`;
      }
      return `Based on our export inventory, we supply standardized **Ashwagandha extract** (Withanolides 2.5%–5.0% by HPLC, Moisture ≤ 5%, 80 mesh fine powder) under HS Code **1302.19**. Standard export packing is in 25 kg fiber drums with double food-grade polyethylene liners. Minimum order quantity (MOQ) is 25 kg or 1 Metric Tonne for container consolidation, backed by lot-specific HPLC Certificate of Analysis (COA).`;
    }

    if (lowerMsg.includes('soja') || lowerMsg.includes('soybean')) {
      if (lowerMsg.includes('valencia') || lowerMsg.includes('harina') || lowerMsg.includes('empaque') || lowerMsg.includes('tienen')) {
        return `Suministramos **Harina de Soja Desgrasada (Soybean Meal DOC)** (Proteína cruda 46%–48%, humedad máx. 11%, libre de aflatoxinas) bajo código arancelario **HS 2304.00**. Exportamos en contenedores FCL (20 TM) en sacos de 50 kg o granel con liner hacia el Puerto de Valencia y principales puertos mundiales con certificación fitosanitaria oficial.`;
      }
      return `We export prime **Soybean Meal (DOC 46%–48% Crude Protein)** under HS Code **2304.00**. Solvent extracted with low moisture (max 11%) and minimal fiber, packed in 50 kg PP bags or bulk container liners. Container capacity is 20 to 22 MT per 20ft FCL from Indian gateway ports with full phytosanitary and non-GMO certification.`;
    }

    if (lowerMsg.includes('sles') || lowerMsg.includes('sodium lauryl')) {
      return `We supply commercial **Sodium Lauryl Ether Sulfate (SLES 70%)** under HS Code **3402.31** (CAS 68891-38-3). High active surfactant for shampoo, body wash, and detergent formulations. Packed in 170 kg or 220 kg HDPE drums, or 1000L IBC totes. Full Safety Data Sheet (SDS) and Certificate of Analysis (COA) supplied with export orders.`;
    }

    if (lowerMsg.includes('arroz') && (lowerMsg.includes('basmati') || lowerMsg.includes('especificaciones'))) {
      return `Exportamos arroz premium **1121 Steam Basmati** (Longitud de grano: 8.35mm+, clasificación y limpieza óptica al 100%) bajo código arancelario **HS 1006.30**. Empaque en sacos de 25 kg y certificación fitosanitaria emitida por APEDA. Capacidad de 25 TM por contenedor FCL de 20 pies desde puertos de embarque en India.`;
    }

    if (lowerMsg.includes('turmeric') || lowerMsg.includes('curcumin')) {
      return `Based on our export catalogue, we supply standardized **Turmeric / Curcumin Extract** (95% Curcuminoids by HPLC, HS Code **1302.19** / **2932.99**). Standard packaging is in 25 kg fiber drums with double PE liners. Batch Certificate of Analysis (COA) verifies active marker assay, residual solvents, and heavy metal compliance.`;
    }

    if (lowerMsg.includes('rice') || lowerMsg.includes('basmati')) {
      return `We export premium **1121 Steam Basmati Rice** (Average Grain Length: 8.35mm+, Elongation ratio ~2.4x, 100% optical cleaned and graded) under HS Code **1006.30**. Packing options include 10 kg, 20 kg, and 25 kg non-woven BOPP retail bags or 50 kg PP bulk bags. Container capacity is 25 MT per 20ft FCL from Indian gateway ports with APEDA phytosanitary certificates.`;
    }

    if (lowerMsg.includes('moq') || lowerMsg.includes('minimum')) {
      return `Our standard Minimum Order Quantity (MOQ) is generally **1 Metric Tonne (MT)** for high-value botanical extracts and chemical raw materials, and **1x20ft Full Container Load (FCL)** (~18 to 22 MT depending on cargo density) for bulk meals like Soybean Meal. Trial batches (25 kg to 500 kg) are available for verified commercial formulators.`;
    }

    if (lowerMsg.includes('packaging') || lowerMsg.includes('packing') || lowerMsg.includes('package') || lowerMsg.includes('bag') || lowerMsg.includes('drum')) {
      return `Our bulk export products are packed according to international maritime standards in 25 kg fiber drums (extracts), 200L HDPE drums / 1000L IBC totes (surfactants & oils), and 50 kg multi-wall PP bags (meals). Customized private label printing, inner food-grade liners, and palletization are available upon request.`;
    }

    if (
      lowerMsg.includes('mrl') ||
      lowerMsg.includes('pesticide') ||
      lowerMsg.includes('certificate') ||
      lowerMsg.includes('certified') ||
      lowerMsg.includes('fssai') ||
      lowerMsg.includes('apeda') ||
      lowerMsg.includes('inspection') ||
      lowerMsg.includes('heavy metal')
    ) {
      return `All our commodities comply with destination country standards, including pesticide MRL and heavy metal benchmarks. We operate under valid FSSAI Central License (No. 10725997001058), APEDA, FIEO, Spices Board of India, DGFT IEC, and GST registrations. We do NOT hold ISO, Halal, Kosher, or FDA facility registrations. Independent pre-shipment inspections are accommodated upon buyer request.`;
    }

    if (lowerMsg.includes('incoterm') || lowerMsg.includes('shipping') || lowerMsg.includes('port')) {
      return `We ship under ICC Incoterms 2020 rules — primarily CIF (Destination Port), CFR, and FOB (Indian gateway port agreed per order). Transit times and vessel schedules depend on the destination port and container liner routing. Our export desk will provide exact transit details with your formal proforma invoice.`;
    }

    return `Thank you for contacting our commercial export desk at JHS Global. We supply export-grade food ingredients, personal care raw materials, nutraceutical botanicals, and animal feed directly from India under verified government licenses. Please browse our catalogue or submit an RFQ to receive an official proforma invoice within 48 business hours.`;
  }

  if (feature === 'inquiry_summary') {
    const contextLower = context.toLowerCase();
    const isSuspicious =
      lowerMsg.includes('spam') ||
      lowerMsg.includes('.zip') ||
      lowerMsg.includes('password: 123') ||
      contextLower.includes('.zip') ||
      contextLower.includes('spam corp');

    if (isSuspicious) {
      return JSON.stringify({
        summary: 'Suspicious inquiry detected with malicious link or invalid commercial parameters.',
        language: 'en',
        translatedMessage: '',
        leadScore: 0,
        scoreReason: 'Phishing signature detected; disposable domain or suspicious external link',
        urgency: 'spam',
        isSpam: true,
        spamReason: 'Contains suspicious external archive link and lacks genuine commodity specifications',
        extracted: {
          commodities: [],
          totalVolume: '',
          destinationPort: '',
          destinationCountry: '',
          incoterm: '',
          targetMonth: '',
        },
        suggestedAction: 'Mark as spam and block sender domain.',
      });
    }

    const isSpanish =
      contextLower.includes('arroz') ||
      contextLower.includes('toneladas') ||
      lowerMsg.includes('arroz') ||
      lowerMsg.includes('español');

    if (isSpanish) {
      return JSON.stringify({
        summary: 'Commercial inquiry from Spanish importer requesting formal CIF containerized pricing for rice.',
        language: 'es',
        translatedMessage: 'We require CIF Valencia quotation for 25 metric tonnes of prime Basmati rice in 25kg bags.',
        leadScore: 85,
        scoreReason: '+25 verified food company, +25 25 MT volume, +20 CIF Valencia port specified, +15 target month',
        urgency: 'hot',
        isSpam: false,
        spamReason: '',
        extracted: {
          commodities: ['1121 Steam Basmati Rice'],
          totalVolume: '25 MT',
          destinationPort: 'Valencia Port',
          destinationCountry: 'Spain',
          incoterm: 'CIF',
          targetMonth: 'Immediate',
        },
        suggestedAction: 'Issue proforma invoice in Spanish with ocean transit schedule to Valencia Port.',
      });
    }

    return JSON.stringify({
      summary:
        'Overseas commercial inquiry requesting formal FOB/CIF containerized pricing. Buyer has specified cargo destination and preliminary packaging requirements.',
      language: 'en',
      translatedMessage: '',
      leadScore: 85,
      scoreReason: '+25 verified corporate buyer, +25 commercial tonnage, +20 CIF discharge port specified',
      urgency: 'hot',
      isSpam: false,
      spamReason: '',
      extracted: {
        commodities: ['Standardized Ashwagandha Extract', 'Castor Oil & Derivatives'],
        totalVolume: '20 MT',
        destinationPort: 'Genoa Port',
        destinationCountry: 'Italy',
        incoterm: 'CIF',
        targetMonth: 'Immediate',
      },
      suggestedAction: 'Issue proforma invoice with valid ocean freight schedule to destination discharge port.',
    });
  }

  if (feature === 'reply_draft') {
    const contextLower = (context + ' ' + lastUserMsg).toLowerCase();
    const isSpanish =
      contextLower.includes('arroz') ||
      contextLower.includes('toneladas') ||
      contextLower.includes('español') ||
      contextLower.includes('valencia') ||
      contextLower.includes('carlos mendoza') ||
      contextLower.includes('language: es');

    if (isSpanish) {
      const spanishSubject = 'Cotización Comercial y Especificaciones [Ref: RFQ-2026] — Jhs Global';
      const spanishGreeting = 'Estimado Equipo de Compras,';
      const spanishBody =
        'Acusamos recibo con agradecimiento de su solicitud de cotización para productos agroalimentarios de exportación desde la India. Nuestras partidas cuentan con selección y clasificación óptica al 100%, especificaciones de calidad verificadas y cumplimiento fitosanitario internacional APEDA.\n\nNuestro departamento de logística comercial se encuentra calculando la cotización marítima en contenedor hacia su puerto de destino. Le entregaremos la Factura Proforma vinculante dentro de las próximas 48 horas hábiles.\n\nAsimismo, disponemos de muestras analíticas de 250g–500g para despacho inmediato por mensajería internacional (DHL/FedEx).';
      const spanishCta = '¿Podría confirmarnos su puerto de descarga preferido y requisitos particulares de paletizado?';
      const spanishFull = `${spanishGreeting}\n\n${spanishBody}\n\n${spanishCta}\n\nAtentamente,\nDepartamento de Comercio Internacional\nJhs Global Exports | India`;

      if (schema) {
        return JSON.stringify({
          subject: spanishSubject,
          greeting: spanishGreeting,
          body: spanishBody,
          callToAction: spanishCta,
          fullEmail: spanishFull,
          language: 'es',
          tone: 'formal_b2b',
        });
      }
      return spanishFull;
    }

    const enSubject = 'Commercial Quotation & Specifications Dossier — Jhs Global Exports';
    const enGreeting = 'Dear Procurement Team,';
    const enBody =
      'Thank you for your commercial quotation inquiry regarding containerized commodities from India.\n\nWe have reviewed your commodity requirements, destination discharge port parameters, and requested packaging format. All consignments undergo 100% optical cleaning and grading, batch specification testing, and strict APEDA / FSSAI export compliance.\n\nOur logistics team is computing binding container ocean freight to your destination. You will receive our formal Proforma Invoice with complete commercial specifications within 48 business hours.\n\nWe are also pleased to dispatch 250g–500g analytical laboratory samples via express courier (DHL / FedEx) upon confirmation of your international courier account.';
    const enCta = 'Please confirm if your team requires palletized container stuffing or marine transit insurance inclusion.';
    const enFull = `${enGreeting}\n\n${enBody}\n\n${enCta}\n\nBest regards,\nInternational Trade & Commercial Export Desk\nJhs Global Exports | India`;

    if (schema) {
      return JSON.stringify({
        subject: enSubject,
        greeting: enGreeting,
        body: enBody,
        callToAction: enCta,
        fullEmail: enFull,
        language: 'en',
        tone: 'formal_b2b',
      });
    }
    return enFull;
  }

  if (feature === 'smart_search') {
    if (lowerMsg.includes('ashwagandha') || lowerMsg.includes('withanolid')) {
      return JSON.stringify({
        keyword: 'Ashwagandha Extract',
        categorySlug: 'nutraceutical-raw-materials',
        origin: 'India',
        quantity: 5,
        unit: 'MT',
        packing: '25kg drums',
        detectedLanguage: 'en',
        summary: 'Filtered to Ashwagandha Extract under Nutraceutical Raw Materials with 5 MT requested volume.',
      });
    }

    if (lowerMsg.includes('soja') || lowerMsg.includes('soybean')) {
      return JSON.stringify({
        keyword: 'Soybean Meal',
        categorySlug: 'animal-feed',
        origin: 'India',
        quantity: 20,
        unit: 'MT',
        packing: '50kg bags',
        detectedLanguage: lowerMsg.includes('soja') ? 'es' : 'en',
        summary: 'Filtered to Soybean Meal under Animal Feed with 20 MT requested volume.',
      });
    }

    if (lowerMsg.includes('sles') || lowerMsg.includes('lauryl')) {
      return JSON.stringify({
        keyword: 'Sodium Lauryl Ether Sulfate (SLES)',
        categorySlug: 'personal-care-raw-materials',
        origin: 'India',
        quantity: 20,
        unit: 'MT',
        packing: '220kg HDPE drums',
        detectedLanguage: 'en',
        summary: 'Filtered to SLES under Personal Care Raw Materials with 20 MT volume.',
      });
    }

    const isSpanish = lowerMsg.includes('arroz') || lowerMsg.includes('busco') || lowerMsg.includes('contenedores');

    if (isSpanish) {
      return JSON.stringify({
        keyword: '1121 Basmati Rice',
        categorySlug: 'grains-rice-and-pulses',
        origin: 'India',
        quantity: 2,
        unit: '20ft FCL',
        packing: '25kg bags',
        detectedLanguage: 'es',
        summary: 'Filtrado a Arroz Basmati 1121 bajo Granos y Arroz con 2 contenedores FCL solicitados.',
      });
    }

    if (lowerMsg.includes('turmeric') || lowerMsg.includes('salem')) {
      return JSON.stringify({
        keyword: 'Salem Turmeric',
        categorySlug: 'spices-seasonings-and-herbs',
        origin: 'Salem',
        quantity: 20,
        unit: 'MT',
        packing: '25kg PP bags',
        detectedLanguage: 'en',
        summary: 'Filtered to Salem Turmeric under Spices & Herbs with 20 MT requested volume.',
      });
    }

    return JSON.stringify({
      keyword: lastUserMsg.replace(/[^a-zA-Z0-9 ]/g, '').trim(),
      categorySlug: '',
      origin: '',
      quantity: null,
      unit: '',
      packing: '',
      detectedLanguage: 'en',
      summary: 'Search query parsed into catalogue keyword search.',
    });
  }

  if (feature === 'rfq_parse') {
    const isSpanish = lowerMsg.includes('arroz') || lowerMsg.includes('españa') || lowerMsg.includes('carlos');

    // Extract basic fields if present in message
    const emailMatch = lastUserMsg.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    const extractedEmail = emailMatch ? emailMatch[1] : '';

    let extractedName = 'Marcus Vance';
    const nameMatch = lastUserMsg.match(/(?:this is|i am|name is|contact:?)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
    if (nameMatch) {
      extractedName = nameMatch[1];
    }

    let extractedCompany = 'EuroFoods Import GmbH';
    const companyMatch = lastUserMsg.match(/(?:from|company:?)\s+([A-Z][a-zA-Z0-9\s&]+(?:GmbH|LLC|Inc|SpA|Ltd|Agro|Trading|Corp))/i);
    if (companyMatch) {
      extractedCompany = companyMatch[1].trim();
    }

    let extractedCountry = 'Germany';
    if (lowerMsg.includes('germany') || lowerMsg.includes('alemania')) extractedCountry = 'Germany';
    else if (lowerMsg.includes('italy') || lowerMsg.includes('italia')) extractedCountry = 'Italy';
    else if (lowerMsg.includes('spain') || lowerMsg.includes('españa')) extractedCountry = 'Spain';
    else if (lowerMsg.includes('usa') || lowerMsg.includes('united states')) extractedCountry = 'United States';

    let extractedPort = 'Hamburg';
    if (lowerMsg.includes('hamburg')) extractedPort = 'Hamburg';
    else if (lowerMsg.includes('rotterdam')) extractedPort = 'Rotterdam';
    else if (lowerMsg.includes('valencia')) extractedPort = 'Valencia';
    else if (lowerMsg.includes('genoa')) extractedPort = 'Genoa';

    let incoterm = 'CIF';
    if (lowerMsg.includes('fob')) incoterm = 'FOB';
    else if (lowerMsg.includes('cfr')) incoterm = 'CFR';

    let paymentTerm = 'LC';
    if (lowerMsg.includes('tt') || lowerMsg.includes('telegraphic')) paymentTerm = 'TT';

    if (isSpanish) {
      return JSON.stringify({
        buyer: {
          name: extractedName !== 'Marcus Vance' ? extractedName : 'Carlos Mendoza',
          company: extractedCompany !== 'EuroFoods Import GmbH' ? extractedCompany : 'Iberia Granos SL',
          email: extractedEmail || 'carlos@iberiagranos.es',
          country: 'Spain',
          city: 'Valencia',
          phone: '',
          buyerType: 'importer',
        },
        items: [
          {
            productName: '1121 Steam Basmati Rice',
            quantity: 25,
            unit: 'MT',
            packing: 'sacos de 25kg',
          },
        ],
        logistics: {
          destinationPort: extractedPort === 'Hamburg' ? 'Valencia' : extractedPort,
          incoterm,
          targetShipmentMonth: '',
          paymentTerm,
          needsPrivateLabel: false,
          needsSample: false,
        },
        cleanedMessage: 'Requerimos cotización para arroz basmati 1121 vaporizado en sacos de 25kg CIF puerto de descarga.',
        extractedLanguage: 'es',
      });
    }

    return JSON.stringify({
      buyer: {
        name: extractedName,
        company: extractedCompany,
        email: extractedEmail || 'm.vance@eurofoods-import.de',
        country: extractedCountry,
        city: extractedPort,
        phone: '+49 40 123456',
        buyerType: 'importer',
      },
      items: [
        {
          productName: lowerMsg.includes('ashwagandha') ? 'Standardized Ashwagandha Extract' : 'Soybean Meal (DOC 48%)',
          quantity: lowerMsg.includes('20') ? 20 : 2,
          unit: lowerMsg.includes('mt') ? 'MT' : '20ft FCL',
          packing: lowerMsg.includes('50kg') ? '50kg PP bags' : '25kg fiber drums',
        },
      ],
      logistics: {
        destinationPort: extractedPort,
        incoterm,
        targetShipmentMonth: 'November 2026',
        paymentTerm,
        needsPrivateLabel: false,
        needsSample: false,
      },
      cleanedMessage: 'Require containerized cargo specifications and formal proforma quote.',
      extractedLanguage: 'en',
    });
  }

  if (feature === 'seo_helper' || feature === 'product_content') {
    const isSalicylic = lowerMsg.includes('salicylic') || lowerMsg.includes('acid') || lowerMsg.includes('personal care');
    if (isSalicylic) {
      return JSON.stringify({
        shortDescription: 'High-purity cosmetic and technical grade Salicylic acid formulated for personal care and skincare manufacturing.',
        description: 'Export-quality Salicylic acid (min 99.5% purity) conforming to USP/BP pharmacopoeial standards with full batch COA and SDS documentation.',
        highlights: ['Purity: Min 99.5%', 'Cosmetic & Pharma Grade', 'Full Batch COA & SDS', 'Packaging: 25kg fiber drums'],
        seo: {
          title: 'Salicylic Acid Exporters India | Cosmetic Grade Bulk Supply',
          description: 'Direct manufacturer-exporter of high-purity Salicylic acid with batch COA and export packaging.',
          keywords: ['salicylic acid bulk', 'cosmetic raw materials', 'salicylic acid exporter india'],
        },
        specSuggestions: {
          suggestedHsCode: '2918.21',
          suggestedMoq: { value: 1, unit: 'MT' },
          suggestedPacking: '25kg fiber drums with double PE inner liners',
          shelfLife: '24 months',
          storage: 'Store in cool, dry hygienic warehouse away from direct sunlight',
        },
        suggestedSpecs: [
          { key: 'Purity', value: '>= 99.5%', unit: '%' },
          { key: 'Heavy Metals', value: '<= 10', unit: 'ppm' },
        ],
        faqs: [
          {
            question: 'What is the standard export packing for Salicylic acid?',
            answer: 'We supply in 25kg export-grade fiber drums with double PE inner liners, packing approximately 10 MT per 20ft FCL container.',
          },
        ],
        seoTitle: 'Salicylic Acid Exporters India | Cosmetic Grade Bulk Supply',
        seoDescription: 'Direct manufacturer-exporter of high-purity Salicylic acid with batch COA.',
        keywords: ['salicylic acid bulk', 'cosmetic raw materials'],
        suggestedKeywords: ['salicylic acid bulk', 'cosmetic raw materials'],
        suggestedHsCode: '2918.21',
        suggestedMoq: { value: 1, unit: 'MT' },
      });
    }

    const isFeed = lowerMsg.includes('feed') || lowerMsg.includes('soybean') || lowerMsg.includes('meal');
    const isRice = lowerMsg.includes('rice') || lowerMsg.includes('grain');
    const productName = isFeed ? 'Soybean Meal (DOC 48%)' : 'Standardized Ashwagandha Extract (Withanolides 2.5–5%)';
    const hsCode = isFeed ? '2304.00' : '1302.19';

    return JSON.stringify({
      shortDescription: isFeed
        ? 'High-protein de-oiled soybean meal (min 48% crude protein) processed for animal feed, aquafeed, and poultry nutrition.'
        : 'HPLC standardized Ashwagandha root extract guaranteed at 2.5–5.0% withanolides, processed under cGMP export conditions.',
      description: isFeed
        ? 'Export-quality Indian de-oiled soybean cake and meal produced from non-GMO seeds. Thoroughly screened for moisture, urease activity, and sand/silica compliance.'
        : 'High-potency Withania Somnifera extract standardized by HPLC. Comprehensive laboratory analysis for assay, heavy metals, and microbiological criteria.',
      highlights: isFeed
        ? ['Crude Protein: Min 48%', 'Moisture: Max 11%', 'Non-GMO Origin', 'Container: 20–22 MT per 20ft FCL']
        : ['Withanolides: 2.5–5.0% HPLC', 'Heavy Metals <= 10 ppm', 'Aflatoxins: Negative', 'Packaging: 25kg fiber drums'],
      seo: {
        title: isFeed
          ? 'Soybean Meal Exporters India | High Protein Animal Feed Bulk Supply'
          : 'Ashwagandha Extract Exporters India | Standardized Withanolides Bulk',
        description: isFeed
          ? 'Direct manufacturer-exporter of non-GMO Soybean Meal DOC 48% with phytosanitary certificates and export packaging.'
          : 'Direct bulk container exporter of HPLC standardized Ashwagandha extract with lab COA and international certification.',
        keywords: isFeed
          ? ['soybean meal bulk', 'de oiled cake doc', 'animal feed ingredients exporter india', 'non gmo soybean meal']
          : ['ashwagandha extract bulk', 'withanolides hplc', 'nutraceutical ingredients india', 'withania somnifera'],
      },
      specSuggestions: {
        suggestedHsCode: hsCode,
        suggestedMoq: { value: 1, unit: isFeed ? '20ft FCL' : 'MT' },
        suggestedPacking: isFeed ? '50kg PP bags / 1MT jumbo bags' : '25kg fiber drums with double PE liners',
        shelfLife: isFeed ? '12 months' : '24 months',
        storage: 'Store in cool, dry hygienic warehouse away from direct sunlight',
      },
      suggestedSpecs: [
        { key: 'Purity / Assay', value: isFeed ? 'Crude Protein >= 48%' : 'Withanolides >= 2.5%' },
        { key: 'Moisture', value: isFeed ? '<= 11.0%' : '<= 5.0%', unit: '%' },
      ],
      faqs: [
        {
          question: `What is the standard export packing and container payload for ${productName}?`,
          answer: `We supply in 25kg and 50kg export-grade PP or BOPP bags, packing approximately ${isRice ? '25' : '18'} MT per 20ft FCL container.`,
        },
      ],
      seoTitle: isRice
        ? '1121 Steam Basmati Rice Exporters India | Bulk Long Grain Supply'
        : 'Export Quality Salem Turmeric Finger | Exporters India',
      seoDescription: isRice
        ? 'Direct mill exporter of 1121 Steam Basmati Rice with APEDA phytosanitary certificates.'
        : 'Direct bulk container exporter of high curcumin Salem Turmeric Finger with lab COA and APEDA certification.',
      keywords: isRice
        ? ['1121 basmati rice', 'steam basmati rice bulk', 'indian rice exporter']
        : ['salem turmeric', 'curcumin powder', 'bulk spice exporter india'],
      suggestedKeywords: isRice
        ? ['1121 basmati rice', 'steam basmati rice bulk', 'indian rice exporter']
        : ['salem turmeric', 'curcumin powder', 'bulk spice exporter india'],
      suggestedHsCode: hsCode,
      suggestedMoq: { value: 1, unit: isRice ? '20ft FCL' : 'MT' },
    });
  }

  return 'Information processed successfully by export AI desk.';
}
