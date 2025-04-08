import React from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';
import { Box, Tooltip } from '@mui/material';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

const WebSocketStatus: React.FC = () => {
  const { status, ws } = useWebSocket();  

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return '#4caf50'; // Green
      case 'connecting':
        return '#ff9800'; // Yellow/Orange
      case 'disconnected':
        return '#f44336'; // Red
      default:
        return '#757575'; // Grey
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'WebSocket Connected';
      case 'connecting':
        return 'WebSocket Connecting...';
      case 'disconnected':
        return 'WebSocket Disconnected';
      default:
        return 'WebSocket Status Unknown';
    }
  };

  return (
    <Tooltip title={getStatusText()}>
      <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
        <FiberManualRecordIcon
          sx={{
            color: getStatusColor(),
            fontSize: '12px',
            animation: status === 'connecting' ? 'pulse 1.5s infinite' : 'none',
            '@keyframes pulse': {
              '0%': { opacity: 1 },
              '50%': { opacity: 0.4 },
              '100%': { opacity: 1 },
            },
          }}
        />
      </Box>
    </Tooltip>
  );
};

export default WebSocketStatus; 