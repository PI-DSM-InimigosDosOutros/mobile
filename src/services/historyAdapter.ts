import type { WorkoutSession } from '@/utils/dashboard';

export interface BackendFinishWorkoutResponse {
  sessionId: string | number;
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
  return {
    id: String(backendData.sessionId),
    date: backendData.date ? backendData.date.split('T')[0] : new Date().toISOString().split('T')[0],
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