import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addPlayerToQueue, getGameState, getPlayerSettings, savePlayerSettings, startSessionForPlayer, subscribeToGameState } from '../gameState';

export default function PlayerHomePage() {
  const navigate = useNavigate();
  const storedProfile = useMemo(() => getPlayerSettings(), []);
  const [nickname, setNickname] = useState(storedProfile.nickname || '');
  const [age, setAge] = useState(storedProfile.age || '18');
  const [status, setStatus] = useState('');
  const [gameState, setGameState] = useState(() => getGameState());

  useEffect(() => {
    const unsubscribe = subscribeToGameState(() => setGameState(getGameState()));
    return unsubscribe;
  }, []);

  const canJoin = nickname.trim().length >= 2 && Number(age) >= 18;

  const handleJoin = () => {
    if (!canJoin) {
      setStatus('Please enter a valid nickname and confirm you are 18+.');
      return;
    }

    const playerName = nickname.trim();
    const playerAge = Number(age);
    const profileId = storedProfile.playerId || `player-${Date.now()}`;

    savePlayerSettings(profileId, playerName, String(playerAge));
    const nextState = addPlayerToQueue(playerName, playerAge);

    if (nextState.queue.some((player) => player.name === playerName && player.age === playerAge)) {
      setGameState(nextState);
      navigate('/lobby');
    }
  };

  return (
    <div className="page-shell landing-page">
      <header className="top-nav">
        <div className="brand-block">
          <span className="brand-mark">D</span>
          <span>DareCam</span>
        </div>
        <nav className="top-nav-actions">
          <button type="button" className="ghost-button small-button" onClick={() => navigate('/admin')}>
            Host login
          </button>
        </nav>
      </header>

      <main className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">Live game. Safe by design.</p>
          <h1>Turn a live camera into a playful host-led challenge show.</h1>
          <p className="lede">
            We match one player with one host. The host controls the prompts. You complete the challenge, the host reviews it live, and points climb up the daily leaderboard.
          </p>

          <div className="player-form">
            <label>
              Nickname
              <input value={nickname} onChange={(event) => setNickname(event.target.value)} placeholder="e.g. Zuri" />
            </label>

            <label>
              Age
              <input type="number" min={18} max={99} value={age} onChange={(event) => setAge(event.target.value)} />
            </label>

            <div className="button-row">
              <button type="button" className="primary-button" onClick={handleJoin} disabled={!canJoin}>
                Join the lobby
              </button>
            </div>

            {status ? <small className="form-status">{status}</small> : null}
          </div>
        </div>

        <div className="hero-panel">
          <div className="mini-console">
            <div className="mini-header">
              <span className="live-dot" />
              Waiting room preview
            </div>
            <div className="mini-stage">
              <div className="mini-card-surface">
                <span>{gameState.cards[0]?.prompt ?? 'Wave at camera'}</span>
                <strong>{gameState.cards[0]?.points ?? 100} pts</strong>
              </div>
            </div>
            <div className="mini-metrics">
              <div>
                <label>Queue</label>
                <strong>{gameState.queue.length} waiting</strong>
              </div>
              <div>
                <label>Reward</label>
                <strong>Top scorer wins</strong>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
