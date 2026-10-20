import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProductShowcaseMarquee from '../../components/home/ProductShowcaseMarquee';
import { SHOWCASE_PRODUCTS } from '../../data/productShowcase';

const renderComponent = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ProductShowcaseMarquee />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('UI Component: ProductShowcaseMarquee Suite', () => {
  it('renders section eyebrow, heading, and link to products page', () => {
    renderComponent();

    expect(screen.getByText(/EXPORT COMMODITY PORTFOLIO/i)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Direct Sourcing Across 3 Core Export Divisions/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Explore Full 20\+ Commodity Catalogue/i })
    ).toHaveAttribute('href', '/products');
  });

  it('renders the marquee track with hardware-accelerated right-to-left animation', () => {
    renderComponent();

    const track = screen.getByTestId('product-marquee-track');
    expect(track).toBeInTheDocument();
    expect(track.className).toContain('animate-product-marquee');
    expect(track.className).toContain('hover:[animation-play-state:paused]');
    expect(track.className).toContain('motion-reduce:animate-none');
  });

  it('renders circular product images and names for core commodities', () => {
    renderComponent();

    // Check specific products
    expect(screen.getAllByText('Castor Oil')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Ashwagandha')[0]).toBeInTheDocument();
    expect(screen.getAllByText('SLES 70%')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Curcumin 95%')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Soybean Meal')[0]).toBeInTheDocument();

    // Verify circular image attributes for Castor Oil
    const castorLink = screen.getByTestId('marquee-product-castor-oil-and-derivatives');
    expect(castorLink).toBeInTheDocument();
    expect(castorLink).toHaveAttribute('href', '/products/castor-oil-and-derivatives');

    const castorImg = castorLink.querySelector('img');
    expect(castorImg).toBeInTheDocument();
    expect(castorImg).toHaveAttribute('src', '/images/products/castor-oil-and-derivatives.webp');
    expect(castorImg).toHaveAttribute('width', '88');
    expect(castorImg).toHaveAttribute('height', '88');
    expect(castorImg.className).toContain('rounded-full');
  });

  it('contains all 20 commodities in the showcase dataset', () => {
    expect(SHOWCASE_PRODUCTS).toHaveLength(20);
  });
});
