import { useQuery } from '@tanstack/react-query';
import {
  fetchCertificates,
  fetchTestimonials,
  fetchMarketRegions,
  fetchFaqs,
} from './api';

export const useCertificates = () => {
  return useQuery({
    queryKey: ['certificates'],
    queryFn: fetchCertificates,
    staleTime: 60 * 60 * 1000,
  });
};

export const useTestimonials = () => {
  return useQuery({
    queryKey: ['testimonials'],
    queryFn: fetchTestimonials,
    staleTime: 60 * 60 * 1000,
  });
};

export const useMarketRegions = () => {
  return useQuery({
    queryKey: ['market-regions'],
    queryFn: fetchMarketRegions,
    staleTime: 60 * 60 * 1000,
  });
};

export const useFaqs = (group) => {
  return useQuery({
    queryKey: ['faqs', group],
    queryFn: () => fetchFaqs(group),
    staleTime: 60 * 60 * 1000,
  });
};
