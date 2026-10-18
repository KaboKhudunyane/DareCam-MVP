import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cards, formatScore, initialLeaderboard, queue, rewardIdeas, starterChat, type ChatMessage, type LeaderboardRow, type Role } from '../mockData';
import { getDemoProfile, saveDemoProfile } from '../demoState';

export default function SessionPage() {
  const navigate = useNavigate();
  const profile = getDemoProfile();
  const [role, setRole] = useState<Role>(profile.role);
  const [currentPlayer, setCurrentPlayer] = useState(queue[0]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [verified, setVerified] = useState(false);
  const [score, setScore] = useState(420);
  const [chat, setChat] = useState<ChatMessage[]>(starterChat);
  const [draft, setDraft] = useState('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>(initialLeaderboard);

  const currentCard = cards[currentCardIndex];

  const queueIndex = useMemo(
    () => queue.findIndex((player) => player.id === currentPlayer.id),
    [currentPlayer.id],
  );

  const nextPlayer = () => {
    const nextIndex = (queueIndex + 1) % queue.length;
    setCurrentPlayer(queue[nextIndex]);
    setCurrentCardIndex(0);
    setVerified(false);
  };

  const handleVerify = () => {
    if (verified) {
      return;
    }

    const nextScore = score + currentCard.points;
    setScore(nextScore);
    setVerified(true);
    setLeaderboard((previous) =>
      previous.map((entry) =>
        entry.name === 'You' ? { ...entry, score: nextScore, badge: 'On fire' } : entry,
      ),
    );
  };

  const handleNextCard = () => {
    setCurrentCardIndex((prev) => (prev + 1) % cards.length);
    setVerified(false);
  };

  const handleSkip = () => {
    setCurrentCardIndex((prev) => (prev + 1) % cards.length);
    setVerified(false);
  };

  const handleSendChat = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!draft.trim()) {
      return;
    }

    setChat((previous) => [...previous, { id: Date.now(), sender: 'Host', text: draft.trim() }]);
    setDraft('');
  };

  const handleRoleChange = (value: Role) => {
    setRole(value);
    saveDemoProfile({ ...profile, role: value });
  };

  return (
    <div className="page-shell session-page">
      <header className="top-nav narrow-topbar">
        <div className="brand-block">
          <span className="brand-mark">D</span>
          <span>DareCam</span>
        </div>

        <div className="top-nav-actions">
          <button type="button" className="ghost-button small-button" onClick={() => navigate('/lobby')}>
            Back to lobby
          </button>
          <div className="segmented-control" aria-label="Role selector">
            <button
              type="button"
              className={role === 'host' ? 'active' : ''}
              onClick={() => handleRoleChange('host')}
            >
              Host
            </button>
            <button
              type="button"
              className={role === 'player' ? 'active' : ''}
              onClick={() => handleRoleChange('player')}
            >
              Player
            </button>
          </div>
        </div>
      </header>

      <main className="session-grid">
        <section className="panel live-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Session</p>
              <h3>
                {role === 'host' ? 'Host console' : 'Player view'} • {profile.displayName}
              </h3>
            </div>
            <button type="button" className="secondary-button" onClick={nextPlayer}>
              Next player
            </button>
          </div>

          <div className="video-stage">
            <div className="video-portrait">
              <span>{currentPlayer.avatar}</span>
            </div>
            <div className="video-meta">
              <strong>{currentPlayer.name}</strong>
              <span>{currentPlayer.city}</span>
              <span>Streak {currentPlayer.streak} • Rating {currentPlayer.rating}%</span>
            </div>
          </div>

          <div className="stats-row">
            <div className="stat-box">
              <label>Queue</label>
              <strong>{queue.length} waiting</strong>
            </div>
            <div className="stat-box">
              <label>Points</label>
              <strong>{formatScore(score)}</strong>
            </div>
            <div className="stat-box">
              <label>Rank</label>
              <strong>#3 today</strong>
            </div>
          </div>
        </section>

        <section className="panel card-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Current card</p>
              <h3>{currentCard.title}</h3>
            </div>
            <span className="status-pill neutral">{currentCard.category}</span>
          </div>

          <div className="card-body">
            <div className="card-badges">
              <span className="tag">{currentCard.difficulty}</span>
              <span className="tag">{currentCard.points} pts</span>
            </div>
            <p>{currentCard.description}</p>

            <div className="progress-wrap">
              <div className="progress-bar">
                <span style={{ width: `${(currentCard.progress / currentCard.totalSteps) * 100}%` }} />
              </div>
              <small>
                Step {currentCard.progress}/{currentCard.totalSteps}
              </small>
            </div>

            <div className="action-row">
              <button type="button" className="primary-button" onClick={handleVerify}>
                {verified ? 'Verified' : 'Verify'}
              </button>
              <button type="button" className="secondary-button" onClick={handleNextCard}>
                Next
              </button>
              <button type="button" className="ghost-button" onClick={handleSkip}>
                Skip
              </button>
            </div>
          </div>

          <div className="card-list">
            {cards.map((card, index) => (
              <button
                key={card.id}
                type="button"
                className={index === currentCardIndex ? 'mini-card active' : 'mini-card'}
                onClick={() => setCurrentCardIndex(index)}
              >
                <span>{card.title}</span>
                <strong>{card.points} pts</strong>
              </button>
            ))}
          </div>
        </section>

        <aside className="panel sidebar-panel">
          <div className="panel-header compact">
            <div>
              <p className="eyebrow">Chat</p>
              <h3>Host + player</h3>
            </div>
          </div>

          <div className="chat-list">
            {chat.map((message) => (
              <div key={message.id} className={`message ${message.sender.toLowerCase()}`}>
                <span>{message.sender}</span>
                <p>{message.text}</p>
              </div>
            ))}
          </div>

          <form className="composer" onSubmit={handleSendChat}>
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Suggest a reward or give a prompt"
              aria-label="Chat message"
            />
            <button type="submit">Send</button>
          </form>

          <div className="reward-box">
            <p className="eyebrow">Reward ideas</p>
            <div className="reward-list">
              {rewardIdeas.map((idea) => (
                <button type="button" key={idea} className="reward-chip">
                  {idea}
                </button>
              ))}
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
            {leaderboard.map((entry) => (
              <div key={entry.id} className="leader-row">
                <div>
                  <strong>{entry.name}</strong>
                  <small>{entry.badge}</small>
                </div>
                <span>{formatScore(entry.score)}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
