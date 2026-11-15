import type { DashboardData, Exercise, WorkoutSession } from '@/utils/dashboard';

// Material ilustrativo para revisar a interface. Não é um treino prescrito ao usuário.
export function createDemoDashboard(today = new Date()): DashboardData {
  const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const offset = (days: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + days);
  const availableDays = [1, 3, 5];
  const exercises: Exercise[] = [
    { id: 'demo-squat', name: 'Agachamento', category: 'Calistenia', muscles: ['Pernas', 'Glúteos'], estimatedSeconds: 180, description: 'Exemplo de exercício do catálogo para membros inferiores.', gifUrl: null },
    { id: 'demo-pushup', name: 'Flexão', category: 'Calistenia', muscles: ['Peitoral', 'Braços'], estimatedSeconds: 240, description: 'Exemplo de exercício do catálogo para membros superiores.', gifUrl: null },
    { id: 'demo-plank', name: 'Prancha', category: 'Calistenia', muscles: ['Core'], estimatedSeconds: 180, description: 'Exemplo de exercício do catálogo para a região central do corpo.', gifUrl: null },
    { id: 'demo-mobility', name: 'Mobilidade de ombros', category: 'Calistenia', muscles: ['Ombros'], estimatedSeconds: 120, description: 'Exemplo ilustrativo para visualizar a organização da sequência.', gifUrl: null },
  ];
  const dates: string[] = [];
  for (let day = 1; dates.length < 5; day++) {
    const date = offset(-day);
    if (availableDays.includes(date.getDay() || 7)) dates.push(dateKey(date));
  }
  const history: WorkoutSession[] = dates.map((date, index) => {
    const ended = index === 3;
    const durations = ended ? [180, 240, 0, 0] : [180, 240, 180, 120];
    return {
      id: `demo-session-${index}`, date, title: index % 2 ? 'Superiores e core' : 'Corpo inteiro',
      status: ended ? 'ended' : 'completed', durationSeconds: durations.reduce((sum, value) => sum + value, 0),
      exercises: exercises.map((exercise, position) => ({ name: exercise.name, durationSeconds: durations[position], completed: !ended || position < 2 })),
    };
  });
  return {
    profile: {
      fullName: 'Alex Lima', birthDate: '2000-03-15', gender: 'Prefiro não informar', email: 'alex@example.com',
      heightCm: 170, weightKg: 70, activityLevel: 'Pratico ocasionalmente', medicalNotes: null,
      exerciseCategories: ['Calistenia', 'Flexibilidade'], goal: 'Criar uma rotina de atividade física em casa.',
      availableMinutesPerDay: 20, availableDays, accentColor: '#BAE068',
    },
    workout: { id: 'demo-today', title: 'Corpo inteiro', date: dateKey(today), exercises },
    history, currentStreak: 3,
    week: Array.from({ length: 7 }, (_, index) => {
      const date = offset(index - 6);
      const key = dateKey(date);
      const session = history.find(item => item.date === key);
      return { date: key, status: session?.status ?? (availableDays.includes(date.getDay() || 7) ? 'scheduled' : 'rest') };
    }),
  };
}
