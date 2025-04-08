import * as Tone from 'tone';

export interface Note {
  note: string;
  duration?: string;
  time?: number | string;
  velocity?: number;
}

export interface DrumHit {
  piece: 'Kick' | 'Snare' | 'Hi-Hat' | 'Crash';
  time?: number | string;
  velocity?: number;
}

export interface MusicSequence {
  piano?: Note[];
  guitar?: Note[];
  drums?: DrumHit[];
  bpm?: number;
}

export class MusicPlayer {
  private pianoSynth: Tone.PolySynth;
  private guitarSynth: Tone.AMSynth;
  private drumSynths: {
    Kick: Tone.MembraneSynth;
    Snare: Tone.NoiseSynth;
    'Hi-Hat': Tone.MetalSynth;
    Crash: Tone.MetalSynth;
  };

  constructor() {
    // Initialize synths
    this.pianoSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 0.02,
        decay: 0.1,
        sustain: 0.3,
        release: 1
      }
    }).toDestination();

    this.guitarSynth = new Tone.AMSynth({
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 0.02,
        decay: 0.1,
        sustain: 0.3,
        release: 1
      }
    }).toDestination();

    this.drumSynths = {
      Kick: new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 5,
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.001,
          decay: 0.4,
          sustain: 0.01,
          release: 1.4,
        }
      }).toDestination(),
      Snare: new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: {
          attack: 0.001,
          decay: 0.2,
          sustain: 0,
          release: 0.2
        }
      }).toDestination(),
      'Hi-Hat': new Tone.MetalSynth({
        envelope: {
          attack: 0.001,
          decay: 0.1,
          release: 0.01
        },
        harmonicity: 5.1,
        modulationIndex: 32,
        resonance: 4000,
        octaves: 1.5
      }).toDestination(),
      Crash: new Tone.MetalSynth({
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
    };
  }

  public async playSequence(sequence: MusicSequence): Promise<void> {
    // Start audio context if needed
    if (Tone.context.state !== 'running') {
      await Tone.start();
      await Tone.context.resume();
    }
    
    // Reset any previous state
    this.stop();
    
    // Set tempo if provided
    if (sequence.bpm) {
      Tone.Transport.bpm.value = sequence.bpm;
    }

    // Get the current time with minimal offset
    const startTime = Tone.now() + 0.05;
    
    // Convert bar:beat notation to seconds and add small offset to prevent exact simultaneous triggers
    const getTimeInSeconds = (time: string | number, instrumentOffset: number = 0): number => {
      if (typeof time === 'number') return startTime + time + instrumentOffset;
      const timeInBars = Tone.Time(time).toSeconds();
      return startTime + timeInBars + instrumentOffset;
    };

    // Schedule piano notes with a slight offset
    if (sequence.piano) {
      sequence.piano.forEach(({ note, duration = '8n', time = 0, velocity = 1 }, index) => {
        const noteTime = getTimeInSeconds(time, 0.001 * index);
        this.pianoSynth.triggerAttackRelease(note, duration, noteTime, velocity);
      });
    }

    // Schedule guitar notes with a different offset
    if (sequence.guitar) {
      sequence.guitar.forEach(({ note, duration = '4n', time = 0, velocity = 1 }, index) => {
        const noteTime = getTimeInSeconds(time, 0.002 + 0.001 * index);
        this.guitarSynth.triggerAttackRelease(note, duration, noteTime, velocity);
      });
    }

    // Schedule drum hits with another offset
    if (sequence.drums) {
      sequence.drums.forEach(({ piece, time = 0, velocity = 1 }, index) => {
        const hitTime = getTimeInSeconds(time, 0.003 + 0.001 * index);
        if (piece === 'Snare') {
          this.drumSynths[piece].triggerAttackRelease('16n', hitTime, velocity);
        } else {
          const note = piece === 'Kick' ? 'C1' : piece === 'Hi-Hat' ? 'F#1' : 'C#2';
          this.drumSynths[piece].triggerAttackRelease(note, '8n', hitTime, velocity);
        }
      });
    }

    // Calculate sequence duration in seconds
    const allTimes = [
      ...(sequence.piano?.map(n => getTimeInSeconds(n.time || 0)) || []),
      ...(sequence.guitar?.map(n => getTimeInSeconds(n.time || 0)) || []),
      ...(sequence.drums?.map(n => getTimeInSeconds(n.time || 0)) || [])
    ];
    
    const endTime = Math.max(...allTimes) + 2; // Add 2 seconds for final notes to ring out

    // Return a promise that resolves when the sequence is done
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, (endTime - startTime) * 1000);
    });
  }

  public stop(): void {
    // Stop the transport and cancel any scheduled events
    Tone.Transport.stop();
    Tone.Transport.cancel();
    
    // Get current time and add a tiny offset to ensure we're after any current events
    const now = Tone.now() + 0.01;
    
    // Dispose of all current notes and reset the piano synth
    this.pianoSynth.releaseAll(now);
    this.pianoSynth.dispose();
    this.pianoSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 0.02,
        decay: 0.1,
        sustain: 0.3,
        release: 1
      }
    }).toDestination();

    // Dispose and recreate guitar synth
    this.guitarSynth.triggerRelease(now);
    this.guitarSynth.dispose();
    this.guitarSynth = new Tone.AMSynth({
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 0.02,
        decay: 0.1,
        sustain: 0.3,
        release: 1
      }
    }).toDestination();

    // Dispose and recreate all drum synths
    Object.entries(this.drumSynths).forEach(([key, synth]) => {
      synth.triggerRelease(now);
      synth.dispose();
    });

    // Recreate drum synths with fresh instances
    this.drumSynths = {
      Kick: new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 5,
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.001,
          decay: 0.4,
          sustain: 0.01,
          release: 1.4,
        }
      }).toDestination(),
      Snare: new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: {
          attack: 0.001,
          decay: 0.2,
          sustain: 0,
          release: 0.2
        }
      }).toDestination(),
      'Hi-Hat': new Tone.MetalSynth({
        envelope: {
          attack: 0.001,
          decay: 0.1,
          release: 0.01
        },
        harmonicity: 5.1,
        modulationIndex: 32,
        resonance: 4000,
        octaves: 1.5
      }).toDestination(),
      Crash: new Tone.MetalSynth({
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
    };
  }
} 