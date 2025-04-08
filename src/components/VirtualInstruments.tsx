import React, { useEffect, useRef, useState } from 'react';
import { Paper, Button, Typography, Box, List, ListItem, ListItemText, IconButton } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import * as Tone from 'tone';
import { MusicPlayer } from '../interfaces/MusicInterface';
import { playlist, PlaylistItem } from '../data/Playlist';
import { rockSequence } from '../sequences/RockSequence';
import { stompRockSequence } from '../sequences/StompRockSequence';

// Piano note configuration
const createPianoNotes = () => {
  const octaves = ['2', '3', '4', '5'];
  const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const blackKeys = ['C#', 'D#', 'F#', 'G#', 'A#'];
  
  return {
    white: octaves.flatMap(octave => whiteKeys.map(note => ({ note: `${note}${octave}`, label: `${note}${octave}` }))),
    black: octaves.flatMap(octave => blackKeys.map(note => ({ note: `${note}${octave}`, label: `${note}${octave}` })))
  };
};

// Instrument configurations
const instruments = {
  piano: {
    notes: createPianoNotes(),
    synth: new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: 'triangle'
      },
      envelope: {
        attack: 0.02,
        decay: 0.1,
        sustain: 0.3,
        release: 1
      }
    }).toDestination(),
  },
  guitar: {
    strings: [
      { base: 'E4', frets: Array.from({ length: 12 }, (_, i) => ({ note: `${['E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E'][i]}4`, label: i })) },
      { base: 'B3', frets: Array.from({ length: 12 }, (_, i) => ({ note: `${['B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][i]}3`, label: i })) },
      { base: 'G3', frets: Array.from({ length: 12 }, (_, i) => ({ note: `${['G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G'][i]}3`, label: i })) },
      { base: 'D3', frets: Array.from({ length: 12 }, (_, i) => ({ note: `${['D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D'][i]}3`, label: i })) },
      { base: 'A2', frets: Array.from({ length: 12 }, (_, i) => ({ note: `${['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A'][i]}2`, label: i })) },
      { base: 'E2', frets: Array.from({ length: 12 }, (_, i) => ({ note: `${['E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E'][i]}2`, label: i })) }
    ],
    synth: new Tone.AMSynth({
      oscillator: {
        type: 'triangle'
      },
      envelope: {
        attack: 0.02,
        decay: 0.1,
        sustain: 0.3,
        release: 1
      }
    }).toDestination(),
  },
  drums: {
    pieces: [
      { 
        name: 'Kick', 
        sound: 'C1',
        synth: new Tone.MembraneSynth({
          pitchDecay: 0.05,
          octaves: 5,
          oscillator: { type: 'sine' },
          envelope: {
            attack: 0.001,
            decay: 0.4,
            sustain: 0.01,
            release: 1.4,
          }
        }).toDestination()
      },
      { 
        name: 'Snare', 
        sound: 'D1',
        synth: new Tone.NoiseSynth({
          noise: { type: 'white' },
          envelope: {
            attack: 0.001,
            decay: 0.2,
            sustain: 0,
            release: 0.2
          }
        }).toDestination()
      },
      { 
        name: 'Hi-Hat', 
        sound: 'F#1',
        synth: new Tone.MetalSynth({
          envelope: {
            attack: 0.001,
            decay: 0.1,
            release: 0.01
          },
          harmonicity: 5.1,
          modulationIndex: 32,
          resonance: 4000,
          octaves: 1.5
        }).toDestination()
      },
      { 
        name: 'Crash', 
        sound: 'C#2',
        synth: new Tone.MetalSynth({
          envelope: {
            attack: 0.001,
            decay: 1,
            release: 3
          },
          harmonicity: 8.5,
          modulationIndex: 40,
          resonance: 5000,
          octaves: 1.5
        }).toDestination()
      },
    ]
  },
};

const VirtualInstruments: React.FC = () => {
  const musicPlayerRef = useRef<MusicPlayer | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);

  useEffect(() => {
    musicPlayerRef.current = new MusicPlayer();
    
    // Initialize Tone.js on first user interaction
    const startAudio = async () => {
      await Tone.start();
      document.removeEventListener('click', startAudio);
    };

    document.addEventListener('click', startAudio);

    return () => {
      document.removeEventListener('click', startAudio);
      if (musicPlayerRef.current) {
        musicPlayerRef.current.stop();
      }
    };
  }, []);

  const playSequence = async (item: PlaylistItem) => {
    if (musicPlayerRef.current) {
      setCurrentlyPlaying(item.id);
      await musicPlayerRef.current.playSequence(item.sequence);
      setCurrentlyPlaying(null);
    }
  };

  const stopPlayback = () => {
    if (musicPlayerRef.current) {
      musicPlayerRef.current.stop();
      setCurrentlyPlaying(null);
    }
  };

  const playRockSequence = async () => {
    if (musicPlayerRef.current) {
      await musicPlayerRef.current.playSequence(rockSequence);
    }
  };

  const playStompRockSequence = async () => {
    if (musicPlayerRef.current) {
      await musicPlayerRef.current.playSequence(stompRockSequence);
    }
  };

  const playPianoNote = (note: string) => {
    instruments.piano.synth.triggerAttackRelease(note, '4n');
  };

  const playGuitarString = (note: string) => {
    instruments.guitar.synth.triggerAttackRelease(note, '4n');
  };

  const playDrumPiece = (piece: typeof instruments.drums.pieces[0]) => {
    if (piece.name === 'Snare') {
      piece.synth.triggerAttackRelease('16n', Tone.now());
    } else {
      piece.synth.triggerAttackRelease(piece.sound, '8n');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Playlist
          </Typography>
          <List>
            {playlist.map((item) => (
              <ListItem
                key={item.id}
                sx={{
                  bgcolor: currentlyPlaying === item.id ? 'action.selected' : 'transparent',
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
                secondaryAction={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {item.duration}
                    </Typography>
                    <IconButton
                      edge="end"
                      onClick={() => currentlyPlaying === item.id ? stopPlayback() : playSequence(item)}
                      color={currentlyPlaying === item.id ? 'secondary' : 'primary'}
                    >
                      {currentlyPlaying === item.id ? <StopIcon /> : <PlayArrowIcon />}
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText
                  primary={item.title}
                  secondary={item.description}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>

   
      {/* Piano */}
      <Box>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Piano
          </Typography>
          <Box sx={{ 
            position: 'relative', 
            width: '100%', 
            height: 240,
            display: 'flex',
            justifyContent: 'center'
          }}>
            <Box sx={{ 
              position: 'relative', 
              display: 'flex',
              alignItems: 'flex-start',
              height: '100%',
              maxWidth: '100%',
              overflowX: 'auto'
            }}>
              {/* White keys */}
              <Box sx={{ display: 'flex', height: '100%' }}>
                {instruments.piano.notes.white.map(({ note, label }) => (
                  <Button
                    key={note}
                    variant="outlined"
                    sx={{
                      width: 60,
                      height: '100%',
                      bgcolor: 'white',
                      color: 'black',
                      border: '1px solid #999',
                      borderRadius: '0 0 4px 4px',
                      '&:hover': { bgcolor: '#e0e0e0' },
                      padding: 0,
                      minWidth: 'unset',
                      position: 'relative',
                      '&:active': {
                        bgcolor: '#ccc',
                        transform: 'translateY(1px)'
                      }
                    }}
                    onClick={() => playPianoNote(note)}
                  >
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        position: 'absolute',
                        bottom: 8,
                        width: '100%',
                        textAlign: 'center'
                      }}
                    >
                      {label}
                    </Typography>
                  </Button>
                ))}
              </Box>
              {/* Black keys */}
              <Box sx={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                display: 'flex',
                height: '60%'
              }}>
                {instruments.piano.notes.black.map(({ note, label }, index) => {
                  // Calculate position for black keys
                  const octaveIndex = Math.floor(index / 5);
                  const keyIndex = index % 5;
                  const offset = octaveIndex * 7 * 60; // 7 white keys per octave, 60px per key
                  
                  // Position black keys between white keys
                  const positions = [
                    40,   // C# (between C and D)
                    100,  // D# (between D and E)
                    220,  // F# (between F and G)
                    280,  // G# (between G and A)
                    340   // A# (between A and B)
                  ];
                  
                  return (
                    <Button
                      key={note}
                      variant="contained"
                      sx={{
                        position: 'absolute',
                        left: offset + positions[keyIndex],
                        width: 40,
                        height: '100%',
                        bgcolor: 'black',
                        color: 'white',
                        '&:hover': { bgcolor: '#333' },
                        padding: 0,
                        minWidth: 'unset',
                        borderRadius: '0 0 4px 4px',
                        zIndex: 1,
                        '&:active': {
                          bgcolor: '#222',
                          transform: 'translateY(1px)'
                        }
                      }}
                      onClick={() => playPianoNote(note)}
                    >
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          position: 'absolute',
                          bottom: 8,
                          width: '100%',
                          textAlign: 'center'
                        }}
                      >
                        {label}
                      </Typography>
                    </Button>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Guitar */}
      <Box>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Guitar
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 1,
            maxWidth: '100%',
            overflowX: 'auto'
          }}>
            {instruments.guitar.strings.map((string, stringIndex) => (
              <Box 
                key={string.base}
                sx={{ 
                  display: 'flex',
                  gap: 1,
                  bgcolor: 'grey.100',
                  p: 1,
                  borderRadius: 1
                }}
              >
                <Button
                  variant="contained"
                  color="secondary"
                  sx={{ 
                    minWidth: 60,
                    height: 40,
                    fontSize: '0.75rem'
                  }}
                  onClick={() => playGuitarString(string.base)}
                >
                  {string.base}
                </Button>
                {string.frets.map((fret) => (
                  <Button
                    key={fret.note}
                    variant="outlined"
                    sx={{ 
                      minWidth: 40,
                      height: 40,
                      fontSize: '0.75rem',
                      bgcolor: 'white'
                    }}
                    onClick={() => playGuitarString(fret.note)}
                  >
                    {fret.label}
                  </Button>
                ))}
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>

      {/* Drums */}
      <Box>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Drums
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {instruments.drums.pieces.map((piece) => (
              <Box key={piece.name}>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                  }}
                  onClick={() => playDrumPiece(piece)}
                >
                  {piece.name}
                </Button>
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default VirtualInstruments; 