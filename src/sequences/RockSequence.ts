import { MusicSequence } from '../interfaces/MusicInterface';

// A simple rock sequence with power chords, piano accents, and a basic rock beat
export const rockSequence: MusicSequence = {
  bpm: 120, // Standard rock tempo

  // Guitar power chords
  guitar: [
    // Bar 1 - E5
    { note: 'E2', time: '0:0', duration: '4n' },
    { note: 'B2', time: '0:0', duration: '4n' },
    { note: 'E3', time: '0:0', duration: '4n' },
    
    // G5
    { note: 'G2', time: '0:1', duration: '4n' },
    { note: 'D3', time: '0:1', duration: '4n' },
    { note: 'G3', time: '0:1', duration: '4n' },
    
    // A5
    { note: 'A2', time: '0:2', duration: '4n' },
    { note: 'E3', time: '0:2', duration: '4n' },
    { note: 'A3', time: '0:2', duration: '4n' },
    
    // Bar 2 - Repeat
    { note: 'E2', time: '1:0', duration: '4n' },
    { note: 'B2', time: '1:0', duration: '4n' },
    { note: 'E3', time: '1:0', duration: '4n' },
    
    { note: 'G2', time: '1:1', duration: '4n' },
    { note: 'D3', time: '1:1', duration: '4n' },
    { note: 'G3', time: '1:1', duration: '4n' },
    
    { note: 'A2', time: '1:2', duration: '4n' },
    { note: 'E3', time: '1:2', duration: '4n' },
    { note: 'A3', time: '1:2', duration: '4n' },
  ],

  // Piano adding accents
  piano: [
    { note: 'E4', time: '0:0', duration: '8n' },
    { note: 'G4', time: '0:1', duration: '8n' },
    { note: 'A4', time: '0:2', duration: '8n' },
    { note: 'B4', time: '0:3', duration: '8n' },
    
    { note: 'E5', time: '1:0', duration: '8n' },
    { note: 'D5', time: '1:1', duration: '8n' },
    { note: 'A4', time: '1:2', duration: '8n' },
    { note: 'G4', time: '1:3', duration: '8n' },
  ],

  // Basic rock beat
  drums: [
    // Bar 1
    { piece: 'Crash', time: '0:0' }, // Opening crash
    { piece: 'Kick', time: '0:0' },
    { piece: 'Hi-Hat', time: '0:0.5' },
    { piece: 'Snare', time: '0:1' },
    { piece: 'Hi-Hat', time: '0:1.5' },
    { piece: 'Kick', time: '0:2' },
    { piece: 'Hi-Hat', time: '0:2.5' },
    { piece: 'Snare', time: '0:3' },
    { piece: 'Hi-Hat', time: '0:3.5' },

    // Bar 2
    { piece: 'Kick', time: '1:0' },
    { piece: 'Hi-Hat', time: '1:0.5' },
    { piece: 'Snare', time: '1:1' },
    { piece: 'Hi-Hat', time: '1:1.5' },
    { piece: 'Kick', time: '1:2' },
    { piece: 'Hi-Hat', time: '1:2.5' },
    { piece: 'Snare', time: '1:3' },
    { piece: 'Hi-Hat', time: '1:3.5' },

    // Final crash
    { piece: 'Crash', time: '2:0' },
    { piece: 'Kick', time: '2:0' },
  ]
}; 