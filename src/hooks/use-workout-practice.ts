import { useCallback, useEffect, useRef, useState } from 'react';
import { advanceWorkoutProgress, endWorkoutSession, startWorkoutSession } from '@/services/api';
import type { DailyWorkout, WorkoutSession, ServerSession } from '@/utils/dashboard';

export type Practice = {
  workoutId: string;
  index: number;
  durations: number[];
  completed: boolean[];
  runningSince: number | null;
  serverSessionId?: string;
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

  const restoreServer = useCallback((saved: ServerSession, workout: DailyWorkout) => {
    if (saved.status !== 'active' || String(saved.dailyWorkoutId) !== workout.id) return;
    const completed = workout.exercises.map((item, index) => Boolean(saved.exercises.find(exercise => exercise.exerciseOrder === (item.order ?? index + 1))?.completed));
    const durations = workout.exercises.map((item, index) => saved.exercises.find(exercise => exercise.exerciseOrder === (item.order ?? index + 1))?.durationSeconds || 0);
    const next = completed.findIndex(value => !value);
    setPractice({ workoutId: workout.id, serverSessionId: String(saved.id), index: next < 0 ? completed.length - 1 : next,
      completed, durations, runningSince: null });
    setError('');
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
      if (next < 0 && demo) throw new Error('Todos os exercícios deste treino já estão concluídos.');
      if (!demo) {
        const result = await startWorkoutSession(workout.id);
        if (String(result.dailyWorkoutId) !== workout.id) throw new Error('O treino mudou no servidor. Atualize o treino antes de iniciar.');
        if (version !== generation.current) return false;
        restoreServer(result.session, workout);
        setPractice(current => current ? { ...current, runningSince: current.completed.every(Boolean) ? null : Date.now() } : current);
        setNow(Date.now());
        return true;
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
      if (!demo && !practice.serverSessionId) throw new Error('Consulte o progresso para recuperar sua sessão.');
      const result = demo ? null : await advanceWorkoutProgress(practice.serverSessionId!, workout.exercises[practice.index].order ?? practice.index + 1, durations[practice.index]);
      if (version !== generation.current) return false;
      const completed = result ? workout.exercises.map((item, position) => Boolean(result.session.exercises.find(exercise => exercise.exerciseOrder === (item.order ?? position + 1))?.completed)) : [...practice.completed];
      if (!result) completed[practice.index] = true;
      const acceptedDurations = result ? workout.exercises.map((item, position) => result.session.exercises.find(exercise => exercise.exerciseOrder === (item.order ?? position + 1))?.durationSeconds || 0) : durations;
      let next = completed.findIndex(value => !value);
      if (result) {
        if (result.isFinished) next = -1;
        else {
          next = workout.exercises.findIndex(item => item.order === result.nextExercise?.exerciseOrder);
          if (next < 0) throw new Error('O próximo exercício retornado não está neste treino. Atualize o treino antes de continuar.');
        }
      }
      setPractice({ ...practice, durations: acceptedDurations, completed, index: next < 0 ? practice.index : next, runningSince: next < 0 ? null : Date.now() });
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
      if (!demo) {
        if (!practice.serverSessionId) throw new Error('Consulte o progresso para recuperar sua sessão.');
        const interrupted = practice.completed[practice.index] ? undefined : {
          exerciseOrder: workout.exercises[practice.index].order ?? practice.index + 1, durationSeconds: durations[practice.index],
        };
        const result = await endWorkoutSession(practice.serverSessionId, interrupted);
        if (version !== generation.current) return null;
        setSummary(result); setPractice(null);
        return result;
      }
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
  return { practice, summary, pending, error, elapsed, checkpoint: Math.floor(now / 2000), begin, pause, resume, advance, finish, reset, restore, restoreServer };
}

