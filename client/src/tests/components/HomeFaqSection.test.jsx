import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomeFaqSection from '../../components/home/HomeFaqSection';
import * as trustHooks from '../../features/trust/hooks';

const mockFeaturedFaqs = [
  {
    id: 1,
    slug: 'standard-minimum-order-quantity-moq',
    question: 'What is your standard Minimum Order Quantity (MOQ)?',
    answer: 'Our standard export minimum order quantity is one 20ft Full Container Load (FCL).',
    group: 'Ordering & Minimum Quantities (MOQ)',
    showOnHome: true,
    homeOrder: 1,
  },
  {
    id: 2,
    slug: 'standard-export-packing-private-label-oem',
    question: 'What packaging options and private label OEM branding do you provide?',
    answer: 'We supply high-barrier multi-wall paper bags, HDPE drums, and customized private-label packaging.',
    group: 'Packaging, Labelling & Private Label',
    showOnHome: true,
    homeOrder: 2,
  },
  {
    id: 3,
    slug: 'commercial-payment-terms-lc-tt',
    question: 'What commercial payment terms do you accept for exports?',
    answer: 'We accept Irrevocable Letter of Credit (L/C at sight) and Telegraphic Transfer (T/T).',
    group: 'Payments, Banking & Commercial Terms',
    showOnHome: true,
    homeOrder: 3,
  },
];

const renderHomeFaqSection = () => {
  return render(
    <MemoryRouter>
      <HomeFaqSection />
    </MemoryRouter>
  );
};

describe('UI Component: HomeFaqSection Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(trustHooks, 'useFeaturedFaqs').mockReturnValue({
      data: mockFeaturedFaqs,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
  });

  it('renders section title, subtitle, and link to full /faq page', () => {
    renderHomeFaqSection();

    expect(screen.getByRole('heading', { name: /Clear Answers Before You Order/i })).toBeInTheDocument();
    expect(screen.getByText(/PROCUREMENT CLARITY/i)).toBeInTheDocument();

    const viewAllLink = screen.getByRole('link', { name: /View All FAQs/i });
    expect(viewAllLink).toBeInTheDocument();
    expect(viewAllLink).toHaveAttribute('href', '/faq');
  });

  it('renders featured FAQs and opens first question by default', () => {
    renderHomeFaqSection();

    const firstTrigger = screen.getByRole('button', {
      name: /What is your standard Minimum Order Quantity \(MOQ\)\?/i,
    });
    const secondTrigger = screen.getByRole('button', {
      name: /What packaging options and private label OEM branding do you provide\?/i,
    });

    // First question is open by default
    expect(firstTrigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/Our standard export minimum order quantity is one 20ft/i)).toBeInTheDocument();

    // Second question is closed
    expect(secondTrigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('toggles accordion items on user click', () => {
    renderHomeFaqSection();

    const secondTrigger = screen.getByRole('button', {
      name: /What packaging options and private label OEM branding do you provide\?/i,
    });

    fireEvent.click(secondTrigger);

    expect(secondTrigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/We supply high-barrier multi-wall paper bags/i)).toBeInTheDocument();

    // Clicking it again closes it
    fireEvent.click(secondTrigger);
    expect(secondTrigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders deep link to full FAQ for each question', () => {
    renderHomeFaqSection();

    const deepLinks = screen.getAllByRole('link', { name: /Deep-link to this question in full FAQ/i });
    expect(deepLinks.length).toBeGreaterThan(0);
    expect(deepLinks[0]).toHaveAttribute('href', '/faq#standard-minimum-order-quantity-moq');
  });

  it('renders skeleton loading state while fetching', () => {
    vi.spyOn(trustHooks, 'useFeaturedFaqs').mockReturnValue({
      data: [],
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    });

    renderHomeFaqSection();

    expect(screen.getByLabelText(/Loading featured FAQs/i)).toBeInTheDocument();
  });

  it('renders error state with retry on failure', () => {
    const refetchMock = vi.fn();
    vi.spyOn(trustHooks, 'useFeaturedFaqs').mockReturnValue({
      data: [],
      isLoading: false,
      isError: true,
      refetch: refetchMock,
    });

    renderHomeFaqSection();

    expect(screen.getByText(/Unable to load frequently asked questions/i)).toBeInTheDocument();
    const retryBtn = screen.getByRole('button', { name: /Retry/i });
    fireEvent.click(retryBtn);
    expect(refetchMock).toHaveBeenCalledTimes(1);
  });
});
