import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.PROD
  ? 'https://ideaflow-backend.onrender.com'
  : 'http://localhost:4000';

console.log('🔍 Socket URL:', SOCKET_URL);
console.log('🔍 Environment:', import.meta.env.MODE);

const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000,
  autoConnect: true
});

// Connection events
socket.on('connect', () => {
  console.log('✅ Socket connected! ID:', socket.id);
  console.log('✅ Transport:', socket.io.engine.transport.name);
});

socket.on('connect_error', (error) => {
  console.error('❌ Socket connection error:', error.message);
  console.error('❌ Error details:', error);
});

socket.on('disconnect', (reason) => {
  console.log('⚠️ Socket disconnected. Reason:', reason);
  if (reason === 'io server disconnect') {
    socket.connect();
  }
});

socket.on('reconnect_attempt', (attemptNumber) => {
  console.log('🔄 Reconnection attempt #' + attemptNumber);
});

socket.on('reconnect', (attemptNumber) => {
  console.log('✅ Reconnected after', attemptNumber, 'attempts');
});

socket.on('reconnect_failed', () => {
  console.error('❌ Reconnection failed after all attempts');
});

socket.on('error', (error) => {
  console.error('❌ Socket error:', error);
});

// Data events
socket.on('welcome', (data) => {
  console.log('👋 Welcome message:', data);
});

socket.on('session-data', (data) => {
  console.log('📥 Received session data:', data);
});

socket.on('board-updated', (data) => {
  console.log('📥 Board updated:', data);
});

export default socket;