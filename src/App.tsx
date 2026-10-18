import { useCallback, useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Splash from './components/Splash';
import PinGate from './components/PinGate';
import { useStore } from './store/useStore';

import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import CarePlan from './pages/CarePlan';
import MedicationTracker from './pages/MedicationTracker';
import Schedule from './pages/Schedule';
import EventDetail from './pages/EventDetail';
import Insights from './pages/Insights';
import EscalationDemo from './pages/EscalationDemo';
import Profile from './pages/Profile';
import Vaccines from './pages/Vaccines';
import BloodPressure from './pages/BloodPressure';
import Support from './pages/Support';
import MoodCheck from './pages/MoodCheck';
import Choices from './pages/Choices';
import LearnArticle, { LearnIndex } from './pages/Learn';
import Inbox from './pages/Inbox';

function RequireOnboarding({ children }: { children: React.ReactElement }) {
  const onboarded = useStore((s) => s.user.onboardingComplete);
  if (!onboarded) return <Navigate to="/onboarding" replace />;
  return children;
}

function AnimatedRoutes({ onOnboarded }: { onOnboarded: () => void }) {
  const location = useLocation();
  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/onboarding" element={<Onboarding onFinished={onOnboarded} />} />
      <Route
        element={
          <RequireOnboarding>
            <Layout />
          </RequireOnboarding>
        }
      >
        <Route path="/home" element={<Home />} />
        <Route path="/care-plan" element={<CarePlan />} />
        <Route path="/medications" element={<MedicationTracker />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/event/:category/:id" element={<EventDetail />} />
        <Route path="/vaccines" element={<Vaccines />} />
        <Route path="/bp" element={<BloodPressure />} />
        <Route path="/support" element={<PinGate><Support /></PinGate>} />
        <Route path="/support/mood" element={<PinGate><MoodCheck /></PinGate>} />
        <Route path="/choices" element={<PinGate><Choices /></PinGate>} />
        <Route path="/learn" element={<LearnIndex />} />
        <Route path="/learn/:id" element={<LearnArticle />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/escalation-demo" element={<EscalationDemo />} />
        <Route path="/me" element={<Profile />} />
        <Route path="/profile" element={<Navigate to="/me" replace />} />
        <Route path="/guidance" element={<Navigate to="/learn" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

export default function App() {
  const onboarded = useStore((s) => s.user.onboardingComplete);
  const [splash, setSplash] = useState(onboarded);
  const hide = useCallback(() => setSplash(false), []);
  const show = useCallback(() => setSplash(true), []);
  return (
    <HashRouter>
      {splash && <Splash onDone={hide} />}
      <AnimatedRoutes onOnboarded={show} />
    </HashRouter>
  );
}
