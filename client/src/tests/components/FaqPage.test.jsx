import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import FaqPage from '../../pages/Faq';
import * as trustHooks from '../../features/trust/hooks';

// Mock FAQ fixtures
const mockFaqs = [
  {
    id: 1,
    slug: 'standard-minimum-order-quantity-moq',
    question: 'What is your standard Minimum Order Quantity (MOQ)?',
    answer: 'Our standard export minimum order quantity is one 20ft Full Container Load (FCL).',
    group: 'Ordering & Minimum Quantities (MOQ)',
    order: 1,
  },
  {
    id: 2,
    slug: 'certificate-of-analysis-coa-specifications',
    question: 'Do you provide batch-specific Certificate of Analysis (COA)?',
    answer: 'Every commercial consignment is dispatched with a factory COA matching USP/BP standards.',
    group: 'Regulatory, COA & Compliance',
    order: 2,
  },
  {
    id: 3,
    slug: 'commercial-payment-terms-lc-tt',
    question: 'What commercial payment terms do you accept for exports?',
    answer: 'We accept Irrevocable Letter of Credit (L/C at sight) and Telegraphic Transfer (T/T).',
    group: 'Payments, Banking & Commercial Terms',
    order: 3,
  },
];

const renderFaqPage = (initialEntries = ['/faq']) => {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <FaqPage />
      </MemoryRouter>
    </HelmetProvider>
  );
};

describe('UI Component: FaqPage Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(trustHooks, 'useFaqs').mockReturnValue({
      data: mockFaqs,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
  });

  it('renders page header, search input, category chips, and FAQ accordion items', () => {
    renderFaqPage();

    expect(screen.getByRole('heading', { name: /Frequently Asked Questions/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search by keyword/i)).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /All Categories/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Ordering & MOQ/i })).toBeInTheDocument();

    // Verify all 3 test questions are rendered
    expect(screen.getByText('What is your standard Minimum Order Quantity (MOQ)?')).toBeInTheDocument();
    expect(screen.getByText('Do you provide batch-specific Certificate of Analysis (COA)?')).toBeInTheDocument();
    expect(screen.getByText('What commercial payment terms do you accept for exports?')).toBeInTheDocument();
  });

  it('toggles accordion item and updates aria-expanded on click', () => {
    renderFaqPage();

    const triggerBtn = screen.getByRole('button', {
      name: /What is your standard Minimum Order Quantity \(MOQ\)\?/i,
    });

    expect(triggerBtn).toHaveAttribute('aria-expanded', 'false');

    // Click to open
    fireEvent.click(triggerBtn);
    expect(triggerBtn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/Our standard export minimum order quantity is one 20ft/i)).toBeInTheDocument();

    // Click again to close
    fireEvent.click(triggerBtn);
    expect(triggerBtn).toHaveAttribute('aria-expanded', 'false');
  });

  it('filters questions accurately when searching by keyword', () => {
    renderFaqPage();

    const searchInput = screen.getByPlaceholderText(/Search by keyword/i);
    fireEvent.change(searchInput, { target: { value: 'COA' } });

    // COA question should remain visible
    expect(screen.getByText('Do you provide batch-specific Certificate of Analysis (COA)?')).toBeInTheDocument();

    // Non-matching questions should be filtered out
    expect(screen.queryByText('What is your standard Minimum Order Quantity (MOQ)?')).not.toBeInTheDocument();
    expect(screen.queryByText('What commercial payment terms do you accept for exports?')).not.toBeInTheDocument();
  });

  it('clears search when clear button is clicked', () => {
    renderFaqPage();

    const searchInput = screen.getByPlaceholderText(/Search by keyword/i);
    fireEvent.change(searchInput, { target: { value: 'Payment' } });

    expect(screen.getByText('What commercial payment terms do you accept for exports?')).toBeInTheDocument();
    expect(screen.queryByText('What is your standard Minimum Order Quantity (MOQ)?')).not.toBeInTheDocument();

    const clearBtn = screen.getByRole('button', { name: /Clear search query/i });
    fireEvent.click(clearBtn);

    expect(searchInput.value).toBe('');
    expect(screen.getByText('What is your standard Minimum Order Quantity (MOQ)?')).toBeInTheDocument();
  });

  it('filters by category tab when clicked', () => {
    renderFaqPage();

    const orderingTab = screen.getByRole('tab', { name: /Ordering & MOQ/i });
    fireEvent.click(orderingTab);

    expect(screen.getByText('What is your standard Minimum Order Quantity (MOQ)?')).toBeInTheDocument();
    expect(screen.queryByText('Do you provide batch-specific Certificate of Analysis (COA)?')).not.toBeInTheDocument();
  });

  it('toggles Expand All and Collapse All', () => {
    renderFaqPage();

    const expandAllBtn = screen.getByRole('button', { name: /Expand all visible questions/i });
    fireEvent.click(expandAllBtn);

    const buttons = [
      screen.getByRole('button', { name: /What is your standard Minimum Order Quantity/i }),
      screen.getByRole('button', { name: /Do you provide batch-specific Certificate of Analysis/i }),
      screen.getByRole('button', { name: /What commercial payment terms do you accept/i }),
    ];
    buttons.forEach((btn) => {
      expect(btn).toHaveAttribute('aria-expanded', 'true');
    });

    // Button should now read Collapse All
    const collapseAllBtn = screen.getByRole('button', { name: /Collapse all visible questions/i });
    fireEvent.click(collapseAllBtn);

    buttons.forEach((btn) => {
      expect(btn).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('shows empty state when search term yields zero results', () => {
    renderFaqPage();

    const searchInput = screen.getByPlaceholderText(/Search by keyword/i);
    fireEvent.change(searchInput, { target: { value: 'nonexistent-query-xyz' } });

    expect(screen.getByText(/No matching questions found/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset All Filters/i })).toBeInTheDocument();
  });

  it('renders skeleton loading state while fetching', () => {
    vi.spyOn(trustHooks, 'useFaqs').mockReturnValue({
      data: [],
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    });

    renderFaqPage();

    expect(screen.getByLabelText(/Loading questions/i)).toBeInTheDocument();
  });

  it('renders error state with retry button on failure', () => {
    const refetchMock = vi.fn();
    vi.spyOn(trustHooks, 'useFaqs').mockReturnValue({
      data: [],
      isLoading: false,
      isError: true,
      refetch: refetchMock,
    });

    renderFaqPage();

    expect(screen.getByText(/Unable to load FAQ knowledge base/i)).toBeInTheDocument();
    const retryBtn = screen.getByRole('button', { name: /Retry Loading FAQs/i });
    fireEvent.click(retryBtn);
    expect(refetchMock).toHaveBeenCalledTimes(1);
  });
});
