import { FastMCP, Context } from 'fastmcp';
import { MusicPlayer, MusicSequence } from '../interfaces/MusicInterface';

class MusicPlayerMCP {
  private musicPlayer: MusicPlayer;

  constructor() {
    this.musicPlayer = new MusicPlayer();
  }

  async playSequence(sequence: MusicSequence): Promise<string> {
    try {
      await this.musicPlayer.playSequence(sequence);
      return 'Sequence played successfully';
    } catch (error: any) {
      return `Error playing sequence: ${error.message}`;
    }
  }

  stop(): string {
    try {
      this.musicPlayer.stop();
      return 'Playback stopped successfully';
    } catch (error: any) {
      return `Error stopping playback: ${error.message}`;
    }
  }

  getSchema(): { success: boolean, schema: any } {
    const schema = {
      name: 'MusicPlayerMCP',
      description: 'MCP server for playing music sequences using Tone.js',
      version: '1.0.0',
      functions: {
        playSequence: {
          description: 'Play a music sequence with piano, guitar, and drums',
          parameters: {
            type: 'object',
            properties: {
              sequence: {
                type: 'object',
                properties: {
                  bpm: { type: 'number', description: 'Beats per minute' },
                  piano: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        note: { type: 'string', description: 'Note name (e.g., "C4", "F#3")' },
                        duration: { type: 'string', description: 'Note duration (e.g., "4n", "8n")' },
                        time: { type: ['number', 'string'], description: 'Start time in seconds or bar:beat notation' },
                        velocity: { type: 'number', description: 'Note velocity (0-1)' }
                      },
                      required: ['note']
                    }
                  },
                  guitar: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        note: { type: 'string', description: 'Note name (e.g., "E2", "A3")' },
                        duration: { type: 'string', description: 'Note duration (e.g., "4n", "8n")' },
                        time: { type: ['number', 'string'], description: 'Start time in seconds or bar:beat notation' },
                        velocity: { type: 'number', description: 'Note velocity (0-1)' }
                      },
                      required: ['note']
                    }
                  },
                  drums: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        piece: { type: 'string', enum: ['Kick', 'Snare', 'Hi-Hat', 'Crash'] },
                        time: { type: ['number', 'string'], description: 'Start time in seconds or bar:beat notation' },
                        velocity: { type: 'number', description: 'Hit velocity (0-1)' }
                      },
                      required: ['piece']
                    }
                  }
                }
              }
            },
            required: ['sequence']
          }
        },
        stop: {
          description: 'Stop the currently playing sequence',
          parameters: {
            type: 'object',
            properties: {}
          }
        }
      }
    };

    return { success: true, schema };
  }
}

// Create and start the MCP server
const server = new FastMCP({
  name: 'music_player',
  version: '1.0.0'
});

server.addTool<unknown>({
  name: 'playSequence',
  description: 'Play a music sequence with piano, guitar, and drums.\n\n' +
    'Available instruments and notes:\n' +
    '- Piano: Supports notes from C2 to B5 (e.g., "C4", "F#4", "Bb3")\n' +
    '- Guitar: Six strings (from high to low): E4, B3, G3, D3, A2, E2 with frets 0-12\n' +
    '- Drums: "Kick", "Snare", "Hi-Hat", "Crash"\n\n' +
    'Example sequence:\n' +
    '{\n' +
    '  "bpm": 120,\n' +
    '  "piano": [\n' +
    '    { "note": "C4", "time": 0, "duration": "4n" },\n' +
    '    { "note": "E4", "time": "0:1", "duration": "8n" },\n' +
    '    { "note": "G4", "time": "0:2", "duration": "8n" }\n' +
    '  ],\n' +
    '  "guitar": [\n' +
    '    { "note": "E4", "time": 0, "duration": "4n" },\n' +
    '    { "note": "A2", "time": "0:2", "duration": "2n" }\n' +
    '  ],\n' +
    '  "drums": [\n' +
    '    { "piece": "Kick", "time": 0 },\n' +
    '    { "piece": "Snare", "time": "0:2" },\n' +
    '    { "piece": "Hi-Hat", "time": "0:1" }\n' +
    '  ]\n' +
    '}\n\n' +
    'Notes:\n' +
    '- Time can be specified in seconds (0, 0.5, 1) or bars:beats notation ("0:0", "1:2")\n' +
    '- Duration uses musical notation: "4n" (quarter), "8n" (eighth), "16n" (sixteenth)\n' +
    '- All fields except note/piece are optional\n' +
    '- Velocity is a number between 0 and 1 (default: 0.7)',
  execute: async (args: unknown, context: Context<unknown>) => {
    const impl = new MusicPlayerMCP();
    const typedArgs = args as { sequence: MusicSequence };
    return impl.playSequence(typedArgs.sequence);
  }
});

server.addTool<unknown>({
  name: 'stop',
  description: 'Stop the currently playing sequence',
  execute: async (_args: unknown, _context: Context<unknown>) => {
    const impl = new MusicPlayerMCP();
    return impl.stop();
  }
});

server.start({
  transportType: 'sse',
  sse: {
    endpoint: '/music_player',
    port: 3001
  }
}).then(() => {
  console.log('Music Player MCP server started on port 3001');
}).catch((error: Error) => {
  console.error('Failed to start Music Player MCP server:', error);
}); 