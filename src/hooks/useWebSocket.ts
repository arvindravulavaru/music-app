import { useEffect, useRef, useState, useCallback } from 'react';

interface WebSocketMessage {
  type: string;
  data?: any;
  message?: string;
}

export const useWebSocket = (url: string) => {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sequence, setSequence] = useState<any>(null);

  useEffect(() => {
    // Create WebSocket connection
    ws.current = new WebSocket(url);

    // Connection opened
    ws.current.onopen = () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
    };

    // Listen for messages
    ws.current.onmessage = (event) => {
      const message: WebSocketMessage = JSON.parse(event.data);
      
      switch (message.type) {
        case 'sequence':
          setSequence(message.data);
          break;
        case 'info':
          console.log('Server message:', message.message);
          break;
        default:
          console.warn('Unknown message type:', message.type);
      }
    };

    // Handle connection close
    ws.current.onclose = () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
    };

    // Handle errors
    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    // Cleanup on unmount
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [url]);

  // Send message to server
  const sendMessage = useCallback((message: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);

  return {
    isConnected,
    sequence,
    sendMessage
  };
}; 