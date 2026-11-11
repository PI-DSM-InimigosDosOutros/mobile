import AsyncStorage from '@react-native-async-storage/async-storage';
import { adaptBackendWorkout, BackendWorkoutResponse } from './workoutAdapter';
import { adaptFinishedWorkout, BackendFinishWorkoutResponse } from './historyAdapter';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

async function getAuthHeaders() {
  // TOKEN MOCKADO PROVISÓRIO (Forçado diretamente no código para testes no App e Web)
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhbmEuc291emFAZW1haWwuY29tIiwibmFtZSI6IkFuYSBTb3V6YSIsImlhdCI6MTc5NDQxMTkzMCwiZXhwIjoxNzk0NDE1NTMwfQ.oX3LzrPHD5jzhjiv7cc89jqVMxq55eyaqL7HoiH98CE";

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse(response: Response) {
  if (response.status === 401) {
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  if (!response.ok) {
    throw new Error(`Erro na requisição: ${response.status}`);
  }

  return response.json();
}

// --- AS 4 APIs DO SEU ESCOPO ---

// 1. Buscar o treino do dia
export async function fetchDailyWorkout() {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/wod`, {
    method: 'GET',
    headers,
  });

  const json = await handleResponse(response);
  return adaptBackendWorkout(json.data as BackendWorkoutResponse);
}

// 2. Iniciar a sessão de treino
export async function startWorkoutSession(dailyWorkoutId: number | string) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/workout/start`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ dailyWorkoutId }),
  });

  const json = await handleResponse(response);
  return json.data;
}

// 3. Avançar o progresso do treino
export async function advanceWorkoutProgress(sessionId: string, exerciseOrder: number) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/workout/progress`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ sessionId, exerciseOrder }),
  });

  return handleResponse(response);
}

// 4. Encerrar a sessão de treino e retornar o resumo adaptado
export async function endWorkoutSession(sessionId: string) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/workout/finish`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ sessionId }),
  });

  const json = await handleResponse(response);
  
  // Retorna a sessão adaptada para preencher a tela de resumo automaticamente
  return adaptFinishedWorkout(json.data as BackendFinishWorkoutResponse);
}