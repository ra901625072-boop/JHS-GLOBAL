import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QuoteBasketProvider, useQuoteBasket } from '../../features/quoteBasket/context';

describe('QuoteBasketContext Suite', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('correctly handles distinct products that only have numeric "id" without "_id" (PDP payload)', () => {
    const wrapper = ({ children }) => <QuoteBasketProvider>{children}</QuoteBasketProvider>;
    const { result } = renderHook(() => useQuoteBasket(), { wrapper });

    const pdpProduct1 = {
      id: 112,
      name: 'Ashwagandha Root Extract 5%',
      slug: 'ashwagandha-extract',
      hsCode: '1302.19',
      images: [{ url: '/images/ashwagandha.webp' }],
      packing: [{ type: '25 kg Fiber Drums' }],
    };

    const pdpProduct2 = {
      id: 113,
      name: 'Curcumin 95% Extract',
      slug: 'curcumin-95-extract',
      hsCode: '1302.19',
      images: [{ url: '/images/curcumin.webp' }],
      packing: [{ type: '25 kg HDPE Drums' }],
    };

    act(() => {
      result.current.addItem(pdpProduct1, 2, 'MT');
    });

    act(() => {
      result.current.addItem(pdpProduct2, 5, 'MT');
    });

    // Both distinct products must exist in basket
    expect(result.current.items).toHaveLength(2);
    expect(result.current.items[0].productId).toBe(112);
    expect(result.current.items[0].productName).toBe('Ashwagandha Root Extract 5%');
    expect(result.current.items[0].quantity).toBe(2);

    expect(result.current.items[1].productId).toBe(113);
    expect(result.current.items[1].productName).toBe('Curcumin 95% Extract');
    expect(result.current.items[1].quantity).toBe(5);
  });
});
