import { MusicSequence } from '../interfaces/MusicInterface';
import { rockSequence } from '../sequences/RockSequence';
import { stompRockSequence } from '../sequences/StompRockSequence';

export interface PlaylistItem {
  id: string;
  title: string;
  duration: string;
  sequence: MusicSequence;
  description: string;
}

export const playlist: PlaylistItem[] = [
  {
    id: 'rock-sequence',
    title: 'Rock Jam',
    duration: '0:12',
    sequence: rockSequence,
    description: 'A simple rock progression with guitar power chords'
  },
  {
    id: 'stomp-rock',
    title: 'Stomp Rock',
    duration: '0:15',
    sequence: stompRockSequence,
    description: 'Inspired by the famous "boom boom clap" rhythm'
  }
]; 