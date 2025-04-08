import { spawn } from 'child_process';
import { createInterface } from 'readline';

// Colors for different services
const colors = {
  react: 'cyan',
  websocket: 'yellow',
  mcp: 'green'
};

// Function to create a readline interface for a process
const createProcessLogger = (process: any, serviceName: string) => {
  const rl = createInterface({
    input: process.stdout
  });

  rl.on('line', (line) => {
    console.log(`[${serviceName}] ${line}`);
  });

  const errorRl = createInterface({
    input: process.stderr
  });

  errorRl.on('line', (line) => {
    console.error(`[${serviceName}] Error: ${line}`);
  });

  return { rl, errorRl };
};

// Start all services
console.log('Starting all services...');

// Start React app
const reactApp = spawn('npm', ['start'], { 
  env: { ...process.env, FORCE_COLOR: '1' }
});
createProcessLogger(reactApp, 'React');

// Start WebSocket server
const websocketServer = spawn('tsx', ['src/server/websocketServer.ts'], {
  env: { ...process.env, FORCE_COLOR: '1' }
});
createProcessLogger(websocketServer, 'WebSocket');

// Function to handle process exit
const handleExit = () => {
  console.log('\nShutting down all services...');
  reactApp.kill();
  websocketServer.kill();
  process.exit();
};

// Handle process termination
process.on('SIGINT', handleExit);
process.on('SIGTERM', handleExit);

// Check if all services are running
const checkServices = () => {
  if (reactApp.killed) {
    console.error('React app has stopped unexpectedly');
    handleExit();
  }
  if (websocketServer.killed) {
    console.error('WebSocket server has stopped unexpectedly');
    handleExit();
  }
};

// Check services status every 5 seconds
setInterval(checkServices, 5000);

console.log('\nAll services started! Press Ctrl+C to stop all services.\n'); 