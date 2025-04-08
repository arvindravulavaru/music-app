import React from 'react';
import { Box, Container, Typography, AppBar, Toolbar } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import VirtualInstruments from './components/VirtualInstruments';
import WebSocketTest from './components/WebSocketTest';
import { WebSocketProvider } from './contexts/WebSocketContext';
import WebSocketStatus from './components/WebSocketStatus';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <BrowserRouter>
        <WebSocketProvider>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <AppBar position="static">
              <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                  Virtual Rock Band
                </Typography>
                <WebSocketStatus />
              </Toolbar>
            </AppBar>
            <Routes>
              <Route path="/" element={
                <Container maxWidth="lg" sx={{ mt: 4 }}>
                  <VirtualInstruments />
                </Container>
              } />
              <Route path="/debug" element={
                <Container maxWidth="lg" sx={{ mt: 4 }}>
                  <WebSocketTest />
                </Container>
              } />
            </Routes>
          </Box>
        </WebSocketProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
