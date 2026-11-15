import { useCallback, useEffect, useRef, useState } from 'react';
import { advanceWorkoutProgress, endWorkoutSession, startWorkoutSession } from '@/services/api';
import type { DailyWorkout, WorkoutSession } from '@/utils/dashboard';

export type Practice = {
  workoutId: string;
  index: number;
  durations: number[];
  completed: boolean[];
  runningSince: number | null;
};
export function useWorkoutPractice(workout: DailyWorkout | undefined, demo: boolean) {
  const [practice, setPractice] = useState<Practice | null>(null);
  const [summary, setSummary] = useState<WorkoutSession | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const busy = useRef(false);
  const generation = useRef(0);

  const reset = useCallback(() => {
    generation.current++;
    setPractice(null);
    setSummary(null);
    setError('');
    setPending(false);
    busy.current = false;
  }, []);

  const restore = useCallback((saved: Practice | null, workout: DailyWorkout, savedAt: number) => {
    if (!saved || saved.workoutId !== workout.id || saved.durations.length !== workout.exercises.length
      || saved.completed.length !== workout.exercises.length || saved.index < 0 || saved.index >= workout.exercises.length) return;
    // Ao reabrir, retoma pausado sem contar o tempo em que o aplicativo estava fechado.
    const durations = [...saved.durations];
    if (saved.runningSince !== null) durations[saved.index] += Math.max(0, (savedAt - saved.runningSince) / 1000);
    setPractice({ ...saved, durations, runningSince: null });
  }, []);

  useEffect(() => {
    if (!practice?.runningSince) return;
    const interval = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(interval);
  }, [practice?.runningSince]);

  function measured(current: Practice) {
    const durations = [...current.durations];
    if (current.runningSince !== null) durations[current.index] += Math.max(0, (Date.now() - current.runningSince) / 1000);
    return durations;
  }

  async function begin() {
    if (busy.current || !workout?.exercises.length) return false;
    busy.current = true;
    setPending(true);
    setError('');
    const version = generation.current;
    try {
      const next = workout.exercises.findIndex(item => !item.completed);
      if (next < 0) throw new Error('Todos os exercícios deste treino já estão concluídos.');
      if (!demo) {
        const result = await startWorkoutSession();
        if (String(result.dailyWorkoutId) !== workout.id) throw new Error('O treino mudou no servidor. Atualize o treino antes de iniciar.');
      }
      if (version !== generation.current) return false;
      setNow(Date.now());
      setSummary(null);
      setPractice({ workoutId: workout.id, index: next, durations: workout.exercises.map(() => 0),
        completed: workout.exercises.map(item => Boolean(item.completed)), runningSince: Date.now() });
      return true;
    } catch (cause) {
      if (version === generation.current) setError(cause instanceof Error ? cause.message : 'Não foi possível iniciar.');
      return false;
    } finally {
      if (version === generation.current) { busy.current = false; setPending(false); }
    }
  }

  function pause() {
    if (!practice || busy.current) return;
    setPractice({ ...practice, durations: measured(practice), runningSince: null });
    setNow(Date.now());
  }
  function resume() {
    if (!practice || busy.current || practice.runningSince !== null) return;
    setPractice({ ...practice, runningSince: Date.now() });
    setNow(Date.now());
  }

  async function advance() {
    if (!practice || !workout || busy.current) return false;
    busy.current = true;
    setPending(true);
    setError('');
    const version = generation.current;
    const durations = measured(practice);
    setPractice({ ...practice, durations, runningSince: null });
    try {
      const result = demo ? null : await advanceWorkoutProgress();
      if (version !== generation.current) return false;
      const completed = [...practice.completed];
      completed[practice.index] = true;
      let next = completed.findIndex(value => !value);
      if (result) {
        if (result.isFinished) next = -1;
        else {
          next = workout.exercises.findIndex(item => item.order === result.nextExercise?.exerciseOrder);
          if (next < 0) throw new Error('O próximo exercício retornado não está neste treino. Atualize o treino antes de continuar.');
        }
      }
      setPractice({ ...practice, durations, completed, index: next < 0 ? practice.index : next, runningSince: next < 0 ? null : Date.now() });
      setNow(Date.now());
      return next < 0;
    } catch (cause) {
      if (version === generation.current) setError((cause instanceof Error ? cause.message : 'Não foi possível avançar.') + ' Confira o treino no servidor antes de repetir a conclusão.');
      return false;
    } finally {
      if (version === generation.current) { busy.current = false; setPending(false); }
    }
  }

  async function finish() {
    if (!practice || !workout || busy.current) return null;
    busy.current = true;
    setPending(true);
    setError('');
    const version = generation.current;
    const durations = measured(practice);
    setPractice({ ...practice, durations, runningSince: null });
    try {
      if (!demo) await endWorkoutSession();
      if (version !== generation.current) return null;
      const result: WorkoutSession = {
        id: `local-${Date.now()}`, title: workout.title, date: workout.date,
        status: practice.completed.every(Boolean) ? 'completed' : 'ended',
        durationSeconds: durations.reduce((total, value) => total + value, 0),
        exercises: workout.exercises.map((item, index) => ({ name: item.name, durationSeconds: durations[index], completed: practice.completed[index] })),
      };
      setSummary(result);
      setPractice(null);
      return result;
    } catch (cause) {
      if (version === generation.current) setError(cause instanceof Error ? cause.message : 'Não foi possível finalizar. A sessão permanece pausada.');
      return null;
    } finally {
      if (version === generation.current) { busy.current = false; setPending(false); }
    }
  }

  const elapsed = practice ? (practice.durations[practice.index] || 0)
    + (practice.runningSince === null ? 0 : Math.max(0, Math.floor((now - practice.runningSince) / 1000))) : 0;
  return { practice, summary, pending, error, elapsed, checkpoint: Math.floor(now / 2000), begin, pause, resume, advance, finish, reset, restore };
}

