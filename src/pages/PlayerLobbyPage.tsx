import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getActivePlayer, getGameState, getPlayerSettings, getCurrentCard, subscribeToGameState } from '../gameState';

export default function PlayerLobbyPage() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState(() => getGameState());
  const playerProfile = useMemo(() => getPlayerSettings(), []);

  useEffect(() => {
    const unsubscribe = subscribeToGameState(() => setGameState(getGameState()));
    return unsubscribe;
  }, []);

  const myPlayer = gameState.queue.find((player) => player.id === playerProfile.playerId) ?? null;
  const activePlayer = getActivePlayer(gameState);
  const currentCard = getCurrentCard(gameState);

  useEffect(() => {
    if (!playerProfile.playerId && !myPlayer) {
      navigate('/');
    }
  }, [myPlayer, navigate, playerProfile.playerId]);

  return (
    <div className="page-shell lobby-page">
      <header className="top-nav narrow-topbar">
        <div className="brand-block">
          <span className="brand-mark">D</span>
          <span>DareCam</span>
        </div>
        <nav className="top-nav-actions">
          <Link to="/">Home</Link>
          <button type="button" className="ghost-button small-button" onClick={() => navigate('/admin')}>
            Host view
          </button>
        </nav>
      </header>

      <main className="lobby-content">
        <section className="panel welcome-panel">
          <div className="welcome-row">
            <div>
              <p className="eyebrow">Player</p>
              <h2>{playerProfile.nickname || 'Player'} • {playerProfile.age || '18'}+</h2>
            </div>
            <div className="profile-chip">
              <span>{(playerProfile.nickname || 'P').slice(0, 1).toUpperCase()}</span>
              <small>{myPlayer ? 'Queued' : 'Ready'}</small>
            </div>
          </div>
        </section>

        {activePlayer && activePlayer.id === playerProfile.playerId ? (
          <section className="panel session-live-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Session</p>
                <h2>Waiting for host</h2>
              </div>
              <span className="status-pill active">Live now</span>
            </div>

            <div className="video-stage compact-video">
              <div className="video-portrait">
                <span>{playerProfile.nickname?.slice(0, 1).toUpperCase() || 'P'}</span>
              </div>
              <div className="video-meta">
                <strong>{playerProfile.nickname || 'Player'}</strong>
                <span>Host has paired you with the room.</span>
                <span>Current card: {currentCard?.prompt ?? 'Waiting for the first prompt.'}</span>
              </div>
            </div>

            <div className="card-body minimal-card-body">
              <div className="card-badges">
                <span className="tag">{currentCard?.type ?? 'action'}</span>
                <span className="tag">{currentCard?.points ?? 100} pts</span>
              </div>
              <p>{currentCard?.prompt ?? 'Waiting for host to send the first card.'}</p>
            </div>
          </section>
        ) : (
          <section className="panel waiting-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Lobby</p>
                <h2>Waiting for host</h2>
              </div>
            </div>
            <div className="waiting-message">
              <p>Your name is in the queue. When the host starts a session, the prompt appears here.</p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
