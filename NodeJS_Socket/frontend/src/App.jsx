import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('http://15.207.21.218', {
  transports: ['polling', 'websocket'],
  path: '/socket.io/'
});

function App() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socket.on('connect', () => {
      setConnected(true);
      console.log('websocket connected');
    });

    socket.on('disconnect', () => {
      setConnected(false);
      console.log('websocket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.log('websocket connection error:', error);
    });

    socket.on('message', (data) => {
      setMessages(prev => [data, ...prev]);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('message');
      socket.off('connect_error');
    };
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit('message', { message });
      setMessage('');
    }
  };

  return (
    <div className="App">
      <h1>Socket.IO Test</h1>
      <div className="status">
        Status: <span className={connected ? 'connected' : 'disconnected'}>
          {connected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
      
      <form onSubmit={sendMessage} className="message-form">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={!connected}
        />
        <button type="submit" disabled={!connected}>Send</button>
      </form>

      <div className="messages">
        <h3>Messages:</h3>
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <strong>{msg.id}:</strong> {msg.message}
            <small> ({new Date(msg.timestamp).toLocaleTimeString()})</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;