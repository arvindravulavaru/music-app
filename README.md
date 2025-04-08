# Virtual Rock Band

A React-based virtual music player that allows you to create and play musical sequences using WebSocket communication and Tone.js.

## Features

- Real-time music playback using Tone.js
- Multiple virtual instruments (piano, guitar, drums)
- WebSocket-based communication for sequence playback
- Support for complex musical timing and notation
- Adjustable BPM and velocity controls

## System Architecture

### Components Overview
```
┌─────────────┐    ┌──────────────┐    ┌────────────────┐
│   MCP       │    │   WebSocket  │    │  React App     │
│   Server    │───▶│   Server     │───▶│  (Tone.js)     │
└─────────────┘    └──────────────┘    └────────────────┘
```

The application uses a three-tier architecture:

1. **MCP Server (Port 3001)**
   - Handles sequence validation using Zod schemas
   - Formats and forwards sequences to WebSocket server
   - Provides a standardized interface for sending musical sequences

2. **WebSocket Server (Port 3002)**
   - Manages real-time communication
   - Broadcasts sequences to connected clients
   - Handles client connections and disconnections

3. **React Frontend**
   - Uses WebSocket context for real-time updates
   - Processes sequences using Tone.js
   - Manages audio playback and visualization

### Message Flow
1. Client sends sequence to MCP server
2. MCP validates and formats the sequence
3. WebSocket server broadcasts the sequence
4. React components receive and process the sequence
5. Tone.js handles audio synthesis and playback

### WebSocket Messages
```typescript
// Sequence message format
{
  type: 'sequence',
  sequence: {
    bpm: number,
    piano: Note[],
    guitar: Note[],
    drums: DrumHit[]
  }
}
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Start the MCP server:
```bash
npm run start:mcp
```

## Usage

The application accepts musical sequences in the following format:

```javascript
{
  "bpm": 120,
  "piano": [
    { "note": "C4", "time": 0, "duration": "4n", "velocity": 0.7 }
  ],
  "guitar": [
    { "note": "C3", "time": "0:0:2", "duration": "8n", "velocity": 0.8 }
  ],
  "drums": [
    { "piece": "Kick", "time": 0, "velocity": 0.9 }
  ]
}
```

- `time` can be specified in beats (0, 1, 2) or Tone.js transport notation ("0:0:2")
- `duration` uses Tone.js notation ("4n" for quarter note, "8n" for eighth note)
- `velocity` controls the volume/intensity (0.0 to 1.0)

## Technical Stack

- React
- TypeScript
- Tone.js for audio synthesis
- WebSocket for real-time communication
- Model Context Protocol (MCP) for sequence handling

## Available Scripts

- `npm start`: Run the React development server
- `npm run start:mcp`: Start the MCP server for sequence handling
- `npm test`: Run tests
- `npm run build`: Create production build
