import { useEffect } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { initializeDb } from './db';

import HomePage from './pages/Home';
import PlannerPage from './pages/Planner';
import LibraryPage from './pages/Library';
import ProgressPage from './pages/Progress';
import ProfilePage from './pages/Profile';

const tabs = [
  { to: '/', icon: 'home', label: 'Home' },
  { to: '/planner', icon: 'event_note', label: 'Plan' },
  { to: '/library', icon: 'sports_soccer', label: 'Library' },
  { to: '/progress', icon: 'trending_up', label: 'Progress' },
  { to: '/profile', icon: 'settings', label: 'Settings' },
];

export default function App() {
  useEffect(() => {
    initializeDb();
  }, []);

  return (
    <div className="min-h-screen bg-kp-surface text-kp-on-surface">
      {/* Top Navigation */}
      <div className="sticky top-0 z-50 bg-kp-surface-low flex flex-col">
        {/* Brand Header */}
        <header className="w-full border-b border-kp-outline-variant/10">
          <div className="flex justify-between items-center px-4 py-3 w-full max-w-[1600px] mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-kp-primary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-kp-on-primary-fixed text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>sports_soccer</span>
              </div>
              <h1 className="text-kp-primary-container font-headline font-black uppercase tracking-tighter text-2xl">BiX</h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-kp-on-surface-variant hover:text-kp-primary active:scale-95 transition-all">
                <span className="material-symbols-outlined text-2xl">notifications</span>
              </button>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="w-full border-b border-kp-outline-variant/10 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-6 px-4 py-3 min-w-max mx-auto max-w-[1600px]">
            {tabs.map(({ to, icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-2 relative transition-colors ${
                    isActive ? 'text-kp-primary-container' : 'text-kp-on-surface-variant hover:text-kp-on-surface'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className="material-symbols-outlined text-xl"
                      style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                    >
                      {icon}
                    </span>
                    <span className="font-headline font-black text-xs uppercase tracking-widest">
                      {label}
                    </span>
                    {isActive && (
                      <div className="absolute -bottom-[13px] left-0 right-0 h-1 bg-kp-primary-container rounded-t-full" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/planner" element={<PlannerPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>
    </div>
  );
}
