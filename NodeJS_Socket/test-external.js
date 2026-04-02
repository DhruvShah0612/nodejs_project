const io = require('socket.io-client');

const socket = io('http://15.207.21.218', {
  transports: ['polling', 'websocket'],
  path: '/socket.io/'
});

socket.on('connect', () => {
  console.log('✅ External connection successful');
  socket.emit('message', { message: 'Test from external' });
  setTimeout(() => socket.disconnect(), 1000);
});

socket.on('connect_error', (error) => {
  console.log('❌ External connection error:', error.message);
});

setTimeout(() => process.exit(1), 5000);