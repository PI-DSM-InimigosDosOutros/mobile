import { readSession, isAuthSession } from './session';
import { adaptBackendWorkout, type BackendWorkoutResponse } from './workoutAdapter';
import type { RegistrationPayload, RegistrationProfile } from '@/utils/registration';
import type { ServerSession, WorkoutSession, WeekActivity } from '@/utils/dashboard';
import { adaptFinishedWorkout } from './historyAdapter';
import { adaptUserProfile, type BackendUserProfile } from './userAdapter';

export const isMockMode = process.env.EXPO_PUBLIC_DATA_MODE !== 'api';

export class ApiError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export function apiUrl(path: string) {
  const configured = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, '');
  if (!configured) throw new ApiError('Configure o endereço do servidor para conectar sua conta.');
  const base = configured.endsWith('/api') ? configured : `${configured}/api`;
  return `${base}/${path.replace(/^\/+/, '')}`;
}

async function request<T>(path: string, body?: object, authenticated = false, method?: 'PUT'): Promise<T> {
  if (isMockMode) throw new ApiError('Esta ação não está disponível no momento. Você pode continuar acessando seus treinos.');
  const url = apiUrl(path);
  const session = authenticated ? await readSession() : null;
  if (authenticated && !session) throw new ApiError('Entre na sua conta para continuar.', 401);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(url, {
      method: method || (body ? 'POST' : 'GET'),
      headers: {
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: controller.signal,
    });
    const json = await response.json().catch(() => null);
    if (!response.ok) {
      if (response.status === 401) throw new ApiError(authenticated ? 'Sua sessão expirou. Entre novamente.' : 'E-mail ou senha inválidos.', 401);
      if (response.status === 404) throw new ApiError(path === 'wod' || path.startsWith('workout/')
        ? 'Não há treino disponível para hoje.' : 'Esta operação não foi encontrada no servidor.', 404);
      if ([400, 409, 422, 429].includes(response.status) && typeof json?.error === 'string') throw new ApiError(json.error, response.status);
      throw new ApiError(response.status >= 500 ? 'O servidor não conseguiu concluir a ação. Tente novamente.' : 'Revise os dados informados e tente novamente.', response.status);
    }
    if (!json || json.success !== true) throw new ApiError('O servidor retornou uma resposta inesperada.');
    return json.data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(controller.signal.aborted ? 'O servidor demorou para responder. Tente novamente.' : 'Não foi possível conectar. Confira sua conexão e o endereço do servidor.');
  } finally { clearTimeout(timeout); }
}

export async function login(email: string, password: string) {
  const result = await request<unknown>('auth/login', { email: email.trim(), password });
  if (!isAuthSession(result)) throw new ApiError('A resposta de login está incompleta.');
  return result;
}
export async function recoverPassword(email: string) {
  await request('user/forgot-password', { email: email.trim() });
}
export async function resetPassword(token: string, newPassword: string) {
  await request('user/reset-password', { token, newPassword });
}
export async function fetchDailyWorkout() {
  return adaptBackendWorkout(await request<BackendWorkoutResponse>('wod', undefined, true));
}
export async function startWorkoutSession(dailyWorkoutId: string) {
  return request<{ dailyWorkoutId: number; session: ServerSession }>('workout/start', { dailyWorkoutId: Number(dailyWorkoutId) }, true);
}
export async function advanceWorkoutProgress(sessionId: string, exerciseOrder: number, durationSeconds: number) {
  return request<{ isFinished: boolean; nextExercise: { exerciseOrder: number } | null; session: ServerSession }>('workout/progress', { sessionId, exerciseOrder, durationSeconds }, true);
}
export async function endWorkoutSession(sessionId: string, interruptedExercise?: { exerciseOrder: number; durationSeconds: number }) {
  return adaptFinishedWorkout(await request<WorkoutSession>('workout/finish', { sessionId, interruptedExercise }, true));
}
export async function registerAccount(payload: RegistrationPayload) {
  const result = await request<unknown>('user/register', payload);
  if (!isAuthSession(result)) throw new ApiError('A resposta de cadastro está incompleta.');
  return result;
}
export const fetchProfile = async () => adaptUserProfile(await request<BackendUserProfile>('user/profile', undefined, true));
export const saveProfile = async (profile: Partial<RegistrationProfile>) => adaptUserProfile(await request<BackendUserProfile>('user/profile', profile, true, 'PUT'));
export const changePassword = (currentPassword: string, newPassword: string) => request('user/change-password', { currentPassword, newPassword }, true);
export async function fetchHistory() {
  const rows = await request<WorkoutSession[]>('workout/history', undefined, true);
  if (!Array.isArray(rows)) throw new ApiError('O histórico retornado está incompleto.');
  return rows.map(adaptFinishedWorkout);
}
export const fetchMetrics = () => request<{ currentStreak: number; week: WeekActivity[] }>('workout/metrics', undefined, true);
export async function createServerWorkout() { return adaptBackendWorkout(await request<BackendWorkoutResponse>('workout/create', {}, true)); }
