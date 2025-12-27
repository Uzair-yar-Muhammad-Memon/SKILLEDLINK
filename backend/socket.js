let io;

module.exports = {
  init: (httpServer) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      process.env.FRONTEND_URL
    ].filter(Boolean);

    io = require('socket.io')(httpServer, {
      cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    io.on('connection', (socket) => {
      console.log('✅ New client connected:', socket.id);

      // User/Worker joins their personal room
      socket.on('join', (data) => {
        const { userId, role } = data;
        const room = role === 'user' ? `user_${userId}` : `worker_${userId}`;
        socket.join(room);
        console.log(`User ${userId} (${role}) joined room: ${room}`);
      });

      // Join specific service request room for messaging
      socket.on('joinRequest', (requestId) => {
        socket.join(`request_${requestId}`);
        console.log(`Socket ${socket.id} joined request room: ${requestId}`);
      });

      // Leave service request room
      socket.on('leaveRequest', (requestId) => {
        socket.leave(`request_${requestId}`);
        console.log(`Socket ${socket.id} left request room: ${requestId}`);
      });

      // Typing indicator
      socket.on('typing', (data) => {
        const { requestId, userId, userName, isTyping } = data;
        socket.to(`request_${requestId}`).emit('userTyping', {
          userId,
          userName,
          isTyping
        });
      });

      // Online status
      socket.on('setOnline', (data) => {
        const { userId, role } = data;
        const room = role === 'user' ? `user_${userId}` : `worker_${userId}`;
        io.emit('userOnline', { userId, role, online: true });
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    return io;
  },

  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  }
};
