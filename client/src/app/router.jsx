import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from './App';

// Buyer Public Pages
const HomePage = lazy(() => import('../pages/Home'));
const AboutPage = lazy(() => import('../pages/About'));
const ProductsPage = lazy(() => import('../pages/Products'));
const ProductDetailPage = lazy(() => import('../pages/ProductDetail'));
const QualityPage = lazy(() => import('../pages/Quality'));
const ExportProcessPage = lazy(() => import('../pages/ExportProcess'));
const SampleRequestPage = lazy(() => import('../pages/SampleRequest'));
const BlogPage = lazy(() => import('../pages/Blog'));
const BlogPostPage = lazy(() => import('../pages/BlogPost'));
const FaqPage = lazy(() => import('../pages/Faq'));
const ContactPage = lazy(() => import('../pages/Contact'));
const NotFoundPage = lazy(() => import('../pages/NotFound'));

// Admin Suite Pages & Components
const AdminRoot = lazy(() => import('../admin/components/AdminRoot'));
const AdminLayout = lazy(() => import('../admin/components/AdminLayout'));
const ProtectedRoute = lazy(() => import('../admin/components/ProtectedRoute'));
const AdminLogin = lazy(() => import('../admin/pages/Login'));
const AdminDashboard = lazy(() => import('../admin/pages/Dashboard'));
const AdminInquiries = lazy(() => import('../admin/pages/Inquiries'));
const AdminProducts = lazy(() => import('../admin/pages/Products'));
const AdminSalesDesk = lazy(() => import('../admin/pages/SalesDesk'));
const AdminQuotations = lazy(() => import('../admin/pages/Quotations'));
const AdminCustomers = lazy(() => import('../admin/pages/Customers'));
const AdminOrders = lazy(() => import('../admin/pages/Orders'));
const AdminCompanyKnowledge = lazy(() => import('../admin/pages/CompanyKnowledgeBase'));
const AdminAiInquiries = lazy(() => import('../admin/pages/AiInquiryReview'));
const AdminSamples = lazy(() => import('../admin/pages/Samples'));
const AdminCategories = lazy(() => import('../admin/pages/Categories'));
const AdminCertificates = lazy(() => import('../admin/pages/Certificates'));
const AdminBlogCms = lazy(() => import('../admin/pages/BlogCms'));
const AdminFaqManager = lazy(() => import('../admin/pages/FaqManager'));
const AdminUsers = lazy(() => import('../admin/pages/Users'));
const AdminAuditLogs = lazy(() => import('../admin/pages/AuditLogs'));
const AdminSettings = lazy(() => import('../admin/pages/Settings'));

const RouteLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center p-8 animate-in fade-in duration-150">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-primary-800 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs text-neutral-500 font-medium">Loading export specifications...</span>
    </div>
  </div>
);

export const router = createBrowserRouter([
  // Public Buyer Portal
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<RouteLoader />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: 'about-us',
        element: (
          <Suspense fallback={<RouteLoader />}>
            <AboutPage />
          </Suspense>
        ),
      },
      {
        path: 'about',
        element: <Navigate to="/about-us" replace />,
      },
      {
        path: 'products',
        element: (
          <Suspense fallback={<RouteLoader />}>
            <ProductsPage />
          </Suspense>
        ),
      },
      {
        path: 'categories/:slug',
        element: <Navigate to="/products" replace />,
      },
      {
        path: 'categories',
        element: <Navigate to="/products" replace />,
      },
      {
        path: 'products/:slug',
        element: (
          <Suspense fallback={<RouteLoader />}>
            <ProductDetailPage />
          </Suspense>
        ),
      },
      {
        path: 'quality',
        element: (
          <Suspense fallback={<RouteLoader />}>
            <QualityPage />
          </Suspense>
        ),
      },
      {
        path: 'export-process',
        element: (
          <Suspense fallback={<RouteLoader />}>
            <ExportProcessPage />
          </Suspense>
        ),
      },
      {
        path: 'private-label',
        element: <Navigate to="/about-us" replace />,
      },
      {
        path: 'global-reach',
        element: <Navigate to="/about-us" replace />,
      },
      {
        path: 'sample-request',
        element: (
          <Suspense fallback={<RouteLoader />}>
            <SampleRequestPage />
          </Suspense>
        ),
      },
      {
        path: 'blog',
        element: (
          <Suspense fallback={<RouteLoader />}>
            <BlogPage />
          </Suspense>
        ),
      },
      {
        path: 'blog/:slug',
        element: (
          <Suspense fallback={<RouteLoader />}>
            <BlogPostPage />
          </Suspense>
        ),
      },
      {
        path: 'faq',
        element: (
          <Suspense fallback={<RouteLoader />}>
            <FaqPage />
          </Suspense>
        ),
      },
      {
        path: 'contact',
        element: (
          <Suspense fallback={<RouteLoader />}>
            <ContactPage />
          </Suspense>
        ),
      },
      {
        path: '*',
        element: (
          <Suspense fallback={<RouteLoader />}>
            <NotFoundPage />
          </Suspense>
        ),
      },
    ],
  },

  // Admin Operations Suite (AuthProvider scoped strictly to Admin area)
  {
    path: '/admin',
    element: (
      <Suspense fallback={<RouteLoader />}>
        <AdminRoot />
      </Suspense>
    ),
    children: [
      {
        path: 'login',
        element: (
          <Suspense fallback={<RouteLoader />}>
            <AdminLogin />
          </Suspense>
        ),
      },
      {
        element: (
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        ),
        children: [
      {
        index: true,
        element: (
          <Suspense fallback={<RouteLoader />}>
            <AdminDashboard />
          </Suspense>
        ),
      },
      {
        path: 'sales-desk',
        element: (
          <Suspense fallback={<RouteLoader />}>
            <ProtectedRoute allowedRoles={['admin', 'sales']}>
              <AdminSalesDesk />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: 'inquiries',
        element: (
          <Suspense fallback={<RouteLoader />}>
            <ProtectedRoute allowedRoles={['admin', 'sales']}>
              <AdminInquiries />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: 'quotations',
        element: (
          <Suspense fallback={<RouteLoader />}>
            <ProtectedRoute allowedRoles={['admin', 'sales']}>
              <AdminQuotations />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: 'customers',
        element: (
          <Suspense fallback={<RouteLoader />}>
            <ProtectedRoute allowedRoles={['admin', 'sales']}>
              <AdminCustomers />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: 'orders',
        element: (
          <Suspense fallback={<RouteLoader />}>
            <ProtectedRoute allowedRoles={['admin', 'sales']}>
              <AdminOrders />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: 'products',
        element: (
          <Suspense fallback={<RouteLoader />}>
            <ProtectedRoute allowedRoles={['admin', 'editor']}>
              <AdminProducts />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: 'company-knowledge',
        element: (
          <Suspense fallback={<RouteLoader />}>
            <ProtectedRoute allowedRoles={['admin', 'editor']}>
              <AdminCompanyKnowledge />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: 'ai-inquiries',
        element: (
          <Suspense fallback={<RouteLoader />}>
            <ProtectedRoute allowedRoles={['admin', 'sales', 'editor']}>
              <AdminAiInquiries />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: 'samples',
        element: (
          <Suspense fallback={<RouteLoader />}>
            <ProtectedRoute allowedRoles={['admin', 'sales']}>
              <AdminSamples />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: 'categories',
        element: (
          <Suspense fallback={<RouteLoader />}>
            <ProtectedRoute allowedRoles={['admin', 'editor']}>
              <AdminCategories />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: 'certificates',
        element: (
          <Suspense fallback={<RouteLoader />}>
            <ProtectedRoute allowedRoles={['admin', 'editor']}>
              <AdminCertificates />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: 'blog',
        element: (
          <Suspense fallback={<RouteLoader />}>
            <ProtectedRoute allowedRoles={['admin', 'editor']}>
              <AdminBlogCms />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: 'faqs',
        element: (
          <Suspense fallback={<RouteLoader />}>
            <ProtectedRoute allowedRoles={['admin', 'editor']}>
              <AdminFaqManager />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: 'users',
        element: (
          <Suspense fallback={<RouteLoader />}>
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminUsers />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: 'audit-logs',
        element: (
          <Suspense fallback={<RouteLoader />}>
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminAuditLogs />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<RouteLoader />}>
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminSettings />
            </ProtectedRoute>
          </Suspense>
        ),
      },
        ],
      },
    ],
  },
]);

export default router;
