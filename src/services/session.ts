import AsyncStorage from '@react-native-async-storage/async-storage';

export type AuthSession = {
  token: string;
  user: { id: number | string; firstName: string; lastName: string; email: string };
};
const sessionKey = '@workin/session';

export function isAuthSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<AuthSession>;
  return typeof candidate.token === 'string' && Boolean(candidate.token)
    && Boolean(candidate.user?.id) && typeof candidate.user?.email === 'string'
    && typeof candidate.user?.firstName === 'string' && typeof candidate.user?.lastName === 'string';
}

export async function readSession(): Promise<AuthSession | null> {
  const stored = await AsyncStorage.getItem(sessionKey);
  if (!stored) return null;
  try {
    const value: unknown = JSON.parse(stored);
    return isAuthSession(value) ? value : null;
  } catch { return null; }
}

export async function writeSession(session: AuthSession | null) {
  if (session) await AsyncStorage.setItem(sessionKey, JSON.stringify(session));
  else await AsyncStorage.removeItem(sessionKey);
}

