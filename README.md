:root {
  font-family: Inter, 'Segoe UI', sans-serif;
  color: #f5f7ff;
  background: #090b14;
  line-height: 1.5;
  font-weight: 400;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color-scheme: dark;
  --bg: #090b14;
  --bg-alt: #141a2d;
  --panel: rgba(20, 26, 45, 0.9);
  --panel-soft: rgba(33, 41, 66, 0.9);
  --border: rgba(155, 168, 255, 0.18);
  --primary: #a7ff5d;
  --primary-strong: #73ffb3;
  --violet: #8f7dff;
  --coral: #ff7a7a;
  --text: #edf3ff;
  --muted: #c2c9db;
  --shadow: 0 24px 50px rgba(7, 11, 22, 0.55);
}

* {
  box-sizing: border-box;
}

html,
body,
#root {
  margin: 0;
  min-height: 100%;
  min-width: 100%;
  background: radial-gradient(circle at top, rgba(134, 141, 255, 0.15), transparent 25%), var(--bg);
}

body {
  min-height: 100vh;
  color: var(--text);
}

button,
input {
  font: inherit;
}

button {
  cursor: pointer;
}

.app-shell {
  max-width: 1480px;
  margin: 0 auto;
  padding: 32px 24px 56px;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
}

.topbar h1,
.panel-header h3,
.gate-copy h2 {
  margin: 0;
}

.eyebrow {
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 11px;
  color: var(--primary-strong);
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 12px;
  border: 1px solid var(--border);
}

.status-pill.success {
  background: rgba(96, 255, 163, 0.12);
  color: var(--primary-strong);
}

.status-pill.neutral {
  background: rgba(143, 125, 255, 0.12);
  color: #d7d2ff;
}

.segmented-control {
  display: inline-flex;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 4px;
}

.segmented-control button {
  border: none;
  background: transparent;
  color: var(--muted);
  padding: 10px 16px;
  border-radius: 999px;
  transition: 0.2s ease;
}

.segmented-control button.active {
  background: linear-gradient(135deg, var(--primary), var(--primary-strong));
  color: #071110;
  font-weight: 700;
}

.gate-panel,
.panel {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 24px;
  box-shadow: var(--shadow);
}

.gate-panel {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 20px;
  padding: 28px;
}

.gate-copy {
  max-width: 700px;
}

.gate-copy h2 {
  font-size: clamp(2rem, 4vw, 3rem);
  margin-bottom: 12px;
}

.gate-copy p {
  margin: 0;
  color: var(--muted);
  font-size: 1.05rem;
}

.gate-actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
  justify-content: center;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 22px;
}

.check-row {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text);
}

.check-row input {
  width: 18px;
  height: 18px;
}

.primary-button,
.secondary-button,
.ghost-button,
.composer button,
.reward-chip,
.mini-card {
  border-radius: 14px;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.primary-button,
.secondary-button,
.ghost-button,
.composer button {
  border: none;
  padding: 12px 18px;
  font-weight: 600;
}

.primary-button {
  background: linear-gradient(135deg, var(--primary), var(--primary-strong));
  color: #071110;
}

.secondary-button {
  background: rgba(143, 125, 255, 0.12);
  border: 1px solid rgba(143, 125, 255, 0.3);
  color: var(--text);
}

.ghost-button {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--muted);
}

.primary-button:hover,
.secondary-button:hover,
.ghost-button:hover,
.composer button:hover,
.reward-chip:hover,
.mini-card:hover {
  transform: translateY(-1px);
}

.main-grid {
  display: grid;
  grid-template-columns: 1.1fr 1.2fr 0.9fr;
  gap: 22px;
}

.panel {
  padding: 20px;
}

.live-panel,
.card-panel,
.sidebar-panel,
.leaderboard-panel {
  min-height: 320px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.panel-header.compact {
  margin-bottom: 14px;
}

.video-stage {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 18px;
  align-items: center;
  background: linear-gradient(180deg, rgba(143, 125, 255, 0.18), rgba(10, 12, 20, 0.3));
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 18px;
}

.video-portrait {
  display: grid;
  place-items: center;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 22px;
  background: radial-gradient(circle, rgba(167, 255, 93, 0.2), rgba(143, 125, 255, 0.25));
  border: 1px solid rgba(167, 255, 93, 0.25);
  font-size: 3.4rem;
  font-weight: 800;
  color: var(--primary-strong);
}

.video-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.video-meta strong {
  font-size: 1.8rem;
}

.video-meta span {
  color: var(--muted);
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
}

.stat-box {
  background: var(--panel-soft);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 14px 16px;
}

.stat-box label {
  display: block;
  color: var(--muted);
  margin-bottom: 6px;
}

.stat-box strong {
  font-size: 1.1rem;
}

.card-body {
  background: linear-gradient(180deg, rgba(167, 255, 93, 0.08), rgba(255, 122, 122, 0.04));
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 18px;
}

.card-badges {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.tag {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border);
  padding: 7px 10px;
  font-size: 12px;
  color: var(--muted);
}

.card-body p {
  margin: 0 0 16px;
  color: var(--text);
  font-size: 1.05rem;
}

.progress-wrap {
  margin-bottom: 18px;
}

.progress-bar {
  height: 10px;
  width: 100%;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border);
  overflow: hidden;
}

.progress-bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--primary), var(--primary-strong));
}

.progress-wrap small {
  display: block;
  margin-top: 8px;
  color: var(--muted);
}

.action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.card-list {
  display: grid;
  gap: 10px;
  margin-top: 18px;
}

.mini-card {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border);
  padding: 12px 14px;
  color: var(--text);
  text-align: left;
}

.mini-card.active {
  background: rgba(167, 255, 93, 0.08);
  border-color: rgba(167, 255, 93, 0.25);
}

.sidebar-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 200px;
  padding: 8px 0;
}

.message {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 10px 12px;
}

.message span {
  display: block;
  margin-bottom: 4px;
  color: var(--primary-strong);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.message p {
  margin: 0;
  color: var(--text);
}

.composer {
  display: flex;
  gap: 10px;
  margin-top: auto;
}

.composer input {
  flex: 1;
  background: rgba(9, 11, 20, 0.8);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px 14px;
  color: var(--text);
}

.composer button {
  background: var(--violet);
  color: white;
}

.reward-box {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 16px;
}

.reward-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.reward-chip {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border);
  color: var(--text);
  padding: 8px 10px;
}

.leaderboard-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.leader-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border);
  border-radius: 14px;
}

.leader-row strong,
.leader-row span {
  display: block;
}

.leader-row small {
  color: var(--muted);
}

@media (max-width: 1110px) {
  .main-grid {
    grid-template-columns: 1fr;
  }

  .gate-panel {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .app-shell {
    padding: 24px 16px 40px;
  }

  .topbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .video-stage {
    grid-template-columns: 1fr;
  }

  .stats-row {
    grid-template-columns: 1fr;
  }

  .action-row,
  .composer {
    flex-direction: column;
  }
}
