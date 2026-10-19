export type GameCardType = 'action' | 'typed-answer' | 'question-set' | 'challenge';

export type GameCard = {
  id: string;
  type: GameCardType;
  prompt: string;
  points: number;
  timer?: number;
};

export type QueuePlayer = {
  id: string;
  name: string;
  age: number;
  score: number;
  joinedAt: number;
  status: 'waiting' | 'in-session' | 'done';
};

export type ChatMessage = {
  id: string;
  sender: 'Host' | 'Player' | 'System';
  text: string;
};

export type LeaderboardEntry = {
  id: string;
  name: string;
  score: number;
  badge: string;
};

export type GameState = {
  queue: QueuePlayer[];
  currentPlayerId: string | null;
  cards: GameCard[];
  currentCardIndex: number;
  chat: ChatMessage[];
  leaderboard: LeaderboardEntry[];
  sessionStatus: 'waiting' | 'active' | 'review';
};

export const STORAGE_KEY = 'darecam-game-store-v1';
export const PLAYER_STORAGE_KEY = 'darecam-player-id';
export const PLAYER_PROFILE_KEY = 'darecam-player-profile';
export const CHANNEL_NAME = 'darecam-live-sync';

export const DEFAULT_CARDS: GameCard[] = [
  { id: 'wave', type: 'action', prompt: 'Wave at the camera and smile.', points: 100, timer: 20 },
  {
    id: 'type-name-age',
    type: 'typed-answer',
    prompt: 'Type your first name and age in the chat.',
    points: 120,
    timer: 30,
  },
  {
    id: 'five-questions',
    type: 'question-set',
    prompt: 'Answer five rapid-fire questions without skipping a beat.',
    points: 180,
    timer: 45,
  },
  { id: 'dare', type: 'challenge', prompt: 'Pick a dare and complete it confidently.', points: 200, timer: 60 },
];

export const DEFAULT_STATE: GameState = {
  queue: [],
  currentPlayerId: null,
  cards: DEFAULT_CARDS,
  currentCardIndex: 0,
  chat: [
    { id: 'welcome', sender: 'System', text: 'Queue is open. The next player will appear here.' },
  ],
  leaderboard: [
    { id: 'leader-1', name: 'Zuri', score: 1420, badge: 'Top of the day' },
    { id: 'leader-2', name: 'Mila', score: 1380, badge: 'Hot streak' },
    { id: 'leader-3', name: 'You', score: 420, badge: 'New challenger' },
  ],
  sessionStatus: 'waiting',
};

function cloneState(next: GameState): GameState {
  return JSON.parse(JSON.stringify(next));
}

export function getGameState(): GameState {
  if (typeof window === 'undefined') {
    return cloneState(DEFAULT_STATE);
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return cloneState(DEFAULT_STATE);
    }

    const parsed = JSON.parse(raw) as Partial<GameState>;
    return {
      queue: Array.isArray(parsed.queue) ? parsed.queue : [],
      currentPlayerId: parsed.currentPlayerId ?? null,
      cards: Array.isArray(parsed.cards) && parsed.cards.length ? parsed.cards : DEFAULT_CARDS,
      currentCardIndex: typeof parsed.currentCardIndex === 'number' ? parsed.currentCardIndex : 0,
      chat: Array.isArray(parsed.chat) ? parsed.chat : DEFAULT_STATE.chat,
      leaderboard: Array.isArray(parsed.leaderboard) ? parsed.leaderboard : DEFAULT_STATE.leaderboard,
      sessionStatus: parsed.sessionStatus ?? 'waiting',
    };
  } catch {
    return cloneState(DEFAULT_STATE);
  }
}

export function commitGameState(nextState: GameState): GameState {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));

    try {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.postMessage({ type: 'darecam-state-update' });
      channel.close();
    } catch {
      // fallback to storage event in browsers without BroadcastChannel
    }

    window.dispatchEvent(new Event('darecam-state-change'));
  }

  return cloneState(nextState);
}

export function subscribeToGameState(listener: () => void) {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const handleStorage = () => listener();
  const handleCustomEvent = () => listener();

  window.addEventListener('storage', handleStorage);
  window.addEventListener('darecam-state-change', handleCustomEvent);

  try {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.addEventListener('message', () => listener());
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('darecam-state-change', handleCustomEvent);
      channel.close();
    };
  } catch {
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('darecam-state-change', handleCustomEvent);
    };
  }
}

export function updateGameState(updater: (state: GameState) => GameState): GameState {
  const nextState = updater(getGameState());
  return commitGameState(nextState);
}

export function getPlayerSettings(): { playerId: string | null; nickname: string; age: string } {
  if (typeof window === 'undefined') {
    return { playerId: null, nickname: '', age: '18' };
  }

  const playerId = window.sessionStorage.getItem(PLAYER_STORAGE_KEY);
  const profileRaw = window.localStorage.getItem(PLAYER_PROFILE_KEY);

  let nickname = '';
  let age = '18';

  if (profileRaw) {
    try {
      const parsed = JSON.parse(profileRaw) as { nickname?: string; age?: string };
      nickname = parsed.nickname ?? '';
      age = parsed.age ?? '18';
    } catch {
      nickname = '';
      age = '18';
    }
  }

  return { playerId, nickname, age };
}

export function savePlayerSettings(playerId: string, nickname: string, age: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.setItem(PLAYER_STORAGE_KEY, playerId);
  window.localStorage.setItem(
    PLAYER_PROFILE_KEY,
    JSON.stringify({ nickname: nickname.trim(), age: age.trim() || '18' }),
  );
}

export function addPlayerToQueue(name: string, age: number): GameState {
  return updateGameState((state) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const queue = [...state.queue, { id, name, age, score: 0, joinedAt: Date.now(), status: 'waiting' }];
    return { ...state, queue, sessionStatus: state.currentPlayerId ? 'active' : 'waiting' };
  });
}

export function startSessionForPlayer(playerId: string): GameState {
  return updateGameState((state) => {
    const queue = state.queue.map((player) => ({
      ...player,
      status: player.id === playerId ? 'in-session' : player.id === state.currentPlayerId ? 'waiting' : player.status,
    }));

    return {
      ...state,
      queue,
      currentPlayerId: playerId,
      currentCardIndex: 0,
      sessionStatus: 'active',
    };
  });
}

export function endSession(): GameState {
  return updateGameState((state) => {
    const queue = state.queue.map((player) => ({
      ...player,
      status: player.id === state.currentPlayerId ? 'done' : player.status,
    }));

    return {
      ...state,
      queue,
      currentPlayerId: null,
      currentCardIndex: 0,
      sessionStatus: 'waiting',
    };
  });
}

export function advanceCard(): GameState {
  return updateGameState((state) => {
    const nextIndex = state.cards.length === 0 ? 0 : (state.currentCardIndex + 1) % state.cards.length;
    return { ...state, currentCardIndex: nextIndex };
  });
}

export function acceptCurrentCard(): GameState {
  return updateGameState((state) => {
    if (!state.currentPlayerId || state.cards.length === 0) {
      return state;
    }

    const activeCard = state.cards[state.currentCardIndex];
    const queue = state.queue.map((player) => {
      if (player.id !== state.currentPlayerId) {
        return player;
      }

      const nextScore = player.score + activeCard.points;
      return { ...player, score: nextScore, status: 'in-session' };
    });

    const leaderboard = state.leaderboard.map((entry) => {
      const matchedPlayer = queue.find((player) => player.name === entry.name);
      if (!matchedPlayer || entry.name !== 'You' && entry.name !== state.queue.find((p) => p.id === state.currentPlayerId)?.name) {
        return entry;
      }

      return { ...entry, score: Math.max(entry.score, matchedPlayer.score), badge: matchedPlayer.score >= 300 ? 'On fire' : entry.badge };
    });

    const activePlayerName = queue.find((player) => player.id === state.currentPlayerId)?.name ?? 'You';
    const nextLeaderboard = leaderboard.some((entry) => entry.name === activePlayerName)
      ? leaderboard.map((entry) => (entry.name === activePlayerName ? { ...entry, score: Math.max(entry.score, Math.max(...queue.map((player) => player.score))) } : entry))
      : [...leaderboard, { id: `leader-${Date.now()}`, name: activePlayerName, score: Math.max(...queue.map((player) => player.score)), badge: 'New challenger' }];

    return {
      ...state,
      queue,
      leaderboard: nextLeaderboard,
      chat: [
        ...state.chat,
        { id: `chat-${Date.now()}`, sender: 'Host', text: `${activePlayerName} accepted: ${activeCard.prompt}` },
      ],
    };
  });
}

export function rejectCurrentCard(): GameState {
  return updateGameState((state) => ({
    ...state,
    chat: [
      ...state.chat,
      { id: `chat-${Date.now()}`, sender: 'Host', text: 'Rejected. Player retries or we skip to the next card.' },
    ],
  }));
}

export function addChatMessage(sender: ChatMessage['sender'], text: string): GameState {
  if (!text.trim()) {
    return getGameState();
  }

  return updateGameState((state) => ({
    ...state,
    chat: [...state.chat, { id: `chat-${Date.now()}`, sender, text: text.trim() }],
  }));
}

export function addCard(card: Omit<GameCard, 'id'>): GameState {
  return updateGameState((state) => ({
    ...state,
    cards: [...state.cards, { ...card, id: `card-${Date.now()}` }],
  }));
}

export function deleteCard(cardId: string): GameState {
  return updateGameState((state) => ({
    ...state,
    cards: state.cards.filter((card) => card.id !== cardId),
  }));
}

export function reorderCard(cardId: string, direction: 'up' | 'down'): GameState {
  return updateGameState((state) => {
    const index = state.cards.findIndex((card) => card.id === cardId);
    if (index < 0) {
      return state;
    }

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= state.cards.length) {
      return state;
    }

    const nextCards = [...state.cards];
    const [item] = nextCards.splice(index, 1);
    nextCards.splice(targetIndex, 0, item);

    return { ...state, cards: nextCards };
  });
}

export function getCurrentCard(state: GameState): GameCard | null {
  if (state.cards.length === 0) {
    return null;
  }

  return state.cards[state.currentCardIndex % state.cards.length] ?? null;
}

export function getActivePlayer(state: GameState): QueuePlayer | null {
  if (!state.currentPlayerId) {
    return null;
  }

  return state.queue.find((player) => player.id === state.currentPlayerId) ?? null;
}

export function getLastPlayerName(state: GameState): string {
  const item = state.queue.at(-1);
  return item?.name ?? 'Next player';
}
