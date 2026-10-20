import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from '../../components/layout/Header';
import { QuoteBasketContext } from '../../features/quoteBasket/context';

const renderHeader = ({ basketValue } = {}) => {
  const defaultBasket = {
    addItem: vi.fn(),
    items: [],
    totalItemCount: 2,
    setIsDrawerOpen: vi.fn(),
  };

  const contextValue = { ...defaultBasket, ...basketValue };

  const renderResult = render(
    <MemoryRouter>
      <QuoteBasketContext.Provider value={contextValue}>
        <Header />
      </QuoteBasketContext.Provider>
    </MemoryRouter>
  );

  return { ...renderResult, contextValue };
};

describe('UI Component: Header Suite', () => {
  it('renders brand name and main navigation links', () => {
    renderHeader();

    expect(screen.getByText(/JHS GLOBAL/i)).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('opens Quote Drawer when clicking the "Request a Quote" CTA button', () => {
    const setIsDrawerOpen = vi.fn();
    renderHeader({ basketValue: { setIsDrawerOpen } });

    const requestQuoteButton = screen.getByRole('button', { name: /Request a Quote/i });
    expect(requestQuoteButton).toBeInTheDocument();

    fireEvent.click(requestQuoteButton);
    expect(setIsDrawerOpen).toHaveBeenCalledWith(true);
  });

  it('opens Quote Drawer when clicking the shopping bag quote basket button', () => {
    const setIsDrawerOpen = vi.fn();
    renderHeader({ basketValue: { setIsDrawerOpen, totalItemCount: 3 } });

    const basketTrigger = screen.getByRole('button', { name: /View Quote Basket/i });
    expect(basketTrigger).toBeInTheDocument();

    fireEvent.click(basketTrigger);
    expect(setIsDrawerOpen).toHaveBeenCalledWith(true);
  });
});
