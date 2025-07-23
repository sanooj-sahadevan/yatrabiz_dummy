import { apiClient } from '../client';
import { API_ENDPOINTS } from '@/constants/api';

export const authService = {
  logout: async (type = 'admin') => {
    return apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, { type });
  },
}; 