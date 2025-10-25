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

let boardState = [];

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.emit('load', boardState);

  socket.on('add_node', (node) => {
    boardState.push(node);
    socket.broadcast.emit('add_node', node);
  });

  socket.on('update_node', (updatedNode) => {
    boardState = boardState.map(n => n.id === updatedNode.id ? updatedNode : n);
    socket.broadcast.emit('update_node', updatedNode);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

httpServer.listen(3001, () => console.log('✅ Server running at http://localhost:3001'));

