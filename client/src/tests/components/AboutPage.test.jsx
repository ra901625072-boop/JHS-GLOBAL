import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import AboutPage from '../../pages/About';
import { FOUNDERS } from '../../data/founders';
import { ABOUT_CONTENT } from '../../data/aboutContent';
import { createOrganizationSchema } from '../../components/seo/JsonLd';

const renderAboutPage = (props = {}) => {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/about-us']}>
        <AboutPage {...props} />
      </MemoryRouter>
    </HelmetProvider>
  );
};

describe('UI Component: AboutPage Suite (Approved Content & Founders)', () => {
  it('renders the approved opening headline, subheadline, and punchline', () => {
    renderAboutPage();

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /An export house built on trust, transparency and Indian abundance/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/India is our origin\. The world is our destination\./i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/We move India across oceans, without compromising on quality/i)
    ).toBeInTheDocument();
  });

  it('renders the 3 Foundation pillars and operating principles verbatim', () => {
    renderAboutPage();

    expect(screen.getByRole('heading', { level: 2, name: /Our Foundation/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Integrity' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Quality' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Reliability' })).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { level: 3, name: /Merchants of the Everyday Extraordinary/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 4, name: 'Supply What Was Agreed' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 4, name: 'Be Clear and Accountable' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Our goal is simple: deliver what was agreed, stand behind our commitments/i)
    ).toBeInTheDocument();
  });

  it('renders Mission, Vision, and all 5 Values', () => {
    renderAboutPage();

    expect(
      screen.getByRole('heading', { level: 2, name: /Our Mission, Vision and Values/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/documentation a customs officer could frame/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/across food, wellness, and beauty sectors/i)
    ).toBeInTheDocument();

    // Values
    expect(screen.getByText('Integrity in every lot')).toBeInTheDocument();
    expect(screen.getByText('Transparency in every quote')).toBeInTheDocument();
    expect(screen.getByText('Consistency in every reorder')).toBeInTheDocument();
    expect(screen.getByText('Partnership over transaction')).toBeInTheDocument();
    expect(screen.getByText('Respect for farmers, buyers and the product itself')).toBeInTheDocument();
  });

  it('renders the three guiding commitments', () => {
    renderAboutPage();

    expect(
      screen.getByRole('heading', { level: 3, name: 'Specification is a promise' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: 'Radical transparency' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: 'Long-term relationships' })
    ).toBeInTheDocument();
  });

  it('renders exactly three founders in confirmed order (Jay -> Suraj -> Henil) with photos, roles, and quotes', () => {
    renderAboutPage();

    const foundersSection = screen.getByTestId('founders-section');
    expect(foundersSection).toBeInTheDocument();
    expect(
      within(foundersSection).getByRole('heading', { level: 2, name: /Meet our team/i })
    ).toBeInTheDocument();

    // 1. Jay Prajapati
    const jayCard = screen.getByTestId('founder-card-jay-prajapati');
    expect(jayCard).toBeInTheDocument();
    expect(within(jayCard).getByRole('heading', { level: 3, name: 'Jay Prajapati' })).toBeInTheDocument();
    expect(within(jayCard).getByText('Founder & CEO | JHS GLOBAL')).toBeInTheDocument();
    expect(within(jayCard).getByText('"From local markets to global ambitions."')).toBeInTheDocument();
    expect(within(jayCard).getByText('Statutory Proprietor')).toBeInTheDocument();
    const jayImg = within(jayCard).getByAltText(/Jay Prajapati, Founder & CEO, JHS GLOBAL/i);
    expect(jayImg).toHaveAttribute('src', '/images/about/founder-jay-768w.jpg');

    // 2. Suraj Prajapati
    const surajCard = screen.getByTestId('founder-card-suraj-prajapati');
    expect(surajCard).toBeInTheDocument();
    expect(within(surajCard).getByRole('heading', { level: 3, name: 'Suraj Prajapati' })).toBeInTheDocument();
    expect(within(surajCard).getByText('Co-Founder | Sourcing & Operations')).toBeInTheDocument();
    expect(within(surajCard).getByText('"Turning commitments into carefully executed results."')).toBeInTheDocument();
    const surajImg = within(surajCard).getByAltText(/Suraj Prajapati, Co-Founder, Sourcing & Operations, JHS GLOBAL/i);
    expect(surajImg).toHaveAttribute('src', '/images/about/founder-suraj-768w.jpg');

    // 3. Henil Prajapati
    const henilCard = screen.getByTestId('founder-card-henil-prajapati');
    expect(henilCard).toBeInTheDocument();
    expect(within(henilCard).getByRole('heading', { level: 3, name: 'Henil Prajapati' })).toBeInTheDocument();
    expect(within(henilCard).getByText('Co-Founder | Commercial Development & Marketing')).toBeInTheDocument();
    expect(within(henilCard).getByText('"The courage to pursue opportunities others might overlook."')).toBeInTheDocument();
    const henilImg = within(henilCard).getByAltText(/Henil Prajapati, Co-Founder, Commercial Development & Marketing, JHS GLOBAL/i);
    expect(henilImg).toHaveAttribute('src', '/images/about/founder-henil-768w.jpg');
  });

  it('guarantees the full bio text for each founder is present in the DOM for SEO and screen readers', () => {
    renderAboutPage();

    // Jay's bio paragraphs
    FOUNDERS[0].bioParagraphs.forEach((paragraph) => {
      expect(screen.getByText(paragraph)).toBeInTheDocument();
    });

    // Suraj's bio paragraphs
    FOUNDERS[1].bioParagraphs.forEach((paragraph) => {
      expect(screen.getByText(paragraph)).toBeInTheDocument();
    });

    // Henil's bio paragraphs
    FOUNDERS[2].bioParagraphs.forEach((paragraph) => {
      expect(screen.getByText(paragraph)).toBeInTheDocument();
    });
  });

  it('renders closing declaration and conversion CTAs', () => {
    renderAboutPage();

    expect(
      screen.getByRole('heading', { level: 2, name: 'THREE MINDS. ONE COMMITMENT.' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Different strengths\. One shared vision\./i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Request a Proforma Quote/i)
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(/Inquire on WhatsApp/i)[0]
    ).toBeInTheDocument();
  });

  it('renders AboutSkeleton when isLoading=true and error state when isError=true', () => {
    const { unmount } = renderAboutPage({ isLoading: true });
    expect(screen.getByTestId('about-skeleton')).toBeInTheDocument();
    unmount();

    const onRetryMock = vi.fn();
    renderAboutPage({ isError: true, onRetry: onRetryMock });
    expect(screen.getByText('Unable to Load About Us')).toBeInTheDocument();
    const retryBtn = screen.getByRole('button', { name: /Retry Loading/i });
    fireEvent.click(retryBtn);
    expect(onRetryMock).toHaveBeenCalledTimes(1);
  });

  it('generates Organization structured data with all three founders in confirmed order', () => {
    const schema = createOrganizationSchema();
    expect(schema['@type']).toBe('Organization');
    expect(schema.name).toBe('JHS GLOBAL');
    expect(schema.founder).toHaveLength(3);
    expect(schema.founder.map((f) => f.name)).toEqual([
      'Jay Prajapati',
      'Suraj Prajapati',
      'Henil Prajapati',
    ]);
    expect(schema.founder[0].jobTitle).toBe('Founder & CEO');
    expect(schema.founder[1].jobTitle).toBe('Co-Founder, Sourcing & Operations');
    expect(schema.founder[2].jobTitle).toBe('Co-Founder, Commercial Development & Marketing');
  });
});
