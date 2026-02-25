// client/src/services/api.ts

import axios, { AxiosRequestConfig, InternalAxiosRequestConfig, AxiosError } from 'axios';

// Get the correct API URL based on environment
const getApiUrl = (): string => {
    // Priority 1: Environment variable
    if (process.env.REACT_APP_API_URL) {
        return process.env.REACT_APP_API_URL;
    }
    
    // Priority 2: Production detection
    if (process.env.NODE_ENV === 'production') {
        return 'https://task-manager-api.onrender.com/api'; // Your Render URL
    }
    
    // Priority 3: Local development
    return 'http://localhost:5000/api';
};

const API_URL = getApiUrl();
console.log('🚀 API URL:', API_URL);

const API = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true // Important for CORS with credentials
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
        const method = response.config.method?.toUpperCase() || 'UNKNOWN';
        console.log(`📥 ${response.status} ${method} ${response.config.url}`);
        return response;
    },
    (error: AxiosError) => {
        if (error.code === 'ERR_NETWORK') {
            console.error('❌ Network error - Cannot reach server at:', API_URL);
            console.error('💡 Check if backend is running and CORS is configured');
        } else if (error.response) {
            console.error(`❌ ${error.response.status} error:`, error.response.data);
        } else if (error.request) {
            console.error('❌ No response received from server');
        } else {
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

export default API;