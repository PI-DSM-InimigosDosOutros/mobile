import type { RegistrationProfile } from '@/utils/registration';
export type BackendUserProfile = Omit<RegistrationProfile, 'accentColor'> & { accentColor?: string };
export function adaptUserProfile(value: BackendUserProfile): RegistrationProfile {
  if (!value || typeof value.fullName !== 'string' || typeof value.email !== 'string'
    || typeof value.birthDate !== 'string' || typeof value.gender !== 'string'
    || !Array.isArray(value.exerciseCategories) || !Array.isArray(value.availableDays)
    || !Number.isFinite(value.heightCm) || !Number.isFinite(value.weightKg) || !Number.isFinite(value.availableMinutesPerDay)) {
    throw new Error('O servidor retornou um perfil incompleto.');
  }
  return { ...value, accentColor: value.accentColor || '#BAE068' };
}
