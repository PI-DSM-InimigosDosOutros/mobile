import type { RegistrationProfile } from './registration';

export type Exercise = {
  id: string;
  name: string;
  category: string;
  muscles: string[];
  estimatedSeconds: number;
  description: string;
  gifUrl: string | null;
};
export type DailyWorkout = { id: string; title: string; date: string; exercises: Exercise[] };
export type WorkoutSession = {
  id: string;
  date: string;
  title: string;
  status: 'completed' | 'ended';
  durationSeconds: number;
  exercises: { name: string; durationSeconds: number; completed: boolean }[];
};
export type WeekActivity = { date: string; status: 'completed' | 'ended' | 'scheduled' | 'rest' };
export type DashboardData = {
  profile: RegistrationProfile;
  workout: DailyWorkout;
  history: WorkoutSession[];
  currentStreak: number;
  week: WeekActivity[];
};

export function formatDate(date: string) {
  return date.split('-').reverse().join('/');
}

export function formatDuration(seconds: number) {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor(total / 60) % 60;
  const rest = total % 60;
  return `${hours ? String(hours).padStart(2, '0') + ':' : ''}${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}

export function historySummary(sessions: WorkoutSession[]) {
  return {
    completed: sessions.filter(session => session.status === 'completed').length,
    ended: sessions.filter(session => session.status === 'ended').length,
    totalSeconds: sessions.reduce((sum, session) => sum + session.durationSeconds, 0),
  };
}

export function filterHistory(sessions: WorkoutSession[], filter: 'all' | 'completed' | 'ended', date: string | null) {
  return sessions.filter(session => (filter === 'all' || session.status === filter) && (!date || session.date === date));
}

export function ageFromBirthDate(birthDate: string, today = new Date()) {
  const [year, month, day] = birthDate.split('-').map(Number);
  const beforeBirthday = today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day);
  return today.getFullYear() - year - (beforeBirthday ? 1 : 0);
}
