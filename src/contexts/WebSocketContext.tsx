import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Tone from 'tone';

type WebSocketStatus = 'connected' | 'connecting' | 'disconnected';

interface WebSocketContextType {
  status: WebSocketStatus;
  ws: WebSocket | null;
  clientId: number | null;
  sequence: any | null;
  isConnected: boolean;
  sendMessage: (message: any) => void;
}

const WebSocketContext = createContext<WebSocketContextType>({
  status: 'disconnected',
  ws: null,
  clientId: null,
  sequence: null,
  isConnected: false,
  sendMessage: () => {}
});

export const useWebSocket = (): WebSocketContextType => useContext(WebSocketContext);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [status, setStatus] = useState<WebSocketStatus>('disconnected');
  const [clientId, setClientId] = useState<number | null>(null);
  const [sequence, setSequence] = useState<any | null>(null);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);

  useEffect(() => {
    const connectWebSocket = () => {
      // debugger;
      if (ws?.readyState === WebSocket.OPEN) {
        console.log('[WebSocket] Already connected, skipping connection');
        return;
      }

      // Determine the WebSocket URL based on the environment
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const hostname = window.location.hostname;
      const wsUrl = `${protocol}//${hostname}${hostname === 'localhost' ? ':3002' : ''}/ws`;
      
      console.log(`[WebSocket] Attempting connection to ${wsUrl} (attempt ${reconnectAttempt + 1})`);
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log('[WebSocket] Connection established');
        setStatus('connected');
        setReconnectAttempt(0);
      };

      socket.onclose = (event) => {
        console.log(`[WebSocket] Connection closed. Code: ${event.code}, Reason: ${event.reason || 'No reason provided'}`);
        setStatus('disconnected');
        setClientId(null);
        setWs(null);  // Clear the socket reference
        
        // Try to reconnect after delay that increases with each attempt
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempt), 30000);
        console.log(`[WebSocket] Attempting reconnection in ${delay}ms`);
        setTimeout(() => {
          setReconnectAttempt(prev => prev + 1);
          setStatus('connecting');
        }, delay);
      };

      socket.onerror = (error) => {
        console.error('[WebSocket] Connection error:', error);
        setStatus('disconnected');
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if(data.type !== 'ping') {
          console.log('[WebSocket] Received message in context:', data);
          }
          // Handle different message types
          switch (data.type) {
            case 'info':
              if (data.clientId) {
                console.log(`[WebSocket] Assigned client ID: ${data.clientId}`);
                setClientId(data.clientId);
              }
              break;
            case 'sequence':
              console.log('[WebSocket] Received sequence message:', data);
              // debugger;
              // Extract the actual sequence data
              const sequenceData = data.data || data.sequence || data;
              console.log('[WebSocket] Setting sequence data in context:', sequenceData);
              setSequence((prev: any) => {
                if (JSON.stringify(prev) === JSON.stringify(sequenceData)) {
                  console.log('[WebSocket] Sequence unchanged, skipping update');
                  return prev;
                }
                return sequenceData;
              });
              break;
            case 'error':
              console.error('[WebSocket] Server error:', data.message);
              break;
            default:
              // console.log('[WebSocket] Unknown message type:', data.type);
          }
        } catch (error) {
          console.error('[WebSocket] Error parsing message:', error);
          console.error('[WebSocket] Raw message:', event.data);
        }
      };

      setWs(socket);
      setStatus('connecting');

      // Ping to keep connection alive
      const pingInterval = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          // console.log('[WebSocket] Sending ping');
          socket.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000);

      return () => {
        console.log('[WebSocket] Cleaning up connection');
        clearInterval(pingInterval);
        if (socket.readyState === WebSocket.OPEN) {
          socket.close();
        }
      };
    };

    connectWebSocket();
  }, [reconnectAttempt, ws?.readyState]);

  return (
    <WebSocketContext.Provider value={{ 
      status, 
      ws, 
      clientId, 
      sequence,
      isConnected: status === 'connected',
      sendMessage: (message: any) => {
        if (ws?.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(message));
        } else {
          console.warn('[WebSocket] Cannot send message: connection not open');
        }
      }
    }}>
      {children}
    </WebSocketContext.Provider>
  );
}; 