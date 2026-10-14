import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MobileMenuDrawer from '../../components/layout/MobileMenuDrawer';
import { QuoteBasketProvider } from '../../features/quoteBasket/context';

const renderMobileMenuDrawer = (props = {}) => {
  return render(
    <BrowserRouter>
      <QuoteBasketProvider>
        <MobileMenuDrawer isOpen={true} onClose={vi.fn()} {...props} />
      </QuoteBasketProvider>
    </BrowserRouter>
  );
};

describe('UI Component: MobileMenuDrawer Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal dialog with accessible title and close button', () => {
    const handleClose = vi.fn();
    renderMobileMenuDrawer({ onClose: handleClose });

    const dialog = screen.getByRole('dialog', { name: /Navigation Menu/i });
    expect(dialog).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: /Close navigation menu/i });
    expect(closeBtn).toBeInTheDocument();
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('renders prominent JHS Export AI Desk feature card with quick inquiry prompts', () => {
    const handleClose = vi.fn();
    const eventSpy = vi.fn();
    window.addEventListener('open-ai-chat', eventSpy);

    renderMobileMenuDrawer({ onClose: handleClose });

    expect(screen.getByText(/JHS Export AI Desk/i)).toBeInTheDocument();
    expect(screen.getByText(/Live/i)).toBeInTheDocument();

    const aiTriggerBtn = screen.getByRole('button', { name: /Ask AI Assistant Now/i });
    expect(aiTriggerBtn).toBeInTheDocument();

    fireEvent.click(aiTriggerBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    window.removeEventListener('open-ai-chat', eventSpy);
  });

  it('renders 3 core sourcing divisions with verified categories', () => {
    renderMobileMenuDrawer();

    expect(screen.getByText(/Personal Care Raw Materials/i)).toBeInTheDocument();
    expect(screen.getByText(/Nutraceutical Raw Materials/i)).toBeInTheDocument();
    expect(screen.getByText(/Animal Feed & Meals/i)).toBeInTheDocument();
  });

  it('renders corrected typography and labels for main navigation links', () => {
    renderMobileMenuDrawer();

    expect(screen.getByText('Products Catalogue')).toBeInTheDocument();
    expect(screen.getByText('Quality & Certifications')).toBeInTheDocument();
    expect(screen.getByText('Export Process')).toBeInTheDocument();
    expect(screen.getByText('About Us')).toBeInTheDocument();
    expect(screen.getByText('Procurement FAQ')).toBeInTheDocument();
  });

  it('renders RFQ and WhatsApp bottom action dock buttons', () => {
    renderMobileMenuDrawer();

    expect(screen.getByRole('button', { name: /Request Commercial Quote \(RFQ\)/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Chat with Export Desk \(WhatsApp\)/i })).toBeInTheDocument();
  });
});
