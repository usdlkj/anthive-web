// lib/axios.ts
import axios from 'axios';
import { getApiBaseUrl } from './api';

const axiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true, // optional: if you’re using cookies
});

export default axiosInstance;