import { io } from 'socket.io-client';

// In production, we use the relative path (proxy handles it). In dev, we can use localhost or proxy.
// Leaving URL undefined means it connects to window.location.
const URL = import.meta.env.PROD ? undefined : 'http://localhost:3000';

export const socket = io(URL, {
    autoConnect: false,
    transports: ['websocket'],
});
