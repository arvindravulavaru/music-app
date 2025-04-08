import React, { useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useWebSocket } from '../contexts/WebSocketContext';

const testSequence = {
  bpm: 120,
  piano: [
    { note: "C4", time: 0, duration: "4n", velocity: 0.7 },
    { note: "E4", time: "0:1", duration: "4n", velocity: 0.7 },
    { note: "G4", time: "0:2", duration: "4n", velocity: 0.7 }
  ],
  guitar: [
    { note: "C3", time: "0:0:2", duration: "8n", velocity: 0.8 },
    { note: "E3", time: "0:1:2", duration: "8n", velocity: 0.8 },
    { note: "G3", time: "0:2:2", duration: "8n", velocity: 0.8 }
  ],
  drums: [
    { piece: "Kick", time: 0, velocity: 0.9 },
    { piece: "Hi-Hat", time: "0:1", velocity: 0.7 },
    { piece: "Snare", time: "0:2", velocity: 0.8 },
    { piece: "Hi-Hat", time: "0:3", velocity: 0.7 }
  ]
};

const WebSocketTest: React.FC = () => {
  const { isConnected, sequence, sendMessage } = useWebSocket();

  useEffect(() => {
    if (sequence) {
      console.log('Received sequence:', sequence);
    }
  }, [sequence]);

  const handleSendSequence = () => {
    console.log('Sending test sequence...');
    sendMessage({
      type: 'sequence',
      data: testSequence
    });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        WebSocket Test Component
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Typography>
          Connection Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </Typography>
      </Box>
      <Button 
        variant="contained" 
        onClick={handleSendSequence}
        disabled={!isConnected}
      >
        Send Test Sequence
      </Button>
      {sequence && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" sx={{ color: '#2196f3', fontWeight: 'bold' }}>
            Last Received Sequence:
          </Typography>
          <pre style={{ 
            backgroundColor: '#1a1a1a', 
            padding: '1rem', 
            borderRadius: '4px',
            maxHeight: '200px',
            overflow: 'auto',
            color: '#4caf50',
            fontFamily: 'monospace'
          }}>
            {JSON.stringify(sequence, null, 2)}
          </pre>
        </Box>
      )}
    </Box>
  );
};

export default WebSocketTest; 