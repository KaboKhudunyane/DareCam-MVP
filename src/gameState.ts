export type GameCardType = 'action' | 'typed-answer' | 'question-set' | 'challenge';

export type GameCard = { id: string; type: GameCardType; prompt: string; points: number; timer?: number };
export type QueuePlayer = { id: string; name: string; age: number; score: number; joinedAt: number; status: 'waiting' | 'in-session' | 'done' };
export type ChatMessage = { id: string; sender: 'Host' | 'Player' | 'System'; text: string };
export type LeaderboardEntry = { id: string; name: string; score: number; badge: string };
export type GameState = { queue: QueuePlayer[]; currentPlayerId: string | null; cards: GameCard[]; currentCardIndex: number; chat: ChatMessage[]; leaderboard: LeaderboardEntry[]; sessionStatus: 'waiting' | 'active' | 'review' };

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
  queue: [], currentPlayerId: null, cards: DEFAULT_CARDS, currentCardIndex: 0,
  chat: [{ id: 'welcome', sender: 'System', text: 'Queue is open. The next player will appear here.' }],
  leaderboard: [
    { id: 'leader-1', name: 'Zuri', score: 1420, badge: 'Top of the day' },
    { id: 'leader-2', name: 'Mila', score: 1380, badge: 'Hot streak' },
  ], sessionStatus: 'waiting',
};

const cloneState = (state: GameState): GameState => JSON.parse(JSON.stringify(state));

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
  } catch { return cloneState(DEFAULT_STATE); }
}

export function commitGameState(nextState: GameState): GameState {
  const clean = cloneState(nextState);
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
    try { const channel = new BroadcastChannel(CHANNEL_NAME); channel.postMessage({ type: 'darecam-state-update' }); channel.close(); } catch { /* localStorage/custom events are fallbacks */ }
    window.dispatchEvent(new Event('darecam-state-change'));
  }
  return clean;
}

export function subscribeToGameState(listener: () => void) {
  if (typeof window === 'undefined') return () => undefined;
  const storageListener = (event: StorageEvent) => { if (!event.key || event.key === STORAGE_KEY) listener(); };
  const customListener = () => listener();
  window.addEventListener('storage', storageListener);
  window.addEventListener('darecam-state-change', customListener);
  try {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.addEventListener('message', listener);
    return () => { window.removeEventListener('storage', storageListener); window.removeEventListener('darecam-state-change', customListener); channel.close(); };
  } catch { return () => { window.removeEventListener('storage', storageListener); window.removeEventListener('darecam-state-change', customListener); }; }
}

export function updateGameState(updater: (state: GameState) => GameState): GameState { return commitGameState(updater(getGameState())); }

export function getPlayerSettings(): { playerId: string | null; nickname: string; age: string } {
  if (typeof window === 'undefined') return { playerId: null, nickname: '', age: '18' };
  const playerId = window.sessionStorage.getItem(PLAYER_STORAGE_KEY);
  let nickname = ''; let age = '18';
  try { const parsed = JSON.parse(window.localStorage.getItem(PLAYER_PROFILE_KEY) || '{}') as { nickname?: string; age?: string }; nickname = parsed.nickname ?? ''; age = parsed.age ?? '18'; } catch { /* ignore invalid profile */ }
  return { playerId, nickname, age };
}

export function savePlayerSettings(playerId: string, nickname: string, age: string): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(PLAYER_STORAGE_KEY, playerId);
  window.localStorage.setItem(PLAYER_PROFILE_KEY, JSON.stringify({ nickname: nickname.trim(), age: age.trim() || '18' }));
}

export function addPlayerToQueue(name: string, age: number, explicitId?: string): GameState {
  return updateGameState((state) => {
    const existing = explicitId ? state.queue.find((p) => p.id === explicitId) : state.queue.find((p) => p.name.toLowerCase() === name.trim().toLowerCase() && p.status !== 'done');
    if (existing) {
      const queue = state.queue.map((p) => p.id === existing.id ? { ...p, name: name.trim(), age, status: p.status === 'done' ? ('waiting' as const) : p.status } : p);
      return { ...state, queue };
    }
    const id = explicitId || `player-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return { ...state, queue: [...state.queue, { id, name: name.trim(), age, score: 0, joinedAt: Date.now(), status: 'waiting' }] };
  });
}

export function startSessionForPlayer(playerId: string): GameState {
  return updateGameState((state) => {
    const target = state.queue.find((p) => p.id === playerId);
    if (!target || target.status === 'done') return state;
    const queue = state.queue.map((p) => ({ ...p, status: p.id === playerId ? ('in-session' as const) : p.status === 'in-session' ? ('waiting' as const) : p.status }));
    return { ...state, queue, currentPlayerId: playerId, currentCardIndex: 0, sessionStatus: 'active', chat: [...state.chat, { id: `chat-${Date.now()}`, sender: 'System', text: `${target.name} joined the live session.` }] };
  });
}

export function endSession(): GameState {
  return updateGameState((state) => {
    const active = state.queue.find((p) => p.id === state.currentPlayerId);
    const queue = state.queue.map((p) => p.id === state.currentPlayerId ? { ...p, status: 'done' as const } : p);
    return { ...state, queue, currentPlayerId: null, currentCardIndex: 0, sessionStatus: 'waiting', chat: [...state.chat, { id: `chat-${Date.now()}`, sender: 'System', text: active ? `${active.name}'s session ended.` : 'The session ended.' }] };
  });
}

export function advanceCard(): GameState { return updateGameState((state) => state.currentPlayerId ? { ...state, currentCardIndex: state.cards.length ? (state.currentCardIndex + 1) % state.cards.length : 0 } : state); }
export function selectCard(cardIndex: number): GameState { return updateGameState((state) => cardIndex >= 0 && cardIndex < state.cards.length ? { ...state, currentCardIndex: cardIndex } : state); }

export function acceptCurrentCard(): GameState {
  return updateGameState((state) => {
    if (!state.currentPlayerId || !state.cards.length) return state;
    const card = state.cards[state.currentCardIndex % state.cards.length];
    const active = state.queue.find((p) => p.id === state.currentPlayerId);
    if (!active) return state;
    const queue = state.queue.map((p) => p.id === state.currentPlayerId ? { ...p, score: p.score + card.points, status: 'in-session' as const } : p);
    const updated = queue.find((p) => p.id === state.currentPlayerId)!;
    const existing = state.leaderboard.find((entry) => entry.name.toLowerCase() === updated.name.toLowerCase());
    const leaderboard = (existing
      ? state.leaderboard.map((entry) => entry.name.toLowerCase() === updated.name.toLowerCase() ? { ...entry, score: updated.score, badge: updated.score >= 300 ? 'On fire' : entry.badge } : entry)
      : [...state.leaderboard, { id: `leader-${Date.now()}`, name: updated.name, score: updated.score, badge: 'New challenger' }]).sort((a, b) => b.score - a.score);
    return { ...state, queue, leaderboard, chat: [...state.chat, { id: `chat-${Date.now()}`, sender: 'Host', text: `${updated.name} accepted: ${card.prompt}` }] };
  });
}

export function rejectCurrentCard(): GameState { return updateGameState((state) => ({ ...state, chat: [...state.chat, { id: `chat-${Date.now()}`, sender: 'Host', text: 'Rejected. Player retries or the host advances.' }] })); }
export function addChatMessage(sender: ChatMessage['sender'], text: string): GameState { const clean = text.trim(); if (!clean) return getGameState(); return updateGameState((state) => ({ ...state, chat: [...state.chat, { id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, sender, text: clean }] })); }
export function addCard(card: Omit<GameCard, 'id'>): GameState { return updateGameState((state) => ({ ...state, cards: [...state.cards, { ...card, id: `card-${Date.now()}` }] })); }
export function deleteCard(cardId: string): GameState { return updateGameState((state) => { const cards = state.cards.filter((c) => c.id !== cardId); return { ...state, cards, currentCardIndex: cards.length ? Math.min(state.currentCardIndex, cards.length - 1) : 0 }; }); }
export function reorderCard(cardId: string, direction: 'up' | 'down'): GameState { return updateGameState((state) => { const index = state.cards.findIndex((c) => c.id === cardId); if (index < 0) return state; const target = direction === 'up' ? index - 1 : index + 1; if (target < 0 || target >= state.cards.length) return state; const cards = [...state.cards]; const [item] = cards.splice(index, 1); cards.splice(target, 0, item); return { ...state, cards }; }); }
export function getCurrentCard(state: GameState): GameCard | null { return state.cards.length ? state.cards[state.currentCardIndex % state.cards.length] ?? null : null; }
export function getActivePlayer(state: GameState): QueuePlayer | null { return state.currentPlayerId ? state.queue.find((p) => p.id === state.currentPlayerId) ?? null : null; }
export function getWaitingPlayers(state: GameState): QueuePlayer[] { return state.queue.filter((p) => p.status === 'waiting'); }
