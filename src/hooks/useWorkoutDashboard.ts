import { useDashboard } from './use-dashboard';

// Compartilha a consulta do painel, sem disparar outra requisição para o mesmo treino.
export function useWorkoutDashboard() {
  const { data, loading, error, refresh } = useDashboard();
  return { workout: data?.workout ?? null, isLoading: loading, error: error || null, refreshWorkout: refresh };
}
