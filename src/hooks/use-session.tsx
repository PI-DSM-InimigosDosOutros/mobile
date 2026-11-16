import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { readSession, writeSession, type AuthSession } from '@/services/session';
import { isMockMode } from '@/services/api';

type SessionContextValue = {
  session: AuthSession | null;
  ready: boolean;
  error: string;
  signIn: (value: AuthSession) => Promise<void>;
  signOut: () => Promise<void>;
};
const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const restored = isMockMode ? Promise.resolve(null) : readSession();
    restored.then(value => { if (active) setSession(value); })
      .catch(() => { if (active) setError('Não foi possível recuperar a sessão neste dispositivo.'); })
      .finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);

  async function signIn(value: AuthSession) {
    await writeSession(value);
    setError('');
    setSession(value);
  }

  async function signOut() {
    await writeSession(null);
    setSession(null);
  }

  return <SessionContext.Provider value={{ session, ready, error, signIn, signOut }}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('A sessão precisa estar dentro de SessionProvider.');
  return context;
}

