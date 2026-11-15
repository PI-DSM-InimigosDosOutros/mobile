import type { DashboardData, DailyWorkout, Exercise, WorkoutSession } from './dashboard';
import type { RegistrationProfile } from './registration';

export const localDate = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

// Catálogo de demonstração para testar a interface. Não é prescrição de exercício.
const catalogue: Exercise[] = [
  { id: 'mock-squat', name: 'Agachamento', category: 'Calistenia', muscles: ['Pernas', 'Glúteos'], estimatedSeconds: 180, description: 'Exercício ilustrativo de membros inferiores.', gifUrl: null },
  { id: 'mock-pushup', name: 'Flexão', category: 'Calistenia', muscles: ['Peitoral', 'Braços'], estimatedSeconds: 240, description: 'Exercício ilustrativo de membros superiores.', gifUrl: null },
  { id: 'mock-plank', name: 'Prancha', category: 'Calistenia', muscles: ['Core'], estimatedSeconds: 180, description: 'Exercício ilustrativo de core.', gifUrl: null },
  ...['Musculação', 'Equilíbrio', 'Cardio', 'Flexibilidade', 'HIIT'].map((category, index) => ({
    id: `mock-category-${index}`, name: category, category, muscles: ['Corpo inteiro'],
    estimatedSeconds: 120, description: 'Material provisório para testar o fluxo desta modalidade.', gifUrl: null,
  })),
];

export function generateMockWorkout(profile: RegistrationProfile, today = new Date()): DailyWorkout {
  let remaining = profile.availableMinutesPerDay * 60;
  const exercises = catalogue.filter(item => profile.exerciseCategories.includes(item.category)).flatMap(item => {
    if (remaining <= 0) return [];
    const estimatedSeconds = Math.min(remaining, item.estimatedSeconds);
    remaining -= estimatedSeconds;
    return [{ ...item, estimatedSeconds, completed: false }];
  });
  if (!exercises.length) throw new Error('Preencha as modalidades e o tempo disponível no perfil antes de criar o treino.');
  return { id: `mock-workout-${Date.now()}`, title: 'Treino do dia', date: localDate(today), exercises };
}

export function mockProgress(data: DashboardData, today = new Date()): DashboardData {
  const dayStatus = (date: Date) => {
    const sessions = data.history.filter(item => item.date === localDate(date));
    if (sessions.some(item => item.status === 'completed')) return 'completed' as const;
    if (sessions.length) return 'ended' as const;
    return data.profile.availableDays.includes(date.getDay() || 7) ? 'scheduled' as const : 'rest' as const;
  };
  let currentStreak = 0;
  const earliest = data.history.map(item => item.date).sort()[0];
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  while (earliest && localDate(cursor) >= earliest) {
    const status = dayStatus(cursor);
    if (status === 'completed') currentStreak++;
    else if (localDate(cursor) !== localDate(today) && data.profile.availableDays.includes(cursor.getDay() || 7)) break;
    cursor.setDate(cursor.getDate() - 1);
  }
  return { ...data, currentStreak, week: Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + index - 6);
    return { date: localDate(date), status: dayStatus(date) };
  }) };
}

export function createLocalDashboard(profile: RegistrationProfile): DashboardData {
  return mockProgress({ profile, workout: { id: '', title: 'Treino do dia', date: localDate(), exercises: [] }, history: [], week: [], currentStreak: 0 });
}

export function recordMockSummary(data: DashboardData, summary: WorkoutSession): DashboardData {
  return mockProgress({ ...data, history: [summary, ...data.history.filter(item => item.id !== summary.id)],
    workout: { ...data.workout, exercises: data.workout.exercises.map((exercise, index) => ({
      ...exercise, completed: summary.exercises[index]?.completed ?? exercise.completed,
    })) } });
}
