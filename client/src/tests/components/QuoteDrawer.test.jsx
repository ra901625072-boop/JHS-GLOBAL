import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import QuoteDrawer from '../../components/rfq/QuoteDrawer';
import { QuoteBasketContext } from '../../features/quoteBasket/context';

const renderDrawerWithContext = (contextValue) => {
  return render(
    <MemoryRouter>
      <QuoteBasketContext.Provider value={contextValue}>
        <QuoteDrawer />
      </QuoteBasketContext.Provider>
    </MemoryRouter>
  );
};

describe('UI Component: QuoteDrawer Suite', () => {
  it('renders empty quote basket state when no items are added', () => {
    const contextValue = {
      items: [],
      isDrawerOpen: true,
      setIsDrawerOpen: vi.fn(),
      removeItem: vi.fn(),
      updateItemQuantity: vi.fn(),
      clearBasket: vi.fn(),
    };

    renderDrawerWithContext(contextValue);

    expect(screen.getByText('Your basket is empty')).toBeInTheDocument();
    expect(screen.getByText(/Browse our product catalogue and click "Add to Quote"/i)).toBeInTheDocument();
  });

  it('renders list of commodity items when basket is populated', () => {
    const mockItems = [
      {
        productId: 101,
        productName: 'Salem Turmeric Powder',
        hsCode: '0910.30',
        quantity: 2,
        unit: 'MT',
        packing: '25 kg PP Bags',
      },
    ];

    const contextValue = {
      items: mockItems,
      isDrawerOpen: true,
      setIsDrawerOpen: vi.fn(),
      removeItem: vi.fn(),
      updateItemQuantity: vi.fn(),
      clearBasket: vi.fn(),
    };

    renderDrawerWithContext(contextValue);

    expect(screen.getByText('Salem Turmeric Powder')).toBeInTheDocument();
    expect(screen.getByText(/HS:\s*0910\.30/i)).toBeInTheDocument();
  });

  it('triggers removeItem when remove button is clicked', () => {
    const removeItemMock = vi.fn();
    const mockItems = [
      {
        productId: 101,
        productName: 'Salem Turmeric Powder',
        hsCode: '0910.30',
        quantity: 2,
        unit: 'MT',
      },
    ];

    const contextValue = {
      items: mockItems,
      isDrawerOpen: true,
      setIsDrawerOpen: vi.fn(),
      removeItem: removeItemMock,
      updateItemQuantity: vi.fn(),
      clearBasket: vi.fn(),
    };

    renderDrawerWithContext(contextValue);

    const deleteBtn = screen.getByRole('button', {
      name: /Remove Salem Turmeric Powder from quote basket/i,
    });
    fireEvent.click(deleteBtn);

    expect(removeItemMock).toHaveBeenCalledWith(101);
  });
});
