import type { RegistrationProfile } from '@/utils/registration';

export interface BackendUserProfile {
  firstName: string;
  lastName: string;
  email: string;
  birthDate?: string;
  gender?: string;
  heightCm?: number;
  weightKg?: number;
  activityLevel?: string;
  medicalNotes?: string | null;
  goal?: string;
  availableMinutesPerDay?: number;
}

export function adaptUserProfile(backendUser: BackendUserProfile, fallbackProfile: RegistrationProfile): RegistrationProfile {
  return {
    ...fallbackProfile,
    fullName: `${backendUser.firstName} ${backendUser.lastName}`.trim(),
    email: backendUser.email,
    birthDate: backendUser.birthDate || fallbackProfile.birthDate,
    gender: backendUser.gender || fallbackProfile.gender,
    heightCm: backendUser.heightCm || fallbackProfile.heightCm,
    weightKg: backendUser.weightKg || fallbackProfile.weightKg,
    activityLevel: backendUser.activityLevel || fallbackProfile.activityLevel,
    medicalNotes: backendUser.medicalNotes !== undefined ? backendUser.medicalNotes : fallbackProfile.medicalNotes,
    goal: backendUser.goal || fallbackProfile.goal,
    availableMinutesPerDay: backendUser.availableMinutesPerDay || fallbackProfile.availableMinutesPerDay,
  };
}