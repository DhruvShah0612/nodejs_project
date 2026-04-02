const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:5173", "http://15.207.21.218"],
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true
});

app.use(cors());
app.use(express.json());

// MySQL connection
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '123',
  database: 'cloudflare_socket_test'
};

let db;

async function initDB() {
  try {
    db = await mysql.createConnection(dbConfig);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        message TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database connected and table created');
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}

// Socket.IO connection handling
console.log('Socket.IO server ready, waiting for connections...');

io.engine.on('connection_error', (err) => {
  console.log('Socket.IO engine error:', err.req.url, err.code, err.message);
});

io.on('connection', (socket) => {
  console.log('websocket connected:', socket.id);

  socket.on('message', async (data) => {
    try {
      // Save message to database
      await db.execute('INSERT INTO messages (message) VALUES (?)', [data.message]);
      
      // Broadcast message to all clients
      io.emit('message', {
        id: socket.id,
        message: data.message,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('websocket disconnected:', socket.id);
  });
});

// API endpoint to get recent messages
app.get('/api/messages', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM messages ORDER BY timestamp DESC LIMIT 10');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

const PORT = process.env.PORT || 3001;

initDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});