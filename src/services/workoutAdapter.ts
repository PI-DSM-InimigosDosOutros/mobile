import type { DailyWorkout, Exercise } from '@/utils/dashboard';

export interface BackendExercise {
  exerciseOrder: number;
  durationEstimate: number; // em minutos
  completed: number;
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
  const exercises: Exercise[] = backendData.exercises.map((item) => ({
    id: `exercise-${item.exerciseOrder}`,
    name: item.workoutName,
    category: item.categoryName,
    muscles: [item.muscleGroup], // O front-end espera um array de strings para os músculos
    estimatedSeconds: item.durationEstimate * 60, // Convertendo os minutos do back para segundos do front
    description: `Exercício de ${item.categoryName} focado em ${item.muscleGroup}.`, // Preenchendo o campo exigido pelo front
    gifUrl: item.gifUrl,
  }));

  return {
    id: String(backendData.dailyWorkoutId),
    title: exercises.length > 0 ? exercises[0].category : 'Treino do Dia',
    date: backendData.date ? backendData.date.split('T')[0] : new Date().toISOString().split('T')[0],
    exercises: exercises,
  };
}