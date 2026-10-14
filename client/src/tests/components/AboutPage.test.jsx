import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import AboutPage from '../../pages/About';
import { FOUNDERS } from '../../data/founders';
import { createOrganizationSchema } from '../../components/seo/JsonLd';

const renderAboutPage = () => {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/about-us']}>
        <AboutPage />
      </MemoryRouter>
    </HelmetProvider>
  );
};

describe('UI Component: AboutPage Suite', () => {
  it('renders "About Us" page header, eyebrow, and badge', () => {
    renderAboutPage();

    expect(
      screen.getByRole('heading', { name: /About Us — Manufacturer-Grade Indian Raw Materials/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/ESTABLISHED IN SURAT, GUJARAT/i)).toBeInTheDocument();
  });

  it('renders the dedicated Leadership & Founders section with all three founders equally', () => {
    renderAboutPage();

    // Section exists
    const foundersSection = screen.getByTestId('founders-section');
    expect(foundersSection).toBeInTheDocument();
    expect(
      within(foundersSection).getByRole('heading', { name: /The Founders Behind JHS Global/i })
    ).toBeInTheDocument();

    // All three founders rendered simultaneously
    expect(within(foundersSection).getByText('Jay Prajapati')).toBeInTheDocument();
    expect(within(foundersSection).getByText('Henil Prajapati')).toBeInTheDocument();
    expect(within(foundersSection).getByText('Suraj Prajapati')).toBeInTheDocument();

    // Verify Jay Prajapati card details
    const jayCard = screen.getByTestId('founder-card-jay-prajapati');
    expect(jayCard).toBeInTheDocument();
    expect(within(jayCard).getByText('Statutory Proprietor')).toBeInTheDocument();
    expect(within(jayCard).getByText('Corporate Governance & Trade Compliance')).toBeInTheDocument();
    const jayImg = within(jayCard).getByAltText(/Jay Prajapati, Founder at JHS Global standing in navy suit/i);
    expect(jayImg).toHaveAttribute('src', '/images/about/founder-jay-768w.jpg');
    expect(jayImg).toHaveAttribute('width', '768');
    expect(jayImg).toHaveAttribute('height', '1024');
    expect(jayImg).toHaveAttribute('loading', 'lazy');

    // Verify Henil Prajapati card details
    const henilCard = screen.getByTestId('founder-card-henil-prajapati');
    expect(henilCard).toBeInTheDocument();
    expect(within(henilCard).getByText('Global Logistics & Trade Desk Operations')).toBeInTheDocument();
    const henilImg = within(henilCard).getByAltText(/Henil Prajapati, Founder at JHS Global standing in black tailored suit/i);
    expect(henilImg).toHaveAttribute('src', '/images/about/founder-henil-768w.jpg');
    expect(henilImg).toHaveAttribute('width', '768');
    expect(henilImg).toHaveAttribute('height', '1024');
    expect(henilImg).toHaveAttribute('loading', 'lazy');

    // Verify Suraj Prajapati card details
    const surajCard = screen.getByTestId('founder-card-suraj-prajapati');
    expect(surajCard).toBeInTheDocument();
    expect(within(surajCard).getByText('Procurement & Raw Material Qualification')).toBeInTheDocument();
    const surajImg = within(surajCard).getByAltText(/Suraj Prajapati, Founder at JHS Global seated at desk with globe and laptop/i);
    expect(surajImg).toHaveAttribute('src', '/images/about/founder-suraj-768w.jpg');
    expect(surajImg).toHaveAttribute('width', '768');
    expect(surajImg).toHaveAttribute('height', '1024');
    expect(surajImg).toHaveAttribute('loading', 'lazy');
  });

  it('guarantees no placeholder name (e.g. Hardik Unava) is displayed anywhere on the page', () => {
    renderAboutPage();

    expect(screen.queryByText(/Hardik Unava/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/TODO\(client: confirm executive name/i)).not.toBeInTheDocument();
  });

  it('renders the 3 core export categories (Personal Care, Nutraceuticals, Animal Feed)', () => {
    renderAboutPage();

    expect(screen.getByText(/Personal Care Raw Materials & Oleochemicals/i)).toBeInTheDocument();
    expect(screen.getByText(/Standardized Nutraceutical Extracts/i)).toBeInTheDocument();
    expect(screen.getByText(/Animal Feed Ingredients & Protein Meals/i)).toBeInTheDocument();
  });

  it('renders the Sourcing Pledge quote block', () => {
    renderAboutPage();

    expect(screen.getByText(/The Sourcing Pledge/i)).toBeInTheDocument();
    expect(screen.getByText(/Importing from a new partner is a risk calculation/i)).toBeInTheDocument();
  });

  it('renders confirmed export gateways and destinations', () => {
    renderAboutPage();

    expect(screen.getByText(/Middle East & GCC/i)).toBeInTheDocument();
    expect(screen.getByText(/European Union & UK/i)).toBeInTheDocument();
    expect(screen.getByText(/Americas & Canada/i)).toBeInTheDocument();
    expect(screen.getByText(/Southeast Asia & East Asia/i)).toBeInTheDocument();
  });

  it('renders verified government statutory credentials (IEC, GST, FSSAI)', () => {
    renderAboutPage();

    expect(screen.getByText('EZHPP3437C')).toBeInTheDocument();
    expect(screen.getByText('24EZHPP3437C1ZH')).toBeInTheDocument();
    expect(screen.getByText('10725997001058')).toBeInTheDocument();
  });

  it('generates Organization structured data with all three founders', () => {
    const schema = createOrganizationSchema();
    expect(schema['@type']).toBe('Organization');
    expect(schema.name).toBe('JHS GLOBAL');
    expect(schema.founder).toHaveLength(3);
    expect(schema.founder.map((f) => f.name)).toEqual([
      'Jay Prajapati',
      'Henil Prajapati',
      'Suraj Prajapati',
    ]);
  });
});
