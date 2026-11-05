import { createContext, useContext, type PropsWithChildren } from 'react';
import { createDemoDashboard } from '@/data/demo-dashboard';
import type { DashboardData } from '@/utils/dashboard';

const previewData = createDemoDashboard();
const DashboardContext = createContext<DashboardData | null>(null);

// Recebe os dados a exibir; a obtenção e atualização pela API serão implementadas depois.
export function DashboardProvider({ children, data = previewData }: PropsWithChildren<{ data?: DashboardData | null }>) {
  return (
    <DashboardContext.Provider value={data}>{children}</DashboardContext.Provider>
  );
}

export function useDashboard() {
  return { data: useContext(DashboardContext) };
}
