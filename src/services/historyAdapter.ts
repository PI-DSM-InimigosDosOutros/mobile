import type { WorkoutSession } from '@/utils/dashboard';

export interface BackendFinishWorkoutResponse {
  id: string | number;
  date: string;
  title: string;
  status: 'completed' | 'ended';
  durationSeconds: number;
  exercises: {
    name: string;
    durationSeconds: number;
    completed: boolean;
  }[];
}

export function adaptFinishedWorkout(backendData: BackendFinishWorkoutResponse): WorkoutSession {
  if (!backendData?.id || !['completed', 'ended'].includes(backendData.status) || !Array.isArray(backendData.exercises)
    || typeof backendData.durationSeconds !== 'number' || !Number.isFinite(backendData.durationSeconds)
    || !/^\d{4}-\d{2}-\d{2}$/.test(backendData.date)) throw new Error('O servidor retornou um resumo incompleto.');
  return {
    id: String(backendData.id),
    date: backendData.date,
    title: backendData.title || 'Treino Concluído',
    status: backendData.status || 'completed',
    durationSeconds: backendData.durationSeconds || 0,
    exercises: (backendData.exercises || []).map(ex => ({
      name: ex.name,
      durationSeconds: ex.durationSeconds || 0,
      completed: Boolean(ex.completed),
    })),
  };
}
