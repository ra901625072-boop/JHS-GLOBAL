import { useMutation } from '@tanstack/react-query';
import { submitRfq, submitSample } from './api';

export const useSubmitRfq = (options = {}) => {
  return useMutation({
    mutationFn: submitRfq,
    ...options,
  });
};

export const useSubmitSample = (options = {}) => {
  return useMutation({
    mutationFn: submitSample,
    ...options,
  });
};
