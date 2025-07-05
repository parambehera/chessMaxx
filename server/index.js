const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config(); // Load environment variables from .env file

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.VITE_SOCKET_URL ,// Use VITE_SOCKET_URL or default to localhost
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const rooms = {}; // roomId -> [socket1.id, socket2.id]
const socketToRoom = {}; // socket.id -> roomId

io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  socket.on('join-room', (roomId) => {
    console.log(`📥 ${socket.id} wants to join room: ${roomId}`);
    if (!rooms[roomId]) rooms[roomId] = [];

    const players = rooms[roomId];

    // Prevent duplicate entries
    if (!players.includes(socket.id)) {
      players.push(socket.id);
    }

    if (players.length > 2) {
      socket.emit('room-full');
      return;
    }

    socketToRoom[socket.id] = roomId;
    socket.join(roomId);

    let assignedColor = null;
    if (players.length === 1) assignedColor = 'white';
    else if (players.length === 2) assignedColor = 'black';

    // Start game when both players are in
    if (players.length === 2) {
      const whiteId = players[0];
      const blackId = players[1];
      const whiteSocket = io.sockets.sockets.get(whiteId);
      const blackSocket = io.sockets.sockets.get(blackId);
      const timers = { white: 300, black: 300 };

      whiteSocket?.emit('match-found', { color: 'white', roomId, timers });
      blackSocket?.emit('match-found', { color: 'black', roomId, timers });

      // ✅ Notify both players that opponent is connected (fixes timer)
      whiteSocket?.emit('opponent-connected');
      blackSocket?.emit('opponent-connected');
    }
  });

  socket.on('move', ({ from, to, fen, whiteTime, blackTime, roomId }) => {
    socket.to(roomId).emit('opponent-move', { from, to, whiteTime, blackTime });
  });

  socket.on('rematch', ({ roomId }) => {
    console.log(`🔁 Rematch request in room: ${roomId}`);
    socket.to(roomId).emit('rematch-request');
  });

  socket.on('pause-game', ({ roomId }) => {
    console.log(`⏸ Game paused in room ${roomId}`);
    io.to(roomId).emit('pause-game');
  });

  socket.on('resume-game', ({ roomId }) => {
    io.to(roomId).emit('resume-game', {
      whiteTime: 300,
      blackTime: 300,
    });
    console.log(`▶️ Game resumed in room ${roomId}`);
  });

  socket.on('disconnect', () => {
    console.log('❌ Disconnected:', socket.id);
    const roomId = socketToRoom[socket.id];
    delete socketToRoom[socket.id];

    if (!roomId) return;
    rooms[roomId] = rooms[roomId]?.filter((id) => id !== socket.id);

    if (rooms[roomId]?.length === 1) {
      io.to(roomId).emit('pause-game');
    }

    if (rooms[roomId]?.length === 0) {
      delete rooms[roomId];
    }
  });
});

server.listen(4000, () => {
  console.log('🚀 Server running on http://localhost:4000');
});
