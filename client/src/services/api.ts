// client/src/services/api.ts

import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios';

// Get the correct API URL based on environment
const getApiUrl = (): string => {
    // Priority 1: Environment variable
    if (process.env.REACT_APP_API_URL) {
        console.log('✅ Using API URL from env:', process.env.REACT_APP_API_URL);
        return process.env.REACT_APP_API_URL;
    }
    
    // Priority 2: Production detection
    if (process.env.NODE_ENV === 'production') {
        const productionUrl = 'https://task-manager-api.onrender.com/api';
        console.log('✅ Using production URL:', productionUrl);
        return productionUrl;
    }
    
    // Priority 3: Local development
    const localUrl = 'http://localhost:5000/api';
    console.log('✅ Using local development URL:', localUrl);
    return localUrl;
};

const API_URL = getApiUrl();
console.log('🚀 Final API Base URL:', API_URL);

const API = axios.create({
    baseURL: API_URL,
    timeout: 15000, // Increased timeout for slow networks
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true // CRITICAL for CORS with credentials
});

// Request interceptor with proper typing
API.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['x-auth-token'] = token;
        }
        
        // Safe access to config.method with fallback
        const method = config.method?.toUpperCase() || 'UNKNOWN';
        console.log(`📤 ${method} ${config.baseURL}${config.url}`);
        console.log('Request headers:', config.headers);
        
        return config;
    },
    (error: AxiosError): Promise<AxiosError> => {
        console.error('❌ Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor with better error handling
API.interceptors.response.use(
    (response) => {
        const method = response.config.method?.toUpperCase() || 'UNKNOWN';
        console.log(`📥 ${response.status} ${method} ${response.config.url}`);
        console.log('Response data:', response.data);
        return response;
    },
    (error: AxiosError) => {
        if (error.code === 'ERR_NETWORK') {
            console.error('❌ Network error - Cannot reach server at:', API_URL);
            console.error('💡 Check if backend is running and CORS is configured');
            console.error('💡 Try visiting:', API_URL.replace('/api', ''));
        } else if (error.response) {
            // The request was made and the server responded with a status code
            console.error(`❌ ${error.response.status} error:`, error.response.data);
            console.error('Status:', error.response.status);
            console.error('Headers:', error.response.headers);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('❌ No response received from server');
            console.error('Request:', error.request);
        } else {
            // Something happened in setting up the request
            console.error('❌ Error:', error.message);
        }
        
        return Promise.reject(error);
    }
);

// TypeScript interfaces for API responses
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

export interface TaskResponse {
    id: number;
    user_id: number;
    title: string;
    description: string | null;
    status: 'pending' | 'in_progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    due_date: string | null;
    created_at: string;
    updated_at: string;
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
    API.get<TaskResponse[]>('/tasks');

export const getTask = (id: number) => 
    API.get<TaskResponse>(`/tasks/${id}`);

export const createTask = (data: { 
    title: string; 
    description?: string; 
    status?: string; 
    priority?: string; 
    due_date?: string 
}) => 
    API.post<TaskResponse>('/tasks', data);

export const updateTask = (id: number, data: { 
    title?: string; 
    description?: string | null; 
    status?: string; 
    priority?: string; 
    due_date?: string | null 
}) => 
    API.put<TaskResponse>(`/tasks/${id}`, data);

export const deleteTask = (id: number) => 
    API.delete(`/tasks/${id}`);

// Test function to check CORS
export const testCors = () => 
    API.get('/cors-test');

export default API;