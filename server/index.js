 const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

let sessions = {}; // { [sessionId]: { nodes: [], connections: [] } }

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Create a new collaborative session
  socket.on('create_session', () => {
    const sessionId = Math.random().toString(36).slice(2, 10);
    sessions[sessionId] = { nodes: [], connections: [] };
    socket.join(sessionId);
    socket.emit('session_created', { sessionId });
    socket.emit('board_load', sessions[sessionId]);
  });

  // Join an existing session
  socket.on('join_session', (sessionId) => {
    if (!sessions[sessionId]) {
      socket.emit('error_message', 'Invalid session ID');
      return;
    }
    socket.join(sessionId);
    socket.emit('session_joined', { sessionId });
    socket.emit('board_load', sessions[sessionId]);
  });

  // Node CRUD
  socket.on('add_node', ({ sessionId, node }) => {
    const s = sessions[sessionId];
    if (!s) return;
    s.nodes.push(node);
    socket.to(sessionId).emit('add_node', { node });
  });

  socket.on('update_node', ({ sessionId, node }) => {
    const s = sessions[sessionId];
    if (!s) return;
    s.nodes = s.nodes.map(n => n.id === node.id ? node : n);
    socket.to(sessionId).emit('update_node', { node });
  });

  socket.on('delete_node', ({ sessionId, nodeId }) => {
    const s = sessions[sessionId];
    if (!s) return;
    s.nodes = s.nodes.filter(n => n.id !== nodeId);
    s.connections = s.connections.filter(c => c.from !== nodeId && c.to !== nodeId);
    io.to(sessionId).emit('delete_node', { nodeId });
  });

  // Connections
  socket.on('add_connection', ({ sessionId, connection }) => {
    const s = sessions[sessionId];
    if (!s) return;
    const exists = s.connections.some(c => c.from === connection.from && c.to === connection.to);
    if (!exists) {
      s.connections.push(connection);
      socket.to(sessionId).emit('add_connection', { connection });
    }
  });

  socket.on('delete_connection', ({ sessionId, from, to }) => {
    const s = sessions[sessionId];
    if (!s) return;
    s.connections = s.connections.filter(c => !(c.from === from && c.to === to));
    io.to(sessionId).emit('delete_connection', { from, to });
  });

  // Replace entire board (sync)
  socket.on('update_board', ({ sessionId, board }) => {
    const s = sessions[sessionId];
    if (!s) return;
    sessions[sessionId] = board;
    socket.to(sessionId).emit('board_updated', board);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

httpServer.listen(3001, () => console.log('✅ Server running at http://localhost:3001'));

