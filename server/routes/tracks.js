import express from 'express';

const router = express.Router();

// Mock database of lofi/synthwave tracks
const tracks = [
  {
    id: '1',
    title: 'Lost in the Grid',
    artist: 'Lofi Dreamer',
    album: 'Retro Future',
    duration: 153, // 2:33
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    coverArtUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
    lyrics: 'Cruising down the digital highway, lost in the lines of code. The grid is my home now...'
  },
  {
    id: '2',
    title: 'Midnight Drive',
    artist: 'Synthwave Kid',
    album: 'Neon Lights',
    duration: 422, // 7:02
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    coverArtUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80',
    lyrics: 'Neon glow, radio low. Driving fast through the city lights, chasing the horizon...'
  },
  {
    id: '3',
    title: 'Starlight Voyage',
    artist: 'Cosmic Explorer',
    album: 'Deep Space',
    duration: 302, // 5:02
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    coverArtUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&auto=format&fit=crop&q=80',
    lyrics: 'Drifting beyond the solar system. The stars are calling my name, into the infinite void...'
  },
  {
    id: '4',
    title: 'Summer Breeze',
    artist: 'Lofi Beats',
    album: 'Sunny Days',
    duration: 302, // 5:02
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    coverArtUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80',
    lyrics: 'Warm wind in my hair, sunlight filtering through the palms. Just breathe it all in...'
  },
  {
    id: '5',
    title: 'Neon Highway',
    artist: 'Retro Wave',
    album: 'Outrun',
    duration: 342, // 5:42
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    coverArtUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
    lyrics: 'Speeding at 120 miles per hour, analog synthesizers blasting. Outrunning the ghosts of yesterday...'
  },
  {
    id: '6',
    title: 'Pixel Rain',
    artist: 'Chiptune Hero',
    album: '8-Bit Dreams',
    duration: 234, // 3:54
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    coverArtUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&auto=format&fit=crop&q=80',
    lyrics: 'Tiny pixels falling from the sky. Jumping over clouds of data, dreaming in digital green...'
  },
  {
    id: '7',
    title: 'Dreamscape',
    artist: 'Ambient Sound',
    album: 'Cloud Nine',
    duration: 198, // 3:18
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    coverArtUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&auto=format&fit=crop&q=80',
    lyrics: 'Soft waves of sound washing over. The world fades away, entering a dream within a dream...'
  }
];

// Get all tracks
router.get('/', (req, res) => {
  res.json(tracks);
});

// Search tracks
router.get('/search', (req, res) => {
  const query = (req.query.q || '').toLowerCase();
  
  if (!query) {
    return res.json(tracks);
  }
  
  const filteredTracks = tracks.filter(
    (track) =>
      track.title.toLowerCase().includes(query) ||
      track.artist.toLowerCase().includes(query) ||
      track.album.toLowerCase().includes(query)
  );
  
  res.json(filteredTracks);
});

export default router;
