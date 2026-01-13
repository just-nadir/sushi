import { io } from 'socket.io-client';

// Backend URL
const URL = 'http://localhost:3000';

export const socket = io(URL, {
    autoConnect: false,
});

export interface Order {
    id: number;
    status: string;
    totalAmount: number;
    comment?: string;
    createdAt: string;
    customerName: string;
    customerPhone: string;
    paymentType: 'CASH' | 'card';
    location?: string;
    address?: string;
    items: any[];
}
