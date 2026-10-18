import { Link, useNavigate } from 'react-router-dom';
import { queue } from '../mockData';
import { getDemoProfile } from '../demoState';

export default function LobbyPage() {
  const navigate = useNavigate();
  const profile = getDemoProfile();

  return (
    <div className="page-shell lobby-page">
      <header className="top-nav narrow-topbar">
        <div className="brand-block">
          <span className="brand-mark">D</span>
          <span>DareCam</span>
        </div>
        <nav className="top-nav-actions">
          <Link to="/">Home</Link>
          <Link to="/onboard">Profile</Link>
          <Link to="/session" className="nav-cta">
            Start session
          </Link>
        </nav>
      </header>

      <main className="lobby-content">
        <section className="panel welcome-panel">
          <div className="welcome-row">
            <div>
              <p className="eyebrow">Welcome back</p>
              <h2>
                {profile.displayName} • {profile.role}
              </h2>
            </div>
            <div className="profile-chip">
              <span>{profile.avatar}</span>
              <small>{profile.city}</small>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Queue</p>
              <h2>Next up</h2>
            </div>
            <button type="button" className="primary-button" onClick={() => navigate('/session')}>
              Start with next player
            </button>
          </div>

          <div className="queue-grid">
            {queue.map((player) => (
              <article key={player.id} className="queue-card">
                <div className="queue-avatar">{player.avatar}</div>
                <div className="queue-meta">
                  <strong>{player.name}</strong>
                  <span>{player.city}</span>
                  <small>
                    {player.status} • Streak {player.streak} • {player.rating}%
                  </small>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
