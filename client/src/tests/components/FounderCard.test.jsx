import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FounderCard from '../../components/about/FounderCard';
import { FOUNDERS } from '../../data/founders';

describe('UI Component: FounderCard Suite', () => {
  const jayFounder = FOUNDERS[0]; // Jay Prajapati
  const surajFounder = FOUNDERS[1]; // Suraj Prajapati
  const henilFounder = FOUNDERS[2]; // Henil Prajapati

  it('renders founder name, role, tagline, and philosophy quote accurately', () => {
    render(<FounderCard founder={jayFounder} />);

    expect(screen.getByRole('heading', { level: 3, name: 'Jay Prajapati' })).toBeInTheDocument();
    expect(screen.getByText('Founder & CEO | JHS GLOBAL')).toBeInTheDocument();
    expect(screen.getByText(`"${jayFounder.tagline}"`)).toBeInTheDocument();
    expect(screen.getByText(`"${jayFounder.philosophyQuote}"`)).toBeInTheDocument();
    expect(screen.getByText(jayFounder.philosophyReflection)).toBeInTheDocument();
    expect(screen.getByText('Statutory Proprietor')).toBeInTheDocument();
  });

  it('renders responsive 3:4 portrait image with verified alt text', () => {
    render(<FounderCard founder={surajFounder} />);

    const img = screen.getByAltText(surajFounder.alt);
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', surajFounder.images.jpg);
    expect(img).toHaveAttribute('width', '768');
    expect(img).toHaveAttribute('height', '1024');
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  it('supports accessible inline disclosure ("Read Full Biography" / "Show Less")', () => {
    render(<FounderCard founder={jayFounder} />);

    const toggleButton = screen.getByRole('button', { name: /Read Full Biography/i });
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');

    // Expand
    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveTextContent('Show Less');
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');

    // Bio paragraph 2 should now be visible
    expect(screen.getByText(/Driven by an ambition to take his entrepreneurial vision global/i)).toBeInTheDocument();

    // Collapse
    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveTextContent('Read Full Biography');
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('provides a resilient fallback state if photo fails to load (onError)', () => {
    render(<FounderCard founder={henilFounder} />);

    const img = screen.getByAltText(henilFounder.alt);
    fireEvent.error(img);

    // Image error fallback should be rendered
    const fallback = screen.getByTestId(`founder-fallback-${henilFounder.id}`);
    expect(fallback).toBeInTheDocument();
    expect(fallback).toHaveTextContent('Henil Prajapati');
    expect(fallback).toHaveTextContent('JHS GLOBAL · LEADERSHIP');

    // Full name and details must remain completely visible
    expect(screen.getByRole('heading', { level: 3, name: 'Henil Prajapati' })).toBeInTheDocument();
    expect(screen.getByText(`"${henilFounder.philosophyQuote}"`)).toBeInTheDocument();
  });
});
