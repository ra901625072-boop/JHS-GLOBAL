import { useQuery } from '@tanstack/react-query';
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
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 2 * 60 * 60 * 1000,
  });
};

export const useCategory = (slug) => {
  return useQuery({
    queryKey: ['category', slug],
    queryFn: () => fetchCategoryBySlug(slug),
    enabled: Boolean(slug),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000,
  });
};

export const useProducts = (params = {}) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => fetchProducts(params),
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 60 * 60 * 1000,
  });
};

export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: fetchFeaturedProducts,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
};

export const useProduct = (slug) => {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchProductBySlug(slug),
    enabled: Boolean(slug),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000,
  });
};

export const useRelatedProducts = (slug) => {
  return useQuery({
    queryKey: ['products', 'related', slug],
    queryFn: () => fetchRelatedProducts(slug),
    enabled: Boolean(slug),
    staleTime: 30 * 60 * 1000,
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
