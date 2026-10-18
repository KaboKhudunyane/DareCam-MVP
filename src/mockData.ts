export type Role = 'player' | 'host';

export type Card = {
  id: number;
  title: string;
  category: string;
  points: number;
  difficulty: 'Easy' | 'Medium' | 'Wild';
  description: string;
  progress: number;
  totalSteps: number;
};

export type PlayerProfile = {
  id: number;
  name: string;
  city: string;
  status: 'In queue' | 'Live now' | 'Awaiting review';
  streak: number;
  rating: number;
  avatar: string;
};

export type ChatMessage = {
  id: number;
  sender: 'Host' | 'Player' | 'System';
  text: string;
};

export type LeaderboardRow = {
  id: number;
  name: string;
  score: number;
  badge: string;
};

export const queue: PlayerProfile[] = [
  { id: 1, name: 'Zuri', city: 'Johannesburg', status: 'Live now', streak: 4, rating: 96, avatar: 'Z' },
  { id: 2, name: 'Aphiwe', city: 'Cape Town', status: 'In queue', streak: 2, rating: 91, avatar: 'A' },
  { id: 3, name: 'Lethabo', city: 'Durban', status: 'Awaiting review', streak: 5, rating: 98, avatar: 'L' },
];

export const cards: Card[] = [
  {
    id: 1,
    title: 'Wave at camera',
    category: 'Icebreaker',
    points: 100,
    difficulty: 'Easy',
    description: 'Give the host a proper wave and a quick smile.',
    progress: 1,
    totalSteps: 1,
  },
  {
    id: 2,
    title: 'Name 5 snacks',
    category: 'Mini-game',
    points: 150,
    difficulty: 'Medium',
    description: 'List five of your favourite snacks without pausing.',
    progress: 2,
    totalSteps: 3,
  },
  {
    id: 3,
    title: 'Show your setup',
    category: 'Movement',
    points: 200,
    difficulty: 'Wild',
    description: 'Spin the camera to reveal your desk setup and laugh at it.',
    progress: 1,
    totalSteps: 2,
  },
  {
    id: 4,
    title: 'Answer 5 questions',
    category: 'Would you rather',
    points: 250,
    difficulty: 'Medium',
    description: 'Give quick answers to five rapid-fire prompts.',
    progress: 2,
    totalSteps: 5,
  },
];

export const starterChat: ChatMessage[] = [
  { id: 1, sender: 'Host', text: 'Nice vibe, let us keep it playful and safe.' },
  { id: 2, sender: 'Player', text: 'Absolutely. I am ready for the next challenge.' },
  { id: 3, sender: 'System', text: 'Reward suggestion: R50 prepaid airtime for today.' },
];

export const rewardIdeas = ['R50 airtime', 'Movie night voucher', 'Snack box', 'Spotify premium month'];

export const initialLeaderboard: LeaderboardRow[] = [
  { id: 1, name: 'Zuri', score: 1420, badge: 'Top of the day' },
  { id: 2, name: 'Mila', score: 1380, badge: 'Hot streak' },
  { id: 3, name: 'You', score: 420, badge: 'New challenger' },
];

export const formatScore = (value: number) => `${value.toLocaleString()} pts`;
