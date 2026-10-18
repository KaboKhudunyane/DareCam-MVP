import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="page-shell landing-page">
      <header className="top-nav">
        <div className="brand-block">
          <span className="brand-mark">D</span>
          <span>DareCam</span>
        </div>
        <nav className="top-nav-actions">
          <Link to="/onboard">Enter</Link>
          <Link to="/session" className="nav-cta">
            Demo session
          </Link>
        </nav>
      </header>

      <main className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">Live game. Safe by design.</p>
          <h1>Turn a live camera into a playful, host-led challenge show.</h1>
          <p className="lede">
            DareCam is a two-person, adult-only game where the host controls the cards, the
            player completes the task on camera, and the room earns points, streaks, and rewards.
          </p>

          <div className="hero-actions">
            <Link to="/onboard" className="primary-button large-button">
              Start onboarding
            </Link>
            <Link to="/lobby" className="secondary-button large-button">
              View lobby
            </Link>
          </div>

          <div className="feature-list">
            <div>
              <strong>18+</strong>
              <span>age gate + consent flow</span>
            </div>
            <div>
              <strong>2-person</strong>
              <span>single host, single player</span>
            </div>
            <div>
              <strong>Points</strong>
              <span>daily leaderboard & rewards</span>
            </div>
          </div>
        </div>

        <div className="hero-panel">
          <div className="mini-console">
            <div className="mini-header">
              <span className="live-dot" />
              Live room preview
            </div>
            <div className="mini-stage">
              <div className="mini-card-surface">
                <span>Wave at camera</span>
                <strong>100 pts</strong>
              </div>
            </div>
            <div className="mini-metrics">
              <div>
                <label>Queue</label>
                <strong>3 active</strong>
              </div>
              <div>
                <label>Reward</label>
                <strong>R50 airtime</strong>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
