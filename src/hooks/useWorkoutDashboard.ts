import { useState, useEffect, useCallback } from 'react';
import { fetchDailyWorkout } from '@/services/api';
import type { DailyWorkout } from '@/utils/dashboard';

export function useWorkoutDashboard() {
  const [workout, setWorkout] = useState<DailyWorkout | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadWorkout = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Busca o treino adaptado do backend
      const data = await fetchDailyWorkout();
      setWorkout(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar o treino.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkout();
  }, [loadWorkout]);

  return {
    workout,
    isLoading,
    error,
    refreshWorkout: loadWorkout,
  };
}