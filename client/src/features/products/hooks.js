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
  });
};

export const useCategory = (slug) => {
  return useQuery({
    queryKey: ['category', slug],
    queryFn: () => fetchCategoryBySlug(slug),
    enabled: Boolean(slug),
  });
};

export const useProducts = (params = {}) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => fetchProducts(params),
  });
};

export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: fetchFeaturedProducts,
    staleTime: 10 * 60 * 1000,
  });
};

export const useProduct = (slug) => {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchProductBySlug(slug),
    enabled: Boolean(slug),
  });
};

export const useRelatedProducts = (slug) => {
  return useQuery({
    queryKey: ['products', 'related', slug],
    queryFn: () => fetchRelatedProducts(slug),
    enabled: Boolean(slug),
  });
};

export const useSearchSuggestions = (q) => {
  return useQuery({
    queryKey: ['search', 'suggest', q],
    queryFn: () => fetchSearchSuggestions(q),
    enabled: Boolean(q && q.trim().length >= 2),
    staleTime: 60 * 1000,
  });
};
