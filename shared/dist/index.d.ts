export declare enum Role {
    ADMIN = "ADMIN",
    CUSTOMER = "CUSTOMER"
}
export declare enum OrderStatus {
    NEW = "NEW",
    CONFIRMED = "CONFIRMED",
    COOKING = "COOKING",
    READY = "READY",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED"
}
export declare enum OrderType {
    DELIVERY = "DELIVERY",
    PICKUP = "PICKUP"
}
export interface User {
    id: string;
    telegramId?: string | null;
    username?: string | null;
    fullName?: string | null;
    phone?: string | null;
    role: Role;
    createdAt: Date | string;
    updatedAt: Date | string;
}
export interface Category {
    id: string;
    name: string;
    image?: string | null;
    sortOrder: number;
    createdAt: Date | string;
    updatedAt: Date | string;
}
export interface Product {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    image?: string | null;
    isAvailable: boolean;
    categoryId: string;
    category?: Category;
    createdAt: Date | string;
    updatedAt: Date | string;
}
export interface OrderItem {
    id: string;
    quantity: number;
    price: number;
    productId: string;
    product?: Product;
    orderId: number;
}
export interface Order {
    id: number;
    status: OrderStatus;
    type: OrderType;
    totalAmount: number;
    address?: string | null;
    locationLat?: number | null;
    locationLon?: number | null;
    comment?: string | null;
    userId?: string | null;
    user?: User | null;
    items: OrderItem[];
    customerName?: string | null;
    customerPhone?: string | null;
    paymentType: string;
    createdAt: Date | string;
    updatedAt: Date | string;
}
export interface CreateOrderItemDto {
    productId: string;
    quantity: number;
}
export interface CreateOrderDto {
    type: OrderType;
    items: CreateOrderItemDto[];
    address?: string;
    locationLat?: number;
    locationLon?: number;
    comment?: string;
    customerName?: string;
    customerPhone?: string;
    paymentType?: string;
    userTelegramId?: string;
}
