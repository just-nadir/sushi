import axios, { AxiosResponse } from 'axios';

// Backend URL
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    statusCode: number;
}

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to unwrap the response
api.interceptors.response.use((response: AxiosResponse<ApiResponse<any>>) => {
    // If backend sends { success: true, data: ... }, verify connection
    if (response.data && response.data.success !== undefined) {
        // Return the 'data' field directly, or the whole response if prefered.
        // But standard axios returns { data: ... }. 
        // Let's attach raw data to be safe, but typically we want `response.data.data`
        return { ...response, data: response.data.data };
    }
    return response;
});

export interface Category {
    id: string;
    name: string;
    image?: string;
    sortOrder: number;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image?: string;
    isAvailable: boolean;
    categoryId: string;
}
