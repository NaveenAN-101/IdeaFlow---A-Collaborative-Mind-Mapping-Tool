import { io } from "socket.io-client";

// This logic automatically switches between your local server and your live server.
// - In development (`npm run dev`), it uses localhost:4000.
// - In production (after deploying to Vercel), it uses your live Render URL.

const SOCKET_URL = import.meta.env.PROD 
  ? 'https://ideaflow-backend.onrender.com'  // <-- PASTE YOUR RENDER.COM URL HERE
  : 'http://localhost:4000';                 // <-- Your local server port (already correct)

console.log('Connecting to WebSocket server at:', SOCKET_URL);

export const socket = io(SOCKET_URL, {
  // Use both transports as a fallback for networks that might block WebSockets
  transports: ['websocket', 'polling'], 
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export default socket;