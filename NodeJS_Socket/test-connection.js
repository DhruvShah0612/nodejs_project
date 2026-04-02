// Simple test to check if server is accessible
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/socket.io/',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log('Socket.IO endpoint accessible:', res.statusCode);
});

req.on('error', (err) => {
  console.log('Socket.IO endpoint error:', err.message);
});

req.end();