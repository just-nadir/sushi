import axios from "axios";

export const API_URL = "http://localhost:3000/api";

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
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
    category?: Category;
}

// Upload helper
export const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    // Backend returns { url: "/uploads/..." }
    // TransformInterceptor wraps it: { success: true, data: { url: ... } }
    // We need to handle this.
    return res.data?.data?.url || res.data?.url;
};

// Interceptor for unwrapping response
api.interceptors.response.use((response) => {
    if (response.data && response.data.success) {
        return response.data; // Return { success: true, data: ... }
    }
    return response;
});
