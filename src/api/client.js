import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function getApiError(error, fallback) {
  return error.response?.data?.error || fallback;
}
