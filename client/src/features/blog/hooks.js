import { useQuery } from '@tanstack/react-query';
import { fetchBlogPosts, fetchBlogPostBySlug } from './api';

export const useBlogPosts = (params = {}) => {
  return useQuery({
    queryKey: ['blog-posts', params],
    queryFn: () => fetchBlogPosts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
};

export const useBlogPost = (slug) => {
  return useQuery({
    queryKey: ['blog-post', slug],
    queryFn: () => fetchBlogPostBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
};
