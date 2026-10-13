import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProductCard from '../../components/product/ProductCard';
import { QuoteBasketContext } from '../../features/quoteBasket/context';

const mockProduct = {
  id: 101,
  name: 'Salem Pure Turmeric Fingers',
  slug: 'salem-turmeric',
  hsCode: '0910.30',
  shortDescription: 'High curcumin export grade turmeric fingers sourced from Tamil Nadu.',
  origin: ['India'],
  moq: { value: 18, unit: 'MT' },
  packing: [{ type: 'PP Bags', size: '25 kg' }],
  isFeatured: true,
  images: [{ url: 'https://example.com/turmeric.jpg' }],
};

const renderWithProviders = (ui, { basketValue } = {}) => {
  const defaultBasket = {
    addItem: vi.fn(),
    items: [],
    totalItemCount: 0,
    setIsDrawerOpen: vi.fn(),
  };

  return render(
    <MemoryRouter>
      <QuoteBasketContext.Provider value={basketValue || defaultBasket}>
        {ui}
      </QuoteBasketContext.Provider>
    </MemoryRouter>
  );
};

describe('UI Component: ProductCard Suite', () => {
  it('renders product name, HS code, and export specifications correctly', () => {
    renderWithProviders(<ProductCard product={mockProduct} />);

    expect(screen.getByRole('heading', { name: /Salem Pure Turmeric Fingers/i })).toBeInTheDocument();
    expect(screen.getByText('HS 0910.30')).toBeInTheDocument();
    expect(screen.getByText(/18 MT/i)).toBeInTheDocument();
    expect(screen.getByText(/PP Bags \(25 kg\)/i)).toBeInTheDocument();
  });

  it('renders fallback placeholder icon when product image is not provided', () => {
    const productWithoutImage = { ...mockProduct, images: [] };
    renderWithProviders(<ProductCard product={productWithoutImage} />);

    expect(screen.getByText('Specification on Request')).toBeInTheDocument();
  });

  it('triggers addItem when "Add to Quote" button is clicked', () => {
    const addItemMock = vi.fn();
    renderWithProviders(<ProductCard product={mockProduct} />, {
      basketValue: {
        addItem: addItemMock,
        items: [],
        totalItemCount: 0,
        setIsDrawerOpen: vi.fn(),
      },
    });

    const quoteButton = screen.getByRole('button', { name: /Quote/i });
    fireEvent.click(quoteButton);

    expect(addItemMock).toHaveBeenCalledTimes(1);
    expect(addItemMock).toHaveBeenCalledWith(mockProduct, 1, 'MT');
  });
});
