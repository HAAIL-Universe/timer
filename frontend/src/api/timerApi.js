import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const createTimer = async () => {
  const response = await apiClient.post('/timers');
  return response.data;
};

export const getTimer = async (timerId) => {
  const response = await apiClient.get(`/timers/${timerId}`);
  return response.data;
};

export const startTimer = async (timerId) => {
  const response = await apiClient.post(`/timers/${timerId}/start`);
  return response.data;
};

export const stopTimer = async (timerId) => {
  const response = await apiClient.post(`/timers/${timerId}/stop`);
  return response.data;
};
