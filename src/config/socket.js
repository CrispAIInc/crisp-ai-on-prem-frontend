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
    timeout: 180000,  // Increased timeout
    reconnectionDelay: 12000,  // Increased delay
    reconnectionAttempts: 0,  // More attempts
    maxReconnectionAttempts: 10,
    pingTimeout: 180000,  // Increased ping timeout
    pingInterval: 180000   // Increased ping interval
});

// Immediate connection test
console.log('Socket created, checking connection status...');
console.log('Socket connected:', socket.connected);
console.log('Socket ID:', socket.id);

// Add connection event listeners for debugging
socket.on('connect', () => {
    console.log('Socket connected successfully:', socket.id);

    // Generate or reuse a session ID
    const sessionId = localStorage.getItem("sessionId") || crypto.randomUUID();
    localStorage.setItem("sessionId", sessionId);

    // Tell the backend to join this session
    socket.emit("join_session", { session_id: sessionId });
});

socket.on('disconnect', (reason) => {
    console.log('Disconnected from server:', reason);
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