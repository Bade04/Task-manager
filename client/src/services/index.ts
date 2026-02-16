import axios from 'axios';
import { AuthResponse, LoginData, RegisterData, Task, TaskFormData } from '../types';

const API = axios.create({
    baseURL: 'http://localhost:5000/api'
});

// Add token to every request if it exists
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['x-auth-token'] = token;
    }
    return config;
});

// Auth endpoints
export const register = (data: RegisterData) => 
    API.post<AuthResponse>('/auth/register', data);

export const login = (data: LoginData) => 
    API.post<AuthResponse>('/auth/login', data);

export const getCurrentUser = () => 
    API.get<{ id: number; name: string; email: string }>('/auth/me');

// Task endpoints
export const getTasks = () => 
    API.get<Task[]>('/tasks');

export const getTask = (id: number) => 
    API.get<Task>(`/tasks/${id}`);

export const createTask = (data: TaskFormData) => 
    API.post<Task>('/tasks', data);

export const updateTask = (id: number, data: TaskFormData) => 
    API.put<Task>(`/tasks/${id}`, data);

export const deleteTask = (id: number) => 
    API.delete(`/tasks/${id}`);