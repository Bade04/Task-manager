// src/services/api.ts
import axios from 'axios';
import { 
    AuthResponse, 
    LoginData, 
    RegisterData, 
    Task, 
    TaskFormData, 
    TaskUpdateData,
    User 
} from '../types';

const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    }
});

// Request interceptor to add token
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['x-auth-token'] = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth endpoints
export const register = (data: RegisterData) => 
    API.post<AuthResponse>('/auth/register', data);

export const login = (data: LoginData) => 
    API.post<AuthResponse>('/auth/login', data);

export const getCurrentUser = () => 
    API.get<User>('/auth/me');

// Task endpoints
export const getTasks = () => 
    API.get<Task[]>('/tasks');

export const getTask = (id: number) => 
    API.get<Task>(`/tasks/${id}`);

export const createTask = (data: TaskFormData) => 
    API.post<Task>('/tasks', data);

export const updateTask = (id: number, data: TaskUpdateData) => 
    API.put<Task>(`/tasks/${id}`, data);

export const deleteTask = (id: number) => 
    API.delete(`/tasks/${id}`);

export default API;