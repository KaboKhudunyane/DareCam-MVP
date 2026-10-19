import { useEffect, useMemo, useState } from 'react';
import { addChatMessage, addCard, advanceCard, acceptCurrentCard, deleteCard, endSession, getActivePlayer, getCurrentCard, getGameState, rejectCurrentCard, reorderCard, startSessionForPlayer, subscribeToGameState } from '../gameState';

const EMPTY_CARD = { type: 'action', prompt: '', points: 100, timer: 20 };

export default function AdminPage() {
  const [gameState, setGameState] = useState(() => getGameState());
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.sessionStorage.getItem('darecam-admin-auth') === 'true';
  });
  const [password, setPassword] = useState('');
  const [draftCard, setDraftCard] = useState(EMPTY_CARD);

  useEffect(() => {
    const unsubscribe = subscribeToGameState(() => setGameState(getGameState()));
    return unsubscribe;
  }, []);

  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD ?? '';
  const activePlayer = useMemo(() => getActivePlayer(gameState), [gameState]);
  const currentCard = useMemo(() => getCurrentCard(gameState), [gameState]);

  const handleLogin = () => {
    if (!adminPassword) {
      setPassword('');
      return;
    }

    if (password === adminPassword) {
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('darecam-admin-auth', 'true');
      }
      setIsAuthenticated(true);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="page-shell auth-page">
        <div className="panel auth-panel">
          <p className="eyebrow">Admin access</p>
          <h1>Host login</h1>
          <p className="lede">This route is private. Set VITE_ADMIN_PASSWORD in Netlify before deployment.</p>
          <div className="player-form">
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter host password"
              />
            </label>
            <div className="button-row">
              <button type="button" className="primary-button" onClick={handleLogin} disabled={!adminPassword}>
                Unlock host console
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const queuePlayers = gameState.queue.filter((player) => player.id !== gameState.currentPlayerId);

  const handleStartSession = (playerId: string) => {
    setGameState(startSessionForPlayer(playerId));
  };

  const handleSendChat = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const input = form.elements.namedItem('chat-message') as HTMLInputElement | null;
    if (!input) {
      return;
    }

    setGameState(addChatMessage('Host', input.value));
    input.value = '';
  };

  const handleAddCard = () => {
    if (!draftCard.prompt.trim()) {
      return;
    }

    setGameState(addCard(draftCard));
    setDraftCard(EMPTY_CARD);
  };

  return (
    <div className="page-shell session-page">
      <header className="top-nav narrow-topbar">
        <div className="brand-block">
          <span className="brand-mark">D</span>
          <span>DareCam</span>
        </div>

        <div className="top-nav-actions">
          <button type="button" className="ghost-button small-button" onClick={() => setIsAuthenticated(false)}>
            Log out
          </button>
        </div>
      </header>

      <main className="session-grid admin-grid">
        <section className="panel live-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Session</p>
              <h3>{activePlayer ? `${activePlayer.name} live` : 'Host console'}</h3>
            </div>
            {activePlayer ? (
              <button type="button" className="secondary-button" onClick={() => setGameState(endSession())}>
                End session
              </button>
            ) : null}
          </div>

          <div className="video-stage">
            <div className="video-portrait">
              <span>{activePlayer ? activePlayer.name.slice(0, 1).toUpperCase() : 'H'}</span>
            </div>
            <div className="video-meta">
              <strong>{activePlayer ? activePlayer.name : 'Waiting room'}</strong>
              <span>{activePlayer ? `${activePlayer.age} years old` : 'No player active yet'}</span>
              <span>{activePlayer ? `Score: ${activePlayer.score} pts` : 'Queue open'}</span>
            </div>
          </div>

          <div className="stats-row">
            <div className="stat-box">
              <label>Queue</label>
              <strong>{gameState.queue.length} waiting</strong>
            </div>
            <div className="stat-box">
              <label>Score</label>
              <strong>{activePlayer ? `${activePlayer.score} pts` : '0 pts'}</strong>
            </div>
            <div className="stat-box">
              <label>Top badge</label>
              <strong>{gameState.leaderboard[0]?.badge ?? 'New'}</strong>
            </div>
          </div>
        </section>

        <section className="panel card-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Current card</p>
              <h3>{currentCard?.prompt ?? 'No card loaded'}</h3>
            </div>
            <span className="status-pill neutral">{currentCard?.type ?? 'action'}</span>
          </div>

          <div className="card-body">
            <div className="card-badges">
              <span className="tag">{currentCard?.points ?? 0} pts</span>
              <span className="tag">{currentCard?.timer ?? 30}s</span>
            </div>
            <p>{currentCard?.prompt ?? 'Queue a player and send the first card.'}</p>

            <div className="action-row">
              <button type="button" className="primary-button" onClick={() => setGameState(acceptCurrentCard())}>
                Accept
              </button>
              <button type="button" className="secondary-button" onClick={() => setGameState(rejectCurrentCard())}>
                Reject
              </button>
              <button type="button" className="ghost-button" onClick={() => setGameState(advanceCard())}>
                Next card
              </button>
            </div>
          </div>

          <div className="card-list">
            {gameState.cards.map((card, index) => (
              <div key={card.id} className={index === gameState.currentCardIndex ? 'mini-card active' : 'mini-card'}>
                <span>{card.prompt}</span>
                <strong>{card.points} pts</strong>
                <div className="mini-card-actions">
                  <button type="button" onClick={() => setGameState({ ...gameState, currentCardIndex: index })}>Use</button>
                  <button type="button" onClick={() => setGameState(reorderCard(card.id, 'up'))}>↑</button>
                  <button type="button" onClick={() => setGameState(reorderCard(card.id, 'down'))}>↓</button>
                  <button type="button" onClick={() => setGameState(deleteCard(card.id))}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="panel sidebar-panel">
          <div className="panel-header compact">
            <div>
              <p className="eyebrow">Queue</p>
              <h3>Waiting players</h3>
            </div>
          </div>

          <div className="queue-grid admin-queue">
            {queuePlayers.length ? (
              queuePlayers.map((player) => (
                <button key={player.id} type="button" className="queue-card" onClick={() => handleStartSession(player.id)}>
                  <div className="queue-avatar">{player.name.slice(0, 1).toUpperCase()}</div>
                  <div className="queue-meta">
                    <strong>{player.name}</strong>
                    <span>{player.age} years</span>
                    <small>{player.score} pts</small>
                  </div>
                </button>
              ))
            ) : (
              <div className="queue-empty">No one is queued yet.</div>
            )}
          </div>

          <form className="composer" onSubmit={handleSendChat}>
            <input name="chat-message" placeholder="Suggest a reward or give a prompt" aria-label="Host chat message" />
            <button type="submit">Send</button>
          </form>

          <div className="reward-box">
            <p className="eyebrow">Card library</p>
            <div className="player-form compact-form">
              <label>
                Prompt
                <input
                  value={draftCard.prompt}
                  onChange={(event) => setDraftCard((prev) => ({ ...prev, prompt: event.target.value }))}
                  placeholder="e.g. Do your best dance"
                />
              </label>
              <label>
                Type
                <select
                  value={draftCard.type}
                  onChange={(event) => setDraftCard((prev) => ({ ...prev, type: event.target.value as typeof prev.type }))}
                >
                  <option value="action">Action</option>
                  <option value="typed-answer">Typed answer</option>
                  <option value="question-set">Question set</option>
                  <option value="challenge">Challenge</option>
                </select>
              </label>
              <label>
                Points
                <input
                  type="number"
                  value={draftCard.points}
                  onChange={(event) => setDraftCard((prev) => ({ ...prev, points: Number(event.target.value) || 100 }))}
                />
              </label>
              <button type="button" className="primary-button" onClick={handleAddCard}>
                Add card
              </button>
            </div>
          </div>
        </aside>

        <section className="panel leaderboard-panel">
          <div className="panel-header compact">
            <div>
              <p className="eyebrow">Daily leaderboard</p>
              <h3>Top scores</h3>
            </div>
          </div>

          <div className="leaderboard-list">
            {gameState.leaderboard.map((entry) => (
              <div key={entry.id} className="leader-row">
                <div>
                  <strong>{entry.name}</strong>
                  <small>{entry.badge}</small>
                </div>
                <span>{entry.score} pts</span>
              </div>
            ))}
          </div>

          <div className="chat-list">
            {gameState.chat.map((message) => (
              <div key={message.id} className={`message ${message.sender.toLowerCase()}`}>
                <span>{message.sender}</span>
                <p>{message.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
