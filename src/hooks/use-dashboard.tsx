import { createContext, useCallback, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { createDemoDashboard } from '@/data/demo-dashboard';
import type { DashboardData, HistoryFilters } from '@/utils/dashboard';
import type { RegistrationProfile } from '@/utils/registration';
import { fetchDailyWorkout } from '@/services/api';
import { useSession } from '@/hooks/use-session';
import { useWorkoutPractice } from '@/hooks/use-workout-practice';

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
  const [loading, setLoading] = useState(Boolean(session));
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<HistoryFilters>({ status: 'all', from: '', to: '' });
  const revision = useRef(0);
  const practice = useWorkoutPractice(data?.workout, isDemo);
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
    setLoading(true);
    setError('');
    await loadWorkout();
  }

  function enterDemo() {
    revision.current++;
    practice.reset();
    setFilters({ status: 'all', from: '', to: '' });
    setData(createDemoDashboard());
    setError('');
    setLoading(false);
    setDemo(true);
  }
  function leaveDemo() {
    revision.current++;
    practice.reset();
    setFilters({ status: 'all', from: '', to: '' });
    setDemo(false);
    setData(null);
  }
  async function logout() {
    await signOut();
    leaveDemo();
  }
  function updateDemoProfile(profile: RegistrationProfile) {
    if (isDemo) setData(current => current ? { ...current, profile } : current);
  }
  function keepSummary(summary: NonNullable<typeof practice.summary>) {
    // Mantém o resumo da prática nesta abertura do app. O backend ainda não oferece histórico.
    setData(current => current ? {
      ...current,
      history: [summary, ...current.history],
      workout: { ...current.workout, exercises: current.workout.exercises.map((exercise, index) => ({
        ...exercise, completed: summary.exercises[index]?.completed ?? exercise.completed,
      })) },
    } : current);
  }
  return { data, isDemo, loading, error, ready, session, refresh, enterDemo, leaveDemo, logout, updateDemoProfile, practice, keepSummary, filters, setFilters };
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
