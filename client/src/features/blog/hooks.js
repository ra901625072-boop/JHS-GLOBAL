import { useQuery } from '@tanstack/react-query';
import { fetchBlogPosts, fetchBlogPostBySlug } from './api';

export const useBlogPosts = (params = {}) => {
  return useQuery({
    queryKey: ['blog-posts', params],
    queryFn: () => fetchBlogPosts(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useBlogPost = (slug) => {
  return useQuery({
    queryKey: ['blog-post', slug],
    queryFn: () => fetchBlogPostBySlug(slug),
    enabled: !!slug,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};
