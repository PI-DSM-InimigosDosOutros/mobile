import type { DailyWorkout, Exercise } from '@/utils/dashboard';

export interface BackendExercise {
  exerciseOrder: number;
  durationEstimate: number; // em minutos
  completed: number | boolean;
  workoutName: string;
  muscleGroup: string;
  gifUrl: string | null;
  categoryName: string;
}

export interface BackendWorkoutResponse {
  dailyWorkoutId: number;
  date: string;
  totalDurationMinutes: number;
  exercises: BackendExercise[];
}

export function adaptBackendWorkout(backendData: BackendWorkoutResponse): DailyWorkout {
  if (!backendData || !backendData.dailyWorkoutId || !Array.isArray(backendData.exercises)) {
    throw new Error('O servidor retornou um treino incompleto.');
  }
  if (typeof backendData.date !== 'string' || !/^\d{4}-\d{2}-\d{2}(T|$)/.test(backendData.date)) {
    throw new Error('O servidor retornou um treino sem data válida.');
  }
  const orders = new Set<number>();
  for (const item of backendData.exercises) {
    if (!item || !Number.isInteger(item.exerciseOrder) || item.exerciseOrder < 1 || orders.has(item.exerciseOrder)
      || !Number.isFinite(item.durationEstimate) || item.durationEstimate < 0
      || typeof item.workoutName !== 'string' || !item.workoutName.trim()
      || typeof item.categoryName !== 'string' || typeof item.muscleGroup !== 'string'
      || ![true, false, 0, 1].includes(item.completed)) {
      throw new Error('O servidor retornou dados incompletos de um exercício.');
    }
    orders.add(item.exerciseOrder);
  }
  const exercises: Exercise[] = [...backendData.exercises].sort((a, b) => a.exerciseOrder - b.exerciseOrder).map((item) => ({
    id: `exercise-${item.exerciseOrder}`,
    name: item.workoutName,
    category: item.categoryName,
    muscles: [item.muscleGroup],
    estimatedSeconds: item.durationEstimate * 60,
    description: `Exercício de ${item.categoryName} focado em ${item.muscleGroup}.`,
    gifUrl: item.gifUrl,
    completed: item.completed === 1 || item.completed === true,
    order: item.exerciseOrder,
  }));

  return {
    id: String(backendData.dailyWorkoutId),
    title: exercises.length > 0 ? exercises[0].category : 'Treino do Dia',
    date: backendData.date.split('T')[0],
    exercises: exercises,
  };
}
