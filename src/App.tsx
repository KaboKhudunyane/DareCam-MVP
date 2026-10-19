import { Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import OnboardingPage from './pages/OnboardingPage';
import LobbyPage from './pages/LobbyPage';
import SessionPage from './pages/SessionPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/onboard" element={<OnboardingPage />} />
      <Route path="/lobby" element={<LobbyPage />} />
      <Route path="/session" element={<SessionPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
