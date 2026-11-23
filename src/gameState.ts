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
  { id: 'type-name-age', type: 'typed-answer', prompt: 'Type your first name and age in the chat.', points: 120, timer: 30 },
  { id: 'five-questions', type: 'question-set', prompt: 'Answer five rapid-fire questions without skipping a beat.', points: 180, timer: 45 },
  { id: 'dare', type: 'challenge', prompt: 'Pick a dare and complete it confidently.', points: 200, timer: 60 },
];

export const DEFAULT_STATE: GameState = {
  queue: [],
  currentPlayerId: null,
  cards: DEFAULT_CARDS,
  currentCardIndex: 0,
  chat: [{ id: 'welcome', sender: 'System', text: 'Queue is open. The next player will appear here.' }],
  leaderboard: [
    { id: 'leader-1', name: 'Zuri', score: 1420, badge: 'Top of the day' },
    { id: 'leader-2', name: 'Mila', score: 1380, badge: 'Hot streak' },
  ],
  sessionStatus: 'waiting',
};

function cloneState(next: GameState): GameState {
  return JSON.parse(JSON.stringify(next));
}

export function getGameState(): GameState {
  if (typeof window === 'undefined') return cloneState(DEFAULT_STATE);

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneState(DEFAULT_STATE);
    const parsed = JSON.parse(raw) as Partial<GameState>;

    return {
      queue: Array.isArray(parsed.queue) ? parsed.queue : [],
      currentPlayerId: parsed.currentPlayerId ?? null,
      cards: Array.isArray(parsed.cards) && parsed.cards.length ? parsed.cards : cloneState(DEFAULT_CARDS),
      currentCardIndex: typeof parsed.currentCardIndex === 'number' ? parsed.currentCardIndex : 0,
      chat: Array.isArray(parsed.chat) ? parsed.chat : cloneState(DEFAULT_STATE.chat),
      leaderboard: Array.isArray(parsed.leaderboard) ? parsed.leaderboard : cloneState(DEFAULT_STATE.leaderboard),
      sessionStatus: parsed.sessionStatus ?? 'waiting',
    };
  } catch {
    return cloneState(DEFAULT_STATE);
  }
}

export function commitGameState(nextState: GameState): GameState {
  const clean = cloneState(nextState);
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
    try {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.postMessage({ type: 'darecam-state-update' });
      channel.close();
    } catch {
      // localStorage events and the custom event below cover fallback browsers.
    }
    window.dispatchEvent(new Event('darecam-state-change'));
  }
  return clean;
}

export function subscribeToGameState(listener: () => void) {
  if (typeof window === 'undefined') return () => undefined;

  const handleStorage = (event: StorageEvent) => {
    if (!event.key || event.key === STORAGE_KEY) listener();
  };
  const handleCustomEvent = () => listener();

  window.addEventListener('storage', handleStorage);
  window.addEventListener('darecam-state-change', handleCustomEvent);

  try {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.addEventListener('message', listener);
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
  return commitGameState(updater(getGameState()));
}

export function getPlayerSettings(): { playerId: string | null; nickname: string; age: string } {
  if (typeof window === 'undefined') return { playerId: null, nickname: '', age: '18' };

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
      // Invalid saved profiles are ignored.
    }
  }
  return { playerId, nickname, age };
}

export function savePlayerSettings(playerId: string, nickname: string, age: string): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(PLAYER_STORAGE_KEY, playerId);
  window.localStorage.setItem(PLAYER_PROFILE_KEY, JSON.stringify({ nickname: nickname.trim(), age: age.trim() || '18' }));
}

export function addPlayerToQueue(name: string, age: number, explicitId?: string): GameState {
  return updateGameState((state) => {
    const existingId = explicitId
      ? state.queue.find((player) => player.id === explicitId)
      : state.queue.find((player) => player.name.toLowerCase() === name.trim().toLowerCase());

    if (existingId) {
      const queue = state.queue.map((player) =>
        player.id === existingId.id && player.status === 'done'
          ? { ...player, status: 'waiting' as const, age, name: name.trim(), joinedAt: Date.now(), score: 0 }
          : player,
      );
      return { ...state, queue };
    }

    const id = explicitId || `player-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const queue = [...state.queue, { id, name: name.trim(), age, score: 0, joinedAt: Date.now(), status: 'waiting' as const }];
    return { ...state, queue, sessionStatus: state.currentPlayerId ? 'active' : 'waiting' };
  });
}

export function startSessionForPlayer(playerId: string): GameState {
  return updateGameState((state) => {
    const target = state.queue.find((player) => player.id === playerId);
    if (!target || target.status === 'done') return state;

    const queue = state.queue.map((player) => ({
      ...player,
      status: player.id === playerId
        ? ('in-session' as const)
        : player.status === 'in-session'
          ? ('waiting' as const)
          : player.status,
    }));

    return { ...state, queue, currentPlayerId: playerId, currentCardIndex: 0, sessionStatus: 'active',
      chat: [...state.chat, { id: `chat-${Date.now()}`, sender: 'System', text: `${target.name} joined the live session.` }] };
  });
}

export function endSession(): GameState {
  return updateGameState((state) => {
    const active = state.queue.find((player) => player.id === state.currentPlayerId);
    const queue = state.queue.map((player) =>
      player.id === state.currentPlayerId ? { ...player, status: 'done' as const } : player,
    );
    return { ...state, queue, currentPlayerId: null, currentCardIndex: 0, sessionStatus: 'waiting',
      chat: [...state.chat, { id: `chat-${Date.now()}`, sender: 'System', text: active ? `${active.name}'s session ended.` : 'The session ended.' }] };
  });
}

export function advanceCard(): GameState {
  return updateGameState((state) => {
    if (!state.currentPlayerId) return state;
    const nextIndex = state.cards.length === 0 ? 0 : (state.currentCardIndex + 1) % state.cards.length;
    return { ...state, currentCardIndex: nextIndex };
  });
}

export function selectCard(cardIndex: number): GameState {
  return updateGameState((state) => {
    if (cardIndex < 0 || cardIndex >= state.cards.length) return state;
    return { ...state, currentCardIndex: cardIndex };
  });
}

export function acceptCurrentCard(): GameState {
  return updateGameState((state) => {
    if (!state.currentPlayerId || state.cards.length === 0) return state;

    const activeCard = state.cards[state.currentCardIndex % state.cards.length];
    const activePlayer = state.queue.find((player) => player.id === state.currentPlayerId);
    if (!activePlayer) return state;

    const queue = state.queue.map((player) =>
      player.id === state.currentPlayerId
        ? { ...player, score: player.score + activeCard.points, status: 'in-session' as const }
        : player,
    );
    const updatedPlayer = queue.find((player) => player.id === state.currentPlayerId)!;
    const existing = state.leaderboard.find((entry) => entry.name.toLowerCase() === updatedPlayer.name.toLowerCase());
    const leaderboard = existing
      ? state.leaderboard.map((entry) => entry.name.toLowerCase() === updatedPlayer.name.toLowerCase()
          ? { ...entry, score: updatedPlayer.score, badge: updatedPlayer.score >= 300 ? 'On fire' : entry.badge }
          : entry)
      : [...state.leaderboard, { id: `leader-${Date.now()}`, name: updatedPlayer.name, score: updatedPlayer.score, badge: 'New challenger' }]
        .sort((a, b) => b.score - a.score);

    return { ...state, queue, leaderboard,
      chat: [...state.chat, { id: `chat-${Date.now()}`, sender: 'Host', text: `${updatedPlayer.name} accepted: ${activeCard.prompt}` }] };
  });
}

export function rejectCurrentCard(): GameState {
  return updateGameState((state) => ({ ...state,
    chat: [...state.chat, { id: `chat-${Date.now()}`, sender: 'Host', text: 'Rejected. Player retries or the host advances.' }],
  }));
}

export function addChatMessage(sender: ChatMessage['sender'], text: string): GameState {
  const clean = text.trim();
  if (!clean) return getGameState();
  return updateGameState((state) => ({ ...state,
    chat: [...state.chat, { id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, sender, text: clean }],
  }));
}

export function addCard(card: Omit<GameCard, 'id'>): GameState {
  return updateGameState((state) => ({ ...state, cards: [...state.cards, { ...card, id: `card-${Date.now()}` }] }));
}

export function deleteCard(cardId: string): GameState {
  return updateGameState((state) => {
    const cards = state.cards.filter((card) => card.id !== cardId);
    return { ...state, cards, currentCardIndex: cards.length ? Math.min(state.currentCardIndex, cards.length - 1) : 0 };
  });
}

export function reorderCard(cardId: string, direction: 'up' | 'down'): GameState {
  return updateGameState((state) => {
    const index = state.cards.findIndex((card) => card.id === cardId);
    if (index < 0) return state;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= state.cards.length) return state;
    const cards = [...state.cards];
    const [item] = cards.splice(index, 1);
    cards.splice(targetIndex, 0, item);
    return { ...state, cards };
  });
}

export function getCurrentCard(state: GameState): GameCard | null {
  if (!state.cards.length) return null;
  return state.cards[state.currentCardIndex % state.cards.length] ?? null;
}

export function getActivePlayer(state: GameState): QueuePlayer | null {
  if (!state.currentPlayerId) return null;
  return state.queue.find((player) => player.id === state.currentPlayerId) ?? null;
}

export function getWaitingPlayers(state: GameState): QueuePlayer[] {
  return state.queue.filter((player) => player.status === 'waiting');
}
