import { useEffect } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { Home, Calendar, BookOpen, TrendingUp, User } from 'lucide-react';
import { initializeDb } from './db';

import HomePage from './pages/Home';
import PlannerPage from './pages/Planner';
import LibraryPage from './pages/Library';
import ProgressPage from './pages/Progress';
import ProfilePage from './pages/Profile';

const tabs = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/planner', icon: Calendar, label: 'Plan' },
  { to: '/library', icon: BookOpen, label: 'Drills' },
  { to: '/progress', icon: TrendingUp, label: 'Progress' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function App() {
  useEffect(() => {
    initializeDb();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8faf9]">
      <main className="pb-20">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/planner" element={<PlannerPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
          {tabs.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 px-3 py-2 min-w-[64px] transition-colors duration-200 ${
                  isActive ? 'text-emerald-600' : 'text-gray-400'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    fill={isActive ? 'currentColor' : 'none'}
                  />
                  <span className={`text-[10px] leading-tight ${isActive ? 'font-semibold' : 'font-medium'}`}>
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
