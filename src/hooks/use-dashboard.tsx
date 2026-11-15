import { createContext, useCallback, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { createDemoDashboard } from '@/data/demo-dashboard';
import type { DashboardData, HistoryFilters } from '@/utils/dashboard';
import type { RegistrationProfile } from '@/utils/registration';
import { fetchDailyWorkout } from '@/services/api';
import { useSession } from '@/hooks/use-session';
import { useWorkoutPractice } from '@/hooks/use-workout-practice';
import { readMock, saveMock } from '@/services/mock-storage';
import { createLocalDashboard, generateMockWorkout, mockProgress, recordMockSummary } from '@/utils/mock-dashboard';

function accountData(firstName: string, lastName: string, email: string): DashboardData {
  return {
    profile: { fullName: `${firstName} ${lastName}`.trim(), email, birthDate: '', gender: '',
      heightCm: 0, weightKg: 0, activityLevel: null, medicalNotes: null,
      exerciseCategories: [], goal: '', availableMinutesPerDay: 0, availableDays: [], accentColor: '#BAE068' },
    workout: { id: '', title: 'Treino do dia', date: '', exercises: [] },
    history: [], week: [], currentStreak: 0,
  };
}

function useDashboardState(initialData?: DashboardData | null) {
  const { session, ready, signOut } = useSession();
  const [data, setData] = useState<DashboardData | null>(() => initialData ?? (session ? accountData(session.user.firstName, session.user.lastName, session.user.email) : null));
  const [isDemo, setDemo] = useState(Boolean(initialData));
  const [localReady, setLocalReady] = useState(Boolean(session || initialData));
  const [storageError, setStorageError] = useState('');
  const [loading, setLoading] = useState(Boolean(session));
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<HistoryFilters>({ status: 'all', from: '', to: '' });
  const revision = useRef(0);
  const persistEnabled = useRef(true);
  const practice = useWorkoutPractice(data?.workout, isDemo);
  const { restore, checkpoint, practice: activePractice } = practice;

  useEffect(() => {
    if (session || initialData) return;
    let active = true;
    readMock().then(saved => {
      if (active && saved?.active) {
        setData(mockProgress(saved.data));
        setDemo(true);
        restore(saved.practice, saved.data.workout, saved.savedAt);
      }
    }).catch(() => { if (active) setStorageError('Não foi possível recuperar os dados locais.'); })
      .finally(() => { if (active) setLocalReady(true); });
    return () => { active = false; };
  }, [session, initialData, restore]);

  useEffect(() => {
    if (!isDemo || !localReady || !data || !persistEnabled.current) return;
    let active = true;
    saveMock({ version: 1, active: true, savedAt: Date.now(), data, practice: activePractice })
      .then(() => { if (active) setStorageError(''); })
      .catch(() => { if (active) setStorageError('Não foi possível salvar os dados locais. Confira o armazenamento e tente novamente.'); });
    return () => { active = false; };
  }, [data, isDemo, localReady, activePractice, checkpoint]);
  const loadWorkout = useCallback(async () => {
    if (!session || isDemo) return;
    const version = ++revision.current;
    try {
      const workout = await fetchDailyWorkout();
      if (version === revision.current) setData(current => current ? { ...current, workout } : current);
    } catch (cause) {
      if (version === revision.current) setError(cause instanceof Error ? cause.message : 'Não foi possível carregar o treino.');
    } finally { if (version === revision.current) setLoading(false); }
  }, [session, isDemo]);

  useEffect(() => {
    if (!session || !ready || isDemo) return;
    let active = true;
    fetchDailyWorkout().then(workout => {
      if (active) setData(current => current ? { ...current, workout } : current);
    }).catch(cause => {
      if (active) setError(cause instanceof Error ? cause.message : 'Não foi possível carregar o treino.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [session, ready, isDemo]);

  async function refresh() {
    if (isDemo) {
      if (data) {
        await saveMock({ version: 1, active: true, savedAt: Date.now(), data, practice: activePractice })
          .then(() => setStorageError('')).catch(() => setStorageError('Não foi possível salvar os dados locais.'));
      }
      return;
    }
    setLoading(true);
    setError('');
    await loadWorkout();
  }

  async function enterDemo() {
    const saved = await readMock();
    const local = saved ? mockProgress(saved.data) : mockProgress(createDemoDashboard());
    await saveMock({ version: 1, active: true, savedAt: saved?.savedAt ?? Date.now(), data: local, practice: saved?.practice ?? null });
    persistEnabled.current = true;
    revision.current++;
    practice.reset();
    setFilters({ status: 'all', from: '', to: '' });
    setData(local);
    restore(saved?.practice ?? null, local.workout, saved?.savedAt ?? Date.now());
    setError('');
    setLoading(false);
    setDemo(true);
  }
  async function leaveDemo() {
    persistEnabled.current = false;
    try {
      if (isDemo && data) await saveMock({ version: 1, active: false, savedAt: Date.now(), data, practice: activePractice });
    } catch (error) { persistEnabled.current = true; throw error; }
    revision.current++;
    practice.reset();
    setFilters({ status: 'all', from: '', to: '' });
    setDemo(false);
    setData(null);
  }
  async function logout() {
    await leaveDemo();
    await signOut();
  }
  async function registerLocal(profile: RegistrationProfile) {
    const saved = await readMock();
    if (saved) throw new Error('Já existe um perfil local neste dispositivo. Abra o modo local para editar seus dados.');
    const local = createLocalDashboard(profile);
    await saveMock({ version: 1, active: true, savedAt: Date.now(), data: local, practice: null });
    persistEnabled.current = true;
    practice.reset();
    setData(local);
    setDemo(true);
  }
  async function updateDemoProfile(profile: RegistrationProfile) {
    if (!isDemo || !data) return;
    const local = mockProgress({ ...data, profile });
    await saveMock({ version: 1, active: true, savedAt: Date.now(), data: local, practice: activePractice });
    setData(local);
  }
  async function createWorkout() {
    if (!isDemo || !data) throw new Error('A criação de treino na conta aguarda a operação do servidor.');
    if (activePractice) throw new Error('Finalize ou encerre o treino em andamento antes de criar outro.');
    const local = { ...data, workout: generateMockWorkout(data.profile) };
    await saveMock({ version: 1, active: true, savedAt: Date.now(), data: local, practice: null });
    practice.reset();
    setData(local);
  }
  function keepSummary(summary: NonNullable<typeof practice.summary>) {
    if (isDemo) { setData(current => current ? recordMockSummary(current, summary) : current); return; }
    // Na conta real o backend ainda não oferece histórico; os resumos ficam em memória.
    setData(current => current ? {
      ...current,
      history: [summary, ...current.history],
      workout: { ...current.workout, exercises: current.workout.exercises.map((exercise, index) => ({
        ...exercise, completed: summary.exercises[index]?.completed ?? exercise.completed,
      })) },
    } : current);
  }
  return { data, isDemo, loading, error, storageError, ready: ready && localReady, session, refresh, enterDemo, leaveDemo, logout, registerLocal, createWorkout, updateDemoProfile, practice, keepSummary, filters, setFilters };
}

const DashboardContext = createContext<ReturnType<typeof useDashboardState> | null>(null);
export function DashboardProvider({ children, data }: PropsWithChildren<{ data?: DashboardData | null }>) {
  const state = useDashboardState(data);
  return <DashboardContext.Provider value={state}>{children}</DashboardContext.Provider>;
}
export function useDashboard() {
  const value = useContext(DashboardContext);
  if (!value) throw new Error('O painel precisa estar dentro de DashboardProvider.');
  return value;
}
