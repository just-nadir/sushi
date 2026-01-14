import { io } from 'socket.io-client';

// Use same URL as API but without /api prefix if needed, or just localhost:3000
// Since API_URL might include '/api', let's use explicit URL for now
export const socket = io('http://localhost:3000', {
    autoConnect: false,
    transports: ['websocket'],
});
