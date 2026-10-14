import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FOUNDERS } from '../../data/founders';

export const JsonLd = ({ data }) => {
  if (!data) return null;
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
};

export const createOrganizationSchema = () => {
  const brandName = import.meta.env.VITE_BRAND_NAME || 'JHS GLOBAL';
  const siteUrl = import.meta.env.VITE_CLIENT_URL || 'https://www.jhsglobal.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: brandName,
    url: siteUrl,
    logo: `${siteUrl}/images/logo.png`,
    description:
      'Premier Indian exporter of manufacturer-grade personal care raw materials, standardized nutraceutical botanical extracts, and animal feed ingredients.',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'India',
      addressLocality: 'Surat, Gujarat, India',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-7202907720',
      contactType: 'sales',
      availableLanguage: ['English', 'Hindi', 'Gujarati'],
    },
    founder: FOUNDERS.map((founder) => ({
      '@type': 'Person',
      name: founder.name,
      jobTitle: founder.role,
      image: `${siteUrl}${founder.images.jpg}`,
      description: founder.bio,
    })),
  };
};

export const createProductSchema = (product) => {
  const brandName = import.meta.env.VITE_BRAND_NAME || 'JHS GLOBAL';
  const siteUrl = import.meta.env.VITE_CLIENT_URL || 'https://www.jhsglobal.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images?.[0]?.url ? `${siteUrl}${product.images[0].url}` : undefined,
    description: product.shortDescription || product.description,
    sku: product.hsCode,
    mpn: product.hsCode,
    brand: {
      '@type': 'Brand',
      name: brandName,
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      price: 'Price on request',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: brandName,
      },
    },
  };
};

export const createBreadcrumbSchema = (crumbs = []) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
};

export const createFaqSchema = (faqs = []) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
};

export const createBlogPostSchema = (post) => {
  const brandName = import.meta.env.VITE_BRAND_NAME || 'JHS GLOBAL';
  const siteUrl = import.meta.env.VITE_CLIENT_URL || 'https://www.jhsglobal.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      '@type': 'Person',
      name: post.author?.name || 'Export Quality Desk',
      jobTitle: post.author?.designation,
    },
    publisher: {
      '@type': 'Organization',
      name: brandName,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/images/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/blog/${post.slug}`,
    },
  };
};

export default JsonLd;
