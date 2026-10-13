import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Clock,
  Calendar,
  User,
  Share2,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Tag,
  BookOpen,
} from 'lucide-react';
import { useBlogPost } from '../../features/blog/hooks';
import Button from '../../components/ui/Button';
import Reveal from '../../components/ui/Reveal';
import JsonLd, { createBlogPostSchema, createBreadcrumbSchema } from '../../components/seo/JsonLd';

export const BlogPostPage = () => {
  const { slug } = useParams();
  const { data, isLoading, error } = useBlogPost(slug);
  const [copied, setCopied] = useState(false);

  const brandName = import.meta.env.VITE_BRAND_NAME || 'JHS GLOBAL';
  const siteUrl = import.meta.env.VITE_CLIENT_URL || window.location.origin;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-primary-800 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-neutral-500 font-medium">Loading technical intelligence report...</span>
        </div>
      </div>
    );
  }

  if (error || !data?.post) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center">
        <h2 className="font-serif text-2xl font-bold text-neutral-900 mb-2">Article Not Found</h2>
        <p className="text-sm text-neutral-600 mb-6">
          The requested export intelligence article could not be located or has been archived.
        </p>
        <Link to="/blog">
          <Button variant="primary">Return to Articles</Button>
        </Link>
      </div>
    );
  }

  const { post, related = [] } = data;

  const breadcrumbs = [
    { name: 'Home', url: `${siteUrl}/` },
    { name: 'Trade Intelligence', url: `${siteUrl}/blog` },
    { name: post.title, url: `${siteUrl}/blog/${post.slug}` },
  ];

  return (
    <>
      <Helmet>
        <title>{post.seo?.title || `${post.title} — ${brandName}`}</title>
        <meta
          name="description"
          content={post.seo?.description || post.excerpt}
        />
        <link rel="canonical" href={`${siteUrl}/blog/${post.slug}`} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`${siteUrl}/blog/${post.slug}`} />
      </Helmet>

      {/* Structured Schemas */}
      <JsonLd data={createBlogPostSchema(post)} />
      <JsonLd data={createBreadcrumbSchema(breadcrumbs)} />

      {/* Breadcrumb Bar */}
      <nav aria-label="Breadcrumb" className="bg-neutral-50 border-b border-neutral-200 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex items-center gap-2 text-xs text-neutral-500">
          <Link to="/" className="hover:text-primary-800 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/blog" className="hover:text-primary-800 transition-colors">
            Intelligence
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-neutral-900 font-medium truncate max-w-xs sm:max-w-md">
            {post.title}
          </span>
        </div>
      </nav>

      {/* Article Header */}
      <Reveal direction="up" className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <header>
          <div className="flex flex-wrap items-center gap-3 mb-4 text-xs">
            <span className="px-2.5 py-1 rounded font-bold uppercase tracking-wider bg-primary-100 text-primary-900 text-[10px]">
              {post.category}
            </span>
            <span className="text-neutral-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
            </span>
            <span className="text-neutral-300">•</span>
            <span className="text-neutral-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{post.readMinutes} min read</span>
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 leading-tight">
            {post.title}
          </h1>

          <p className="mt-4 text-base sm:text-lg text-neutral-600 leading-relaxed font-sans border-l-4 border-accent-400 pl-4 py-1 italic bg-neutral-50 rounded-r">
            {post.excerpt}
          </p>

          {/* Author & Share Bar */}
          <div className="mt-6 pt-6 border-t border-neutral-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-800 text-white flex items-center justify-center font-serif font-bold text-sm">
                {post.author?.name ? post.author.name[0] : 'E'}
              </div>
              <div>
                <span className="text-xs font-bold text-neutral-900 block">{post.author?.name}</span>
                <span className="text-[11px] text-neutral-500">{post.author?.designation}</span>
              </div>
            </div>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Link Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Dossier</span>
                </>
              )}
            </button>
          </div>
        </header>
      </Reveal>

      {/* Main Content Body */}
      <Reveal direction="up" delay={0.1} className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto pb-16">
        <main>
          <div className="bg-white border border-neutral-200 rounded-lg p-6 sm:p-10 shadow-xs">
          {/* Formatted Article Body */}
          <div className="prose prose-neutral max-w-none text-neutral-800 text-sm leading-relaxed space-y-4">
            {post.content.split('\n\n').map((paragraph, index) => {
              if (paragraph.startsWith('## ')) {
                return (
                  <h2
                    key={index}
                    className="font-serif text-xl sm:text-2xl font-bold text-neutral-900 mt-8 mb-3 pt-4 border-t border-neutral-100"
                  >
                    {paragraph.replace('## ', '')}
                  </h2>
                );
              }
              if (paragraph.startsWith('### ')) {
                return (
                  <h3 key={index} className="font-serif text-base sm:text-lg font-bold text-neutral-900 mt-5 mb-2">
                    {paragraph.replace('### ', '')}
                  </h3>
                );
              }
              if (paragraph.startsWith('|')) {
                // Table Rendering
                const lines = paragraph.trim().split('\n');
                const headers = lines[0]
                  .split('|')
                  .filter((c) => c.trim().length > 0)
                  .map((c) => c.trim());
                const rows = lines.slice(2).map((line) =>
                  line
                    .split('|')
                    .filter((c) => c.trim().length > 0)
                    .map((c) => c.trim())
                );

                return (
                  <div key={index} className="overflow-x-auto my-6 border border-neutral-200 rounded-lg">
                    <table className="min-w-full divide-y divide-neutral-200 text-xs">
                      <thead className="bg-neutral-50 text-neutral-700 font-bold uppercase tracking-wider">
                        <tr>
                          {headers.map((h, i) => (
                            <th key={i} className="px-4 py-2.5 text-left">
                              {h.replace(/\*\*/g, '')}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200 bg-white">
                        {rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-neutral-50/60">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="px-4 py-2 text-neutral-700">
                                {cell.replace(/\*\*/g, '')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              }
              if (paragraph.startsWith('1. ') || paragraph.startsWith('- ')) {
                const items = paragraph.split('\n');
                return (
                  <ul key={index} className="list-disc pl-5 space-y-1.5 my-3 text-neutral-700">
                    {items.map((item, iIdx) => (
                      <li key={iIdx}>{item.replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, '')}</li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={index} className="leading-relaxed">
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="mt-8 pt-6 border-t border-neutral-200 flex flex-wrap items-center gap-2">
              <span className="text-xs text-neutral-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                <span>Trade Tags:</span>
              </span>
              {post.tags.map((tag, tIdx) => (
                <span
                  key={tIdx}
                  className="px-2.5 py-1 rounded text-xs bg-neutral-100 text-neutral-700 font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Inline Conversion Card */}
          <div className="mt-10 p-6 bg-primary-900 text-white rounded-lg border border-primary-800 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-[10px] text-accent-400 font-bold uppercase tracking-widest block">
                Commercial Procurement Support
              </span>
              <h3 className="font-serif text-lg font-bold text-white mt-1">
                Request a Proforma Quotation for this Commodity Line
              </h3>
              <p className="text-xs text-neutral-300 mt-1 max-w-md">
                Binding CIF / FOB price matrix and lab sample dispatched within 48 business hours.
              </p>
            </div>
            <Link to="/contact">
              <Button variant="cta" className="shrink-0 text-xs py-2.5 px-5">
                <span>Request Quote</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Related Articles Section */}
        {related.length > 0 && (
          <Reveal direction="up" cascade delay={0.15} className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl font-bold text-neutral-900">
                Related Intelligence Dossiers
              </h2>
              <Link to="/blog" className="text-xs font-bold text-primary-800 hover:text-accent-600 flex items-center gap-1">
                <span>View All Articles</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((rel) => (
                <div
                  key={rel._id || rel.slug}
                  className="bg-white border border-neutral-200 rounded-lg p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] text-neutral-400 font-medium block mb-2">
                      {rel.readMinutes} min read
                    </span>
                    <Link to={`/blog/${rel.slug}`}>
                      <h4 className="font-serif text-sm font-bold text-neutral-900 hover:text-primary-800 transition-colors line-clamp-2">
                        {rel.title}
                      </h4>
                    </Link>
                    <p className="text-xs text-neutral-500 mt-2 line-clamp-2">{rel.excerpt}</p>
                  </div>
                  <Link
                    to={`/blog/${rel.slug}`}
                    className="mt-4 text-xs font-bold text-primary-800 hover:text-accent-600 flex items-center gap-1"
                  >
                    <span>Read Report</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </Reveal>
        )}
      </main>
    </Reveal>
    </>
  );
};

export default BlogPostPage;
