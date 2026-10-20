import { useQuery } from '@tanstack/react-query';
import { useSafeQueryClient } from '../../utils/prefetch';
import {
  fetchCategories,
  fetchCategoryBySlug,
  fetchProducts,
  fetchFeaturedProducts,
  fetchProductBySlug,
  fetchRelatedProducts,
  fetchSearchSuggestions,
} from './api';

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 2 * 60 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
};

export const useCategory = (slug) => {
  return useQuery({
    queryKey: ['category', slug],
    queryFn: () => fetchCategoryBySlug(slug),
    enabled: Boolean(slug),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
};

export const useProducts = (params = {}) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => fetchProducts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
};

export const useFeaturedProducts = (options = {}) => {
  const client = useSafeQueryClient();
  if (!client) {
    return { data: undefined, isLoading: false, isError: false };
  }
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: fetchFeaturedProducts,
    staleTime: 5 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: true,
    ...options,
  });
};

export const useProduct = (slug) => {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchProductBySlug(slug),
    enabled: Boolean(slug),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
};

export const useRelatedProducts = (slug) => {
  return useQuery({
    queryKey: ['products', 'related', slug],
    queryFn: () => fetchRelatedProducts(slug),
    enabled: Boolean(slug),
    staleTime: 5 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
};

export const useSearchSuggestions = (q) => {
  return useQuery({
    queryKey: ['search', 'suggest', q],
    queryFn: () => fetchSearchSuggestions(q),
    enabled: Boolean(q && q.trim().length >= 2),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
};
