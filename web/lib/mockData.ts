import { Donation, Track } from '@/types';

export const mockTracks: Track[] = [
  {
    id: 'demo-track-1',
    artist_id: 'artist-1',
    title: '밤비(데모)',
    audio_url: 'https://samplelib.com/lib/preview/mp3/sample-15s.mp3',
    lyrics: '어둠 속에 빗소리 번져\n우산 없이 걷던 밤\n기억 속을 헤엄치는 네 이름',
    cover_image: 'https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?w=800',
    highlight_start: 0,
    highlight_duration: 15,
    tags: ['demo', 'rainy', 'lofi'],
    play_count: 0,
    funding_goal_amount: 50000,
    funding_raised_amount: 15000,
    funding_purpose: '마스터링 비용',
    artist: {
      id: 'artist-1',
      email: 'artist1@example.com',
      nickname: '새벽달',
      role: 'artist',
      profile_image: 'https://images.unsplash.com/photo-1472457847783-3d10540b03b9?w=300',
      bio: '새벽 감성 싱어송라이터',
    },
  },
  {
    id: 'demo-track-2',
    artist_id: 'artist-2',
    title: 'Sunrise Hook',
    audio_url: 'https://samplelib.com/lib/preview/mp3/sample-6s.mp3',
    lyrics: 'We’ll run into the sunrise\nHands up to the skyline',
    cover_image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800',
    highlight_start: 0,
    highlight_duration: 6,
    tags: ['hook', 'upbeat'],
    play_count: 0,
    funding_goal_amount: 80000,
    funding_raised_amount: 20000,
    funding_purpose: '보컬 튜닝 + 믹스',
    artist: {
      id: 'artist-2',
      email: 'artist2@example.com',
      nickname: 'Indigo Kid',
      role: 'artist',
      profile_image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300',
      bio: '인디 팝 프로듀서',
    },
  },
];

export const mockDonations: Donation[] = [];
