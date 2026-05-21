// tmi-platform/apps/web/socket-server.ts
import { Server } from 'socket.io';

const PORT = 3001;

console.log(`Starting Socket.IO server on port ${PORT}...`);

const io = new Server(PORT, {
  cors: {
    origin: "http://localhost:3000", // Allow connections from the Next.js app
    methods: ["GET", "POST"],
  },
});

io.on('connection', (socket) => {
  console.log(`[${socket.id}] a user connected`);

  // Listen for new messages
  socket.on('chat message', (msg: { text: string, user: string }) => {
    console.log(`[${socket.id}] message: ${msg.text}`);
    // Broadcast the message to everyone
    io.emit('chat message', { ...msg, id: new Date().getTime() });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`[${socket.id}] user disconnected`);
  });
});

console.log(`Socket.IO server listening on port ${PORT}`);
