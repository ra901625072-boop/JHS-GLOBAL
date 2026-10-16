import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SpecTable } from '../../components/product/SpecTable';
import { ProductGallery } from '../../components/product/ProductGallery';

describe('BUG-UI-01: Product Spec Table & Gallery Verification', () => {
  it('SpecTable should qualify unverified specs (undefined or false) as Typical Spec, not Guaranteed', () => {
    const specs = [
      { key: 'Bulk Density', value: '0.45 g/ml', unit: 'g/ml' }, // undefined verified
      { key: 'Solubility Index', value: '78%', unit: '%', verified: false }, // explicitly false
      { key: 'Active Assay', value: '95% HPLC', unit: '%', verified: true }, // explicitly true
    ];

    render(<SpecTable specs={specs} />);

    // Active Assay is verified: true -> Exactly 1 on desktop ("Guaranteed") and 1 on mobile ("Guaranteed") = 2 in DOM
    const guaranteedElements = screen.getAllByText(/Guaranteed/i);
    expect(guaranteedElements.length).toBe(2);

    // Desktop uses "Typical Spec" for the 2 unverified items
    const desktopTypical = screen.getAllByText('Typical Spec');
    expect(desktopTypical.length).toBe(2);

    // Mobile uses "Typical" for the 2 unverified items
    const mobileTypical = screen.getAllByText('Typical');
    expect(mobileTypical.length).toBe(2);
  });

  it('ProductGallery should render an illustrative raw material disclaimer badge', () => {
    const images = [
      { url: '/images/products/ashwagandha-extract.webp', alt: 'Ashwagandha Extract' },
    ];

    render(<ProductGallery images={images} productName="Ashwagandha Extract" />);

    const badge = screen.getByText(/Illustrative raw material image/i);
    expect(badge).toBeInTheDocument();
  });
});
