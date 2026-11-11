import React, { createContext, useContext, useState, useEffect, type PropsWithChildren } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createDemoDashboard } from '@/data/demo-dashboard';
import type { DashboardData } from '@/utils/dashboard';
import { fetchDailyWorkout } from '@/services/api';

const demoData = createDemoDashboard();
const DashboardContext = createContext<DashboardData | null>(demoData);

export function DashboardProvider({ children, data: initialData }: PropsWithChildren<{ data?: DashboardData | null }>) {
  const [data, setData] = useState<DashboardData | null>(initialData || demoData);

  useEffect(() => {
    async function loadBackendData() {
      try {
        // Busca o nome salvo no login (vindo da query findByEmail)
        const savedName = await AsyncStorage.getItem('@userName');
        //const savedName = "Ana Souza";
        
        // Busca o treino real da API
        const realWorkout = await fetchDailyWorkout();
        
        setData(prev => {
          const base = prev || demoData;
          return {
            ...base,
            profile: {
              ...base.profile,
              fullName: savedName || base.profile.fullName, // Atualiza com o nome do banco se houver
            },
            workout: realWorkout || base.workout,
          };
        });
      } catch (error) {
        console.error('Erro ao carregar dados do backend no dashboard:', error);
      }
    }

    loadBackendData();
  }, []);

  return (
    <DashboardContext.Provider value={data}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  return { data: useContext(DashboardContext) };
}