import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import WebSocket from 'ws';

// Create WebSocket client connection
const wsClient = new WebSocket('ws://localhost:3002/ws');

wsClient.on('open', () => {
//   console.log('MCP connected to WebSocket server');
});

wsClient.on('error', (error) => {
//   console.error('WebSocket connection error:', error);
});

// Create an MCP server instance
const server = new McpServer({
  name: "VirtualRockBandMCP",
  version: "1.0.0",
});


const playSequenceSchema = z.object({
    bpm: z.number(),
    piano: z.array(z.object({
      note: z.string(),
      time: z.union([z.number(), z.string()]),
      duration: z.string().optional(),
      velocity: z.number().optional()
    })),
    guitar: z.array(z.object({
      note: z.string(),
      time: z.union([z.number(), z.string()]),
      duration: z.string().optional(),
      velocity: z.number().optional()
    })),
    drums: z.array(z.object({
      piece: z.enum(['Kick', 'Snare', 'Hi-Hat', 'Crash']),
      time: z.union([z.number(), z.string()]),
      velocity: z.number().optional()
    }))
  });

// Define the playSequence tool
server.tool(
  "playSequence",
  "Play a musical sequence with piano, guitar, and drums",
  { sequence: playSequenceSchema },
  async ({ sequence }) => {
    try {
      // Send sequence through WebSocket connection
      wsClient.send(JSON.stringify({
        type: 'sequence',
        data: sequence
      }));

      return {
        content: [{ 
          type: "text", 
          text: `Sequence sent to WebSocket server`
        }]
      };
    } catch (error: any) {
      return {
        content: [{ 
          type: "text", 
          text: `Error sending sequence: ${error.message}`
        }],
        isError: true
      };
    }
  }
);

// Set up the standard input/output transport
const transport = new StdioServerTransport();

// Connect the server to the transport and start listening
server.connect(transport).then(() => {
  // Silent success
}).catch((error: Error) => {
  // Silent error
});
