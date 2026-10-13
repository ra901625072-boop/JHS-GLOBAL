import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import WhatsAppButton from '../../components/layout/WhatsAppButton';

describe('UI Component: WhatsAppButton Suite', () => {
  it('renders floating action button with accessible label and target link', () => {
    render(<WhatsAppButton />);

    const link = screen.getByRole('link', {
      name: /Chat directly on WhatsApp with JHS GLOBAL Export Desk/i,
    });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link.getAttribute('href')).toMatch(/^https:\/\/wa\.me\/\d+\?text=/);
  });

  it('contains accessible aside wrapper for export inquiries', () => {
    render(<WhatsAppButton />);
    const aside = screen.getByRole('complementary', {
      name: /Direct WhatsApp Export Inquiries/i,
    });
    expect(aside).toBeInTheDocument();
  });
});
