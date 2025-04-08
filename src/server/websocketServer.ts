import { WebSocketServer } from 'ws';
import http from 'http';

// Create HTTP server
const server = http.createServer();

// Create WebSocket server
const wss = new WebSocketServer({ server, path: '/ws' });

// Store connected clients
const clients = new Set();

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('[WebSocket] Client connected');
  clients.add(ws);

  // Send client ID
  ws.send(JSON.stringify({
    type: 'info',
    clientId: clients.size
  }));

  // Handle incoming messages
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('[WebSocket] Received message:', message);

      // Broadcast message to all connected clients except sender
      clients.forEach((client: any) => {
        if (client !== ws && client.readyState === 1) {
          console.log('[WebSocket] Broadcasting message to client');
          client.send(JSON.stringify(message));
        }
      });
    } catch (error) {
      console.error('[WebSocket] Error processing message:', error);
    }
  });

  // Handle client disconnection
  ws.on('close', () => {
    console.log('[WebSocket] Client disconnected');
    clients.delete(ws);
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error('[WebSocket] Client error:', error);
    clients.delete(ws);
  });
});

// Start server
const PORT = 3002;
server.listen(PORT, () => {
  console.log(`[WebSocket] Server is running on port ${PORT}`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('[WebSocket] Server error:', error);
});

export default server; 