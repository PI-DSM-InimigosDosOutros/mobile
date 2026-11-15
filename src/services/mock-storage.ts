import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DashboardData } from '@/utils/dashboard';
import type { Practice } from '@/hooks/use-workout-practice';
import { initialRegistration, type RegistrationDraft } from '@/utils/registration';

export type MockSnapshot = { version: 1; active: boolean; savedAt: number; data: DashboardData; practice: Practice | null };
export const mockStorageKey = '@workin/mock/v1';
let writes = Promise.resolve();

export async function readMock(): Promise<MockSnapshot | null> {
  await writes;
  const stored = await AsyncStorage.getItem(mockStorageKey);
  if (!stored) return null;
  const value = JSON.parse(stored) as MockSnapshot;
  if (value.version !== 1 || typeof value.active !== 'boolean' || !Number.isFinite(value.savedAt) || !value.data?.profile
    || !Array.isArray(value.data.workout?.exercises) || !Array.isArray(value.data.history)) {
    throw new Error('Os dados locais não são compatíveis com esta versão.');
  }
  return value;
}

export function saveMock(snapshot: MockSnapshot) {
  // Uma gravação por vez impede que uma escolha antiga sobrescreva a mais recente.
  const write = writes.then(() => AsyncStorage.setItem(mockStorageKey, JSON.stringify(snapshot)));
  writes = write.catch(() => {});
  return write;
}

export async function readLocalDraft(): Promise<RegistrationDraft> {
  const stored = await AsyncStorage.getItem('@workin/mock-draft/v1');
  if (!stored) return initialRegistration;
  const value = JSON.parse(stored) as RegistrationDraft;
  return { ...initialRegistration, ...value, password: '', confirmPassword: '' };
}

export function saveLocalDraft(draft: RegistrationDraft) {
  const { password, confirmPassword, ...fields } = draft;
  void password; void confirmPassword;
  const write = writes.then(() => AsyncStorage.setItem('@workin/mock-draft/v1', JSON.stringify(fields)));
  writes = write.catch(() => {});
  return write;
}
