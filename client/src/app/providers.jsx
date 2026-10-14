import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { QuoteBasketProvider } from '../features/quoteBasket/context';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const AppProviders = ({ children }) => {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <QuoteBasketProvider>
          {children}
        </QuoteBasketProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default AppProviders;
