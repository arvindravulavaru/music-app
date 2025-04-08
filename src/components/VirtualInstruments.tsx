import React, { useEffect, useRef, useState } from 'react';
import { Paper, Typography, Box, List, ListItem, ListItemText, IconButton } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import * as Tone from 'tone';
import { MusicPlayer } from '../interfaces/MusicInterface';
import { playlist, PlaylistItem } from '../data/Playlist';
import { rockSequence } from '../sequences/RockSequence';
import { stompRockSequence } from '../sequences/StompRockSequence';
import AudioVisualizer from './AudioVisualizer';

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
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const [activeDrumPiece, setActiveDrumPiece] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

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

  const highlightNote = (note: string, duration: string) => {
    setActiveNotes(prev => new Set(prev).add(note));
    const durationInMs = Tone.Time(duration).toMilliseconds();
    setTimeout(() => {
      setActiveNotes(prev => {
        const newSet = new Set(prev);
        newSet.delete(note);
        return newSet;
      });
    }, durationInMs);
  };

  const highlightDrum = (piece: string) => {
    setActiveDrumPiece(piece);
    setTimeout(() => setActiveDrumPiece(null), 200); // Short flash for drums
  };

  const playSequence = async (item: PlaylistItem) => {
    if (musicPlayerRef.current) {
      setCurrentlyPlaying(item.id);
      setIsPlaying(true);
      
      const sequence = item.sequence;
      const startTime = Tone.now();

      // Schedule piano notes with visual feedback
      if (sequence.piano) {
        sequence.piano.forEach(({ note, duration = '8n', time = 0 }) => {
          const noteTime = startTime + Tone.Time(time).toSeconds();
          setTimeout(() => highlightNote(note, duration), 
            (noteTime - startTime) * 1000);
        });
      }

      // Schedule guitar notes with visual feedback
      if (sequence.guitar) {
        sequence.guitar.forEach(({ note, duration = '4n', time = 0 }) => {
          const noteTime = startTime + Tone.Time(time).toSeconds();
          setTimeout(() => highlightNote(note, duration),
            (noteTime - startTime) * 1000);
        });
      }

      // Schedule drum hits with visual feedback
      if (sequence.drums) {
        sequence.drums.forEach(({ piece, time = 0 }) => {
          const hitTime = startTime + Tone.Time(time).toSeconds();
          setTimeout(() => highlightDrum(piece),
            (hitTime - startTime) * 1000);
        });
      }

      await musicPlayerRef.current.playSequence(sequence);
      setCurrentlyPlaying(null);
      setIsPlaying(false);
      setActiveNotes(new Set());
      setActiveDrumPiece(null);
    }
  };

  const stopPlayback = () => {
    if (musicPlayerRef.current) {
      musicPlayerRef.current.stop();
      setIsPlaying(false);
      
      // Stop all instrument synths
      instruments.piano.synth.releaseAll();
      instruments.guitar.synth.triggerRelease();
      instruments.drums.pieces.forEach(piece => {
        piece.synth.triggerRelease();
      });

      // Clear all visual feedback
      setCurrentlyPlaying(null);
      setActiveNotes(new Set());
      setActiveDrumPiece(null);

      // Cancel any pending timeouts for visual feedback
      const highestTimeoutId = window.setTimeout(() => {}, 0);
      for (let i = 1; i <= highestTimeoutId; i++) {
        window.clearTimeout(i);
      }
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
    <Box sx={{ 
      height: '100vh', 
      p: 2,
      position: 'relative',
      overflow: 'hidden'
    }}>
      <AudioVisualizer isPlaying={isPlaying} />
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        height: '100%',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Left column: Playlist and Drums */}
        <Box sx={{ width: '25%', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Playlist */}
          <Paper sx={{ 
            p: 1, 
            height: '30vh', 
            overflow: 'auto',
            bgcolor: '#2d2d2d',
            borderRadius: 2,
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            border: '1px solid #3d3d3d'
          }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#fff', textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
              Playlist
            </Typography>
            <List dense>
              {playlist.map((item) => (
                <ListItem
                  key={item.id}
                  sx={{
                    bgcolor: currentlyPlaying === item.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                    borderRadius: 1,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                    mb: 0.5
                  }}
                  secondaryAction={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" sx={{ color: '#888' }}>
                        {item.duration}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => currentlyPlaying === item.id ? stopPlayback() : playSequence(item)}
                        sx={{
                          color: currentlyPlaying === item.id ? '#ff4081' : '#2196f3',
                          '&:hover': { 
                            bgcolor: 'rgba(255,255,255,0.1)',
                            transform: 'scale(1.1)'
                          },
                          transition: 'all 0.2s'
                        }}
                      >
                        {currentlyPlaying === item.id ? <StopIcon /> : <PlayArrowIcon />}
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={<Typography variant="body2" sx={{ color: '#fff' }}>{item.title}</Typography>}
                    secondary={<Typography variant="caption" sx={{ color: '#888' }}>{item.description}</Typography>}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
          
          {/* Drums */}
          <Paper sx={{ 
            p: 1, 
            height: '30vh',
            bgcolor: '#2d2d2d',
            borderRadius: 2,
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            border: '1px solid #3d3d3d'
          }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#fff', textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
              Drums
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 1, 
              justifyContent: 'center',
              height: 'calc(100% - 40px)',
              alignItems: 'center'
            }}>
              {instruments.drums.pieces.map((piece) => (
                <Box key={piece.name}>
                  <IconButton
                    sx={{
                      width: 60,
                      height: 60,
                      bgcolor: activeDrumPiece === piece.name ? '#ff4081' : '#2196f3',
                      color: '#fff',
                      '&:hover': { 
                        bgcolor: activeDrumPiece === piece.name ? '#f50057' : '#1976d2',
                        transform: 'scale(1.1)'
                      },
                      transition: 'all 0.2s',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                      border: '2px solid rgba(255,255,255,0.1)'
                    }}
                    onClick={() => playDrumPiece(piece)}
                  >
                    <Typography variant="caption" sx={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                      {piece.name}
                    </Typography>
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>

        {/* Center: Piano */}
        <Box sx={{ width: '50%' }}>
          <Paper sx={{ 
            p: 1, 
            height: '60vh',
            bgcolor: '#2d2d2d',
            borderRadius: 2,
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            border: '1px solid #3d3d3d'
          }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#fff', textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
              Piano
            </Typography>
            <Box sx={{ 
              position: 'relative',
              height: 'calc(100% - 40px)',
              display: 'flex',
              justifyContent: 'center',
              overflow: 'hidden',
              borderRadius: 1,
              boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
              background: 'linear-gradient(to bottom, #1a1a1a, #2d2d2d)',
              border: '1px solid #3d3d3d',
              p: 1
            }}>
              {/* White keys */}
              <Box sx={{ display: 'flex', height: '100%', position: 'relative' }}>
                {instruments.piano.notes.white.map(({ note, label }) => (
                  <Box
                    key={note}
                    onClick={() => playPianoNote(note)}
                    sx={{
                      width: 40,
                      height: '100%',
                      bgcolor: activeNotes.has(note) ? '#2196f3' : 'rgba(255,255,255,0.9)',
                      color: activeNotes.has(note) ? '#fff' : '#000',
                      border: '1px solid rgba(0,0,0,0.2)',
                      borderRadius: '0 0 6px 6px',
                      cursor: 'pointer',
                      '&:hover': { 
                        bgcolor: '#2196f3',
                        color: '#fff',
                        transform: 'translateY(1px)',
                        boxShadow: '0 0 15px rgba(33,150,243,0.5)'
                      },
                      '&:active': {
                        transform: 'translateY(2px)',
                        boxShadow: 'none'
                      },
                      transition: 'all 0.1s',
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'center',
                      pb: 1,
                      boxShadow: activeNotes.has(note) 
                        ? '0 0 15px rgba(33,150,243,0.5)' 
                        : '0 2px 4px rgba(0,0,0,0.2)',
                      '& .note-label': {
                        opacity: 0,
                        transition: 'opacity 0.2s'
                      },
                      '&:hover .note-label': {
                        opacity: 1
                      }
                    }}
                  >
                    <Typography 
                      variant="caption" 
                      className="note-label"
                      sx={{ 
                        fontWeight: 'bold',
                        textShadow: activeNotes.has(note) || '&:hover' ? '0 0 5px rgba(255,255,255,0.5)' : 'none'
                      }}
                    >
                      {label}
                    </Typography>
                  </Box>
                ))}
              </Box>
              {/* Black keys */}
              <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', height: '60%', px: '7px' }}>
                {instruments.piano.notes.black.map(({ note, label }, index) => {
                  const octaveIndex = Math.floor(index / 5);
                  const keyIndex = index % 5;
                  const offset = octaveIndex * 7 * 40;
                  const positions = [27, 67, 147, 187, 227];
                  
                  return (
                    <Box
                      key={note}
                      onClick={() => playPianoNote(note)}
                      sx={{
                        position: 'absolute',
                        left: offset + positions[keyIndex],
                        width: 26,
                        height: '100%',
                        bgcolor: activeNotes.has(note) ? '#ff4081' : '#111',
                        color: '#fff',
                        cursor: 'pointer',
                        '&:hover': { 
                          bgcolor: '#ff4081',
                          transform: 'translateY(1px)',
                          boxShadow: '0 0 15px rgba(255,64,129,0.5)'
                        },
                        '&:active': {
                          transform: 'translateY(2px)',
                          boxShadow: 'none'
                        },
                        transition: 'all 0.1s',
                        zIndex: 1,
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                        pb: 1,
                        borderRadius: '0 0 4px 4px',
                        boxShadow: activeNotes.has(note)
                          ? '0 0 15px rgba(255,64,129,0.5)'
                          : '0 0 4px rgba(0,0,0,0.5)',
                        border: '1px solid rgba(0,0,0,0.3)',
                        '& .note-label': {
                          opacity: 0,
                          transition: 'opacity 0.2s'
                        },
                        '&:hover .note-label': {
                          opacity: 1
                        }
                      }}
                    >
                      <Typography 
                        variant="caption" 
                        className="note-label"
                        sx={{ 
                          fontWeight: 'bold',
                          textShadow: '0 0 5px rgba(255,255,255,0.5)'
                        }}
                      >
                        {label}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Right: Guitar */}
        <Box sx={{ width: '25%' }}>
          <Paper sx={{ 
            p: 1, 
            height: '60vh', 
            overflow: 'auto',
            bgcolor: '#2d2d2d',
            borderRadius: 2,
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            border: '1px solid #3d3d3d'
          }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#fff', textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
              Guitar
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {instruments.guitar.strings.map((string) => (
                <Box 
                  key={string.base}
                  sx={{ 
                    display: 'flex',
                    gap: 0.5,
                    bgcolor: 'rgba(255,255,255,0.05)',
                    p: 0.5,
                    borderRadius: 1,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                >
                  <Box
                    onClick={() => playGuitarString(string.base)}
                    sx={{ 
                      minWidth: 40,
                      height: 30,
                      bgcolor: activeNotes.has(string.base) ? '#ff4081' : '#9c27b0',
                      color: '#fff',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      borderRadius: 1,
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        bgcolor: activeNotes.has(string.base) ? '#f50057' : '#7b1fa2'
                      }
                    }}
                  >
                    {string.base}
                  </Box>
                  {string.frets.map((fret) => (
                    <Box
                      key={fret.note}
                      onClick={() => playGuitarString(fret.note)}
                      sx={{ 
                        minWidth: 30,
                        height: 30,
                        bgcolor: activeNotes.has(fret.note) ? '#ff4081' : '#2196f3',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.1)',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        borderRadius: 1,
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          bgcolor: activeNotes.has(fret.note) ? '#f50057' : '#1976d2'
                        }
                      }}
                    >
                      {fret.label}
                    </Box>
                  ))}
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default VirtualInstruments; 