// client/src/services/api.ts

import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios';

// Get the correct API URL based on environment
const getApiUrl = (): string => {
    if (process.env.REACT_APP_API_URL) {
        console.log('✅ Using API URL from env:', process.env.REACT_APP_API_URL);
        return process.env.REACT_APP_API_URL;
    }
    
    if (process.env.NODE_ENV === 'production') {
        const productionUrl = 'https://task-manager-api.onrender.com/api';
        console.log('✅ Using production URL:', productionUrl);
        return productionUrl;
    }
    
    const localUrl = 'http://localhost:5000/api';
    console.log('✅ Using local development URL:', localUrl);
    return localUrl;
};

const API_URL = getApiUrl();
console.log('🚀 Final API Base URL:', API_URL);

const API = axios.create({
    baseURL: API_URL,
    timeout: 60000, // 60s - Render free tier cold start can take 30-60s
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

// Request interceptor
API.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['x-auth-token'] = token;
        }
        
        console.log(`📤 ${config.method?.toUpperCase() || 'UNKNOWN'} ${config.baseURL}${config.url}`);
        console.log('Request headers:', config.headers);
        console.log('Request data:', config.data);
        
        return config;
    },
    (error: AxiosError): Promise<AxiosError> => {
        console.error('❌ Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
API.interceptors.response.use(
    (response) => {
        console.log(`📥 ${response.status} ${response.config.url}`);
        console.log('Response data:', response.data);
        return response;
    },
    (error: AxiosError) => {
        if (error.code === 'ERR_NETWORK') {
            console.error('❌ Network error - Cannot reach server at:', API_URL);
            console.error('💡 Check if backend is running');
        } else if (error.response) {
            console.error(`❌ ${error.response.status} error:`, error.response.data);
            console.error('Status:', error.response.status);
            console.error('Headers:', error.response.headers);
        } else if (error.request) {
            console.error('❌ No response received from server');
        } else {
            console.error('❌ Error:', error.message);
        }
        return Promise.reject(error);
    }
);

// Types
export interface LoginResponse {
    token: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
}

export interface RegisterResponse {
    token: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
}

// Auth endpoints
export const registerUser = (data: { name: string; email: string; password: string }) => 
    API.post<RegisterResponse>('/auth/register', data);

export const loginUser = (data: { email: string; password: string }) => 
    API.post<LoginResponse>('/auth/login', data);

export const getCurrentUser = () => 
    API.get<{ id: number; name: string; email: string }>('/auth/me');

// Task endpoints
export const getTasks = () => 
    API.get('/tasks');

export const createTask = (data: any) => 
    API.post('/tasks', data);

export const updateTask = (id: number, data: any) => 
    API.put(`/tasks/${id}`, data);

export const deleteTask = (id: number) => 
    API.delete(`/tasks/${id}`);

// Test endpoint
export const testCors = () => 
    API.get('/cors-test');

export default API;