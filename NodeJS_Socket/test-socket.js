const io = require('socket.io-client');

const socket = io('http://localhost:3001', {
  transports: ['websocket', 'polling']
});

socket.on('connect', () => {
  console.log('✅ Socket connected locally');
  socket.disconnect();
});

socket.on('connect_error', (error) => {
  console.log('❌ Socket connection error:', error.message);
});

setTimeout(() => {
  console.log('Connection timeout');
  process.exit(1);
}, 5000);