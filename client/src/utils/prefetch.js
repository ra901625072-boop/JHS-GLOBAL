import { useContext } from 'react';
import { QueryClientContext } from '@tanstack/react-query';
import { fetchCategories, fetchProducts, fetchProductBySlug } from '../features/products/api';
import { fetchCertificates, fetchFaqs } from '../features/trust/api';

/**
 * Hook to retrieve QueryClient safely without throwing an error
 * when used in test environments or components mounted outside a QueryClientProvider.
 */
export const useSafeQueryClient = () => {
  return useContext(QueryClientContext) || null;
};

/**
 * Intelligent Data Prefetch Utility
 * 
 * Preloads catalogue data and secondary page resources on idle or hover/focus.
 * Strictly respects user data-saver preferences (Save-Data header) and slow mobile connections (2G).
 */
export const shouldPrefetch = () => {
  if (typeof navigator === 'undefined') return false;
  // Respect user preference for reduced data usage
  if (navigator.connection?.saveData) return false;
  // Don't prefetch on 2G or slow connections to preserve bandwidth
  const effectiveType = navigator.connection?.effectiveType;
  if (effectiveType === 'slow-2g' || effectiveType === '2g') return false;
  return true;
};

export const prefetchRouteData = (path, queryClient) => {
  if (!shouldPrefetch() || !queryClient) return;

  try {
    if (path === '/products') {
      queryClient.prefetchQuery({
        queryKey: ['categories'],
        queryFn: fetchCategories,
        staleTime: 60 * 60 * 1000,
      });
      queryClient.prefetchQuery({
        queryKey: ['products', {}],
        queryFn: () => fetchProducts({}),
        staleTime: 15 * 60 * 1000,
      });
    } else if (path === '/quality') {
      queryClient.prefetchQuery({
        queryKey: ['certificates'],
        queryFn: fetchCertificates,
        staleTime: 60 * 60 * 1000,
      });
    } else if (path === '/faq') {
      queryClient.prefetchQuery({
        queryKey: ['faqs', undefined],
        queryFn: () => fetchFaqs(undefined),
        staleTime: 60 * 60 * 1000,
      });
    }
  } catch (err) {
    // Graceful no-op if prefetching fails
  }
};

export const prefetchProductDetail = (slug, queryClient) => {
  if (!shouldPrefetch() || !queryClient || !slug) return;
  try {
    queryClient.prefetchQuery({
      queryKey: ['product', slug],
      queryFn: () => fetchProductBySlug(slug),
      staleTime: 30 * 60 * 1000,
    });
  } catch (err) {
    // Graceful no-op if prefetching fails
  }
};

export default {
  useSafeQueryClient,
  shouldPrefetch,
  prefetchRouteData,
  prefetchProductDetail,
};
