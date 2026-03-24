import { useState, useEffect } from 'react';

const STORAGE_KEY = 'bix-pin';
const DEFAULT_PIN = '1234';

function getStoredPin() {
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_PIN;
}

export function setPin(newPin) {
  localStorage.setItem(STORAGE_KEY, newPin);
}

export function getPin() {
  return getStoredPin();
}

export function useAuth() {
  const [unlocked, setUnlocked] = useState(() => {
    return sessionStorage.getItem('bix-unlocked') === 'true';
  });

  function unlock() {
    sessionStorage.setItem('bix-unlocked', 'true');
    setUnlocked(true);
  }

  function lock() {
    sessionStorage.removeItem('bix-unlocked');
    setUnlocked(false);
  }

  return { unlocked, unlock, lock };
}

export default function PinGate({ children }) {
  const { unlocked, unlock } = useAuth();
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  function handleDigit(d) {
    if (input.length >= 6) return;
    const next = input + d;
    setInput(next);
    setError(false);
  }

  function handleDelete() {
    setInput((v) => v.slice(0, -1));
    setError(false);
  }

  function handleSubmit() {
    if (input === getStoredPin()) {
      unlock();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => { setShake(false); setInput(''); }, 500);
    }
  }

  useEffect(() => {
    if (input.length === getStoredPin().length) {
      handleSubmit();
    }
  }, [input]);

  if (unlocked) return children;

  return (
    <div className="min-h-screen bg-kp-surface flex flex-col items-center justify-center px-6">
      <div className="w-8 h-8 rounded-full bg-kp-primary-container flex items-center justify-center mb-3">
        <span className="material-symbols-outlined text-kp-on-primary-fixed text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>sports_soccer</span>
      </div>
      <h1 className="text-kp-primary-container font-headline font-black uppercase tracking-tighter text-3xl mb-1">BiX</h1>
      <p className="text-kp-on-surface-variant text-sm mb-8">Enter PIN to continue</p>

      {/* PIN dots */}
      <div className={`flex gap-3 mb-8 ${shake ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}>
        {Array.from({ length: getStoredPin().length }, (_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full transition-all duration-150 ${
              i < input.length
                ? error ? 'bg-kp-error scale-110' : 'bg-kp-primary-container scale-110'
                : 'bg-kp-surface-variant'
            }`}
          />
        ))}
      </div>

      {/* Number pad */}
      <div className="grid grid-cols-3 gap-4 max-w-[280px] w-full">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            onClick={() => handleDigit(String(n))}
            className="w-full aspect-square rounded-2xl bg-kp-surface-high text-kp-on-surface font-headline font-bold text-2xl flex items-center justify-center active:bg-kp-surface-variant active:scale-95 transition-all"
          >
            {n}
          </button>
        ))}
        <div />
        <button
          onClick={() => handleDigit('0')}
          className="w-full aspect-square rounded-2xl bg-kp-surface-high text-kp-on-surface font-headline font-bold text-2xl flex items-center justify-center active:bg-kp-surface-variant active:scale-95 transition-all"
        >
          0
        </button>
        <button
          onClick={handleDelete}
          className="w-full aspect-square rounded-2xl text-kp-on-surface-variant flex items-center justify-center active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-2xl">backspace</span>
        </button>
      </div>

      {error && (
        <p className="text-kp-error text-sm mt-4 font-bold">Wrong PIN</p>
      )}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          50% { transform: translateX(8px); }
          75% { transform: translateX(-4px); }
        }
      `}</style>
    </div>
  );
}
