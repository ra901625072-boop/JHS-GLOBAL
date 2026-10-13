import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  Search,
  Tag,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { useBlogPosts } from '../../features/blog/hooks';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/layout/PageHeader';
import Reveal from '../../components/ui/Reveal';

export const BlogPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: 'All Intelligence' },
    { id: 'Spices & Botanical Quality', label: 'Spices & Botanicals' },
    { id: 'Regulatory Compliance', label: 'EU / US FDA Compliance' },
    { id: 'Agricultural Commodities', label: 'Grains & Commodities' },
    { id: 'Export Logistics & Banking', label: 'Incoterms & Shipping' },
  ];

  const { data: blogData, isLoading } = useBlogPosts({
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    q: searchQuery.trim() || undefined,
  });

  const posts = blogData?.posts || [];
  const featuredPost = posts[0];
  const gridPosts = posts.slice(1);

  return (
    <>
      <Helmet>
        <title>Market Intelligence, Crop Harvest & Quality Reports — Export B2B</title>
        <meta
          name="description"
          content="Authoritative technical insights on Indian spice grading, Curcumin concentrations, EU MRL pesticide thresholds, and container shipping Incoterms."
        />
      </Helmet>

      {/* Signature Slow Masked Page Header */}
      <PageHeader
        eyebrow="B2B Trade Intelligence & Technical Guides"
        title="Crop Calendars, Quality Standards & Trade Insights"
        description="Technical guides designed for commercial spice grinders, food manufacturers, and overseas importers navigating Indian agricultural procurement."
      />

      {/* Filter and Search Bar */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3.5 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-colors ${
                  selectedCategory === c.id
                    ? 'bg-primary-900 text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports or HS codes..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-800 focus:border-primary-800"
            />
          </div>
        </div>
      </section>

      {/* Articles Content Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {isLoading ? (
          <div className="py-16 text-center text-neutral-500 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-primary-800 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium">Loading trade intelligence articles...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-lg border border-neutral-200 p-8">
            <BookOpen className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
            <h3 className="font-serif text-lg font-bold text-neutral-800">No Articles Found</h3>
            <p className="text-xs text-neutral-500 mt-1">
              Try adjusting your category filter or search keywords.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Featured Post Hero (if no search query active) */}
            {!searchQuery && selectedCategory === 'all' && featuredPost && (
              <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                  <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-accent-100 text-accent-900 border border-accent-200">
                          Featured Technical Dossier
                        </span>
                        <span className="text-[11px] text-neutral-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{featuredPost.readMinutes} min read</span>
                        </span>
                      </div>
                      <Link to={`/blog/${featuredPost.slug}`}>
                        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 hover:text-primary-800 transition-colors leading-tight">
                          {featuredPost.title}
                        </h2>
                      </Link>
                      <p className="mt-4 text-xs sm:text-sm text-neutral-600 line-clamp-3 leading-relaxed">
                        {featuredPost.excerpt}
                      </p>
                    </div>

                    <div className="mt-6 pt-6 border-t border-neutral-100 flex items-center justify-between">
                      <div className="text-xs">
                        <span className="font-bold text-neutral-900 block">{featuredPost.author?.name}</span>
                        <span className="text-[11px] text-neutral-500">{featuredPost.author?.designation}</span>
                      </div>
                      <Link
                        to={`/blog/${featuredPost.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-800 hover:text-accent-600 uppercase tracking-wider"
                      >
                        <span>Read Analysis</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  <div className="lg:col-span-5 bg-primary-900 flex items-center justify-center p-8 text-white relative min-h-[240px]">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary-950 via-primary-900 to-primary-800 opacity-90" />
                    <div className="relative z-10 text-center max-w-xs">
                      <ShieldCheck className="w-12 h-12 text-accent-400 mx-auto mb-3" />
                      <span className="text-[10px] uppercase tracking-widest text-accent-400 font-semibold block">
                        Verified Export Quality
                      </span>
                      <p className="text-xs text-neutral-200 mt-2 font-mono">
                        HPLC • GC-MS • NABL Accredited Testing Protocols
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Articles Grid */}
            <Reveal direction="up" cascade stagger={0.06} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(searchQuery || selectedCategory !== 'all' ? posts : gridPosts).map((post) => (
                <article
                  key={post._id || post.slug}
                  className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-xs hover:shadow-card hover:border-accent-500/40 transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between text-[11px] text-neutral-500 mb-3">
                      <span className="px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-neutral-100 text-neutral-700 text-[10px]">
                        {post.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{post.readMinutes} min</span>
                      </span>
                    </div>

                    <Link to={`/blog/${post.slug}`}>
                      <h3 className="font-serif text-lg font-bold text-neutral-900 hover:text-primary-800 transition-colors leading-snug">
                        {post.title}
                      </h3>
                    </Link>

                    <p className="mt-3 text-xs text-neutral-600 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="px-6 pb-6 pt-3 border-t border-neutral-100 flex items-center justify-between mt-auto">
                    <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                    </span>

                    <Link
                      to={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary-800 hover:text-accent-600"
                    >
                      <span>Read Guide</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </article>
              ))}
            </Reveal>
          </div>
        )}
      </section>

      {/* Inquiry Conversion Strip */}
      <section className="bg-primary-950 text-white py-12 px-4 sm:px-6 lg:px-8 mt-12 border-t border-primary-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white">
              Need Batch Testing Analysis for Your Destination Port?
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-xl">
              We provide lot-specific third-party laboratory COAs and container inspection reports before cargo dispatch.
            </p>
          </div>
          <Link to="/contact">
            <Button variant="cta" className="shrink-0 text-xs py-3 px-6">
              <span>Request Laboratory COA & Quote</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
};

export default BlogPage;
