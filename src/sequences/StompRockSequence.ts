import { MusicSequence } from '../interfaces/MusicInterface';

export const stompRockSequence: MusicSequence = {
  bpm: 74, // Classic rock tempo

  drums: [
    // First bar
    { piece: 'Kick', time: '0:0:0', velocity: 1 },
    { piece: 'Kick', time: '0:0:2', velocity: 1 },
    { piece: 'Snare', time: '0:1:0', velocity: 1 },
    // Second bar
    { piece: 'Kick', time: '1:0:0', velocity: 1 },
    { piece: 'Kick', time: '1:0:2', velocity: 1 },
    { piece: 'Snare', time: '1:1:0', velocity: 1 },
    // Continue pattern...
    { piece: 'Kick', time: '2:0:0', velocity: 1 },
    { piece: 'Kick', time: '2:0:2', velocity: 1 },
    { piece: 'Snare', time: '2:1:0', velocity: 1 },
  ],

  guitar: [
    // Power chords following the rhythm
    { note: 'E3', time: '0:0:0', duration: '2n', velocity: 0.8 },
    { note: 'D3', time: '1:0:0', duration: '2n', velocity: 0.8 },
    { note: 'A3', time: '2:0:0', duration: '2n', velocity: 0.8 },
    { note: 'E3', time: '3:0:0', duration: '2n', velocity: 0.8 },
  ],

  piano: [
    // Accent notes
    { note: 'E4', time: '0:0:0', duration: '4n', velocity: 0.6 },
    { note: 'B3', time: '0:1:0', duration: '4n', velocity: 0.6 },
    { note: 'D4', time: '1:0:0', duration: '4n', velocity: 0.6 },
    { note: 'A3', time: '1:1:0', duration: '4n', velocity: 0.6 },
    { note: 'A4', time: '2:0:0', duration: '4n', velocity: 0.6 },
    { note: 'E4', time: '2:1:0', duration: '4n', velocity: 0.6 },
  ]
}; 