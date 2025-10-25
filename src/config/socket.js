import { io } from "socket.io-client";

// Force hardcode to localhost:5000 for testing
const WS_ENDPOINT = 'http://localhost:5000';

console.log('=== WEBSOCKET DEBUG ===');
console.log('WebSocket connecting to:', WS_ENDPOINT);
console.log('VITE_API_ENDPOINT:', import.meta.env.VITE_API_ENDPOINT);
console.log('Environment variables:', import.meta.env);
console.log('=== END WEBSOCKET DEBUG ===');

const socket = io(WS_ENDPOINT, {
    transports: ['websocket', 'polling'],
    timeout: 20000,  // 20 seconds
    reconnectionDelay: 1000,  // 1 second
    reconnectionAttempts: 5,  // 5 attempts
    maxReconnectionAttempts: 5,
    pingTimeout: 60000,  // 60 seconds (should be longer than backend ping_interval)
    pingInterval: 10000   // 25 seconds (should be shorter than backend ping_timeout)
});

// Immediate connection test
console.log('Socket created, checking connection status...');
console.log('Socket connected:', socket.connected);
console.log('Socket ID:', socket.id);

// Add connection event listeners for debugging
socket.on('connect', () => {
    console.log('Socket connected successfully:', socket.id);
});

socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
    console.error('Error details:', {
        message: error.message,
        description: error.description,
        context: error.context,
        type: error.type
    });
});

// socket.on('disconnect', (reason) => {
//     console.log('Socket disconnected:', reason);
// });

// Add more debugging events
socket.on('reconnect', (attemptNumber) => {
    console.log('Socket reconnected after', attemptNumber, 'attempts');
});

socket.on('reconnect_attempt', (attemptNumber) => {
    console.log('Socket reconnection attempt:', attemptNumber);
});

socket.on('reconnect_error', (error) => {
    console.error('Socket reconnection error:', error);
});

socket.on('reconnect_failed', () => {
    console.error('Socket reconnection failed');
});

export default socket;