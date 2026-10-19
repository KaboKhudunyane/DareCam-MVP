import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_PROFILE, saveDemoProfile, type DemoRole } from '../demoProfile';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [adultConfirmed, setAdultConfirmed] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [displayName, setDisplayName] = useState(DEFAULT_PROFILE.displayName);
  const [city, setCity] = useState(DEFAULT_PROFILE.city);
  const [role, setRole] = useState<DemoRole>(DEFAULT_PROFILE.role);

  const canContinue = adultConfirmed && consentAccepted && displayName.trim().length > 1;

  const handleContinue = () => {
    if (!canContinue) {
      return;
    }

    const profile = {
      displayName: displayName.trim(),
      city: city.trim() || DEFAULT_PROFILE.city,
      role,
      avatar: displayName.trim().charAt(0).toUpperCase() || DEFAULT_PROFILE.avatar,
    };

    saveDemoProfile(profile);
    navigate('/lobby');
  };

  return (
    <div className="page-shell onboarding-page">
      <div className="panel auth-panel">
        <p className="eyebrow">Age check</p>
        <h1>18+ access and consent required</h1>
        <p className="lede">
          DareCam is designed for adults only. The host is live, the player is in a single-room
          challenge flow, and every session begins with explicit consent to keep the experience safe.
        </p>

        <div className="profile-form">
          <label>
            Display name
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="e.g. Kabo"
            />
          </label>

          <label>
            City
            <input
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder="e.g. Johannesburg"
            />
          </label>

          <div className="role-choice">
            <span>Choose your primary role</span>
            <div className="segmented-control compact-control">
              <button
                type="button"
                className={role === 'host' ? 'active' : ''}
                onClick={() => setRole('host')}
              >
                Host
              </button>
              <button
                type="button"
                className={role === 'player' ? 'active' : ''}
                onClick={() => setRole('player')}
              >
                Player
              </button>
            </div>
          </div>
        </div>

        <div className="consent-stack">
          <label className="check-row">
            <input
              type="checkbox"
              checked={adultConfirmed}
              onChange={(event) => setAdultConfirmed(event.target.checked)}
            />
            I confirm I am 18 years or older.
          </label>

          <label className="check-row">
            <input
              type="checkbox"
              checked={consentAccepted}
              onChange={(event) => setConsentAccepted(event.target.checked)}
            />
            I understand the host is watching live and I consent before each session.
          </label>
        </div>

        <div className="button-row">
          <button type="button" className="secondary-button" onClick={() => navigate('/')}>
            Back home
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={handleContinue}
            disabled={!canContinue}
          >
            Continue to lobby
          </button>
        </div>
      </div>
    </div>
  );
}
