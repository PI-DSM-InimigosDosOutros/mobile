export const exerciseCategories = ['Musculação', 'Aeróbica', 'Calistenia', 'Cardio', 'Yoga', 'Pilates'];
export const genders = ['Feminino', 'Masculino', 'Não binário', 'Prefiro não informar'];
export const activityLevels = ['Nunca pratiquei', 'Já pratiquei, mas parei', 'Pratico ocasionalmente', 'Pratico regularmente', 'Outro'];
export const weekDays = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
export const accentColors = [
  { name: 'Lima', value: '#BAE068' }, { name: 'Menta', value: '#8FE0BB' },
  { name: 'Ciano', value: '#8ADDE8' }, { name: 'Azul', value: '#A8C7FA' },
  { name: 'Lilás', value: '#CDB5F5' }, { name: 'Rosa', value: '#F2B6CF' },
  { name: 'Pêssego', value: '#F4BD96' }, { name: 'Amarelo', value: '#E8DF8B' },
];

export type RegistrationDraft = {
  fullName: string;
  birthDate: string;
  gender: string;
  email: string;
  height: string;
  weight: string;
  activityLevel: string;
  medicalNotes: string;
  categories: string[];
  goal: string;
  hours: string;
  minutes: string;
  days: number[];
  password: string;
  confirmPassword: string;
  accentColor: string;
};
export type RegistrationErrors = Partial<Record<keyof RegistrationDraft, string>>;

export const initialRegistration: RegistrationDraft = {
  fullName: '', birthDate: '', gender: '', email: '', height: '', weight: '',
  activityLevel: '', medicalNotes: '', categories: [], goal: '', hours: '', minutes: '',
  days: [], password: '', confirmPassword: '', accentColor: accentColors[0].value,
};

export function formatBirthDate(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  return digits.replace(/^(\d{2})(\d)/, '$1/$2').replace(/^(\d{2}\/\d{2})(\d)/, '$1/$2');
}

export function birthDateToISO(value: string, today = new Date()): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return null;
  const [, day, month, year] = match.map(Number);
  if (year < 1) return null;
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day || date > end) return null;
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function decimalValue(value: string) {
  return /^\d+(?:[.,]\d+)?$/.test(value.trim()) ? Number(value.trim().replace(',', '.')) : NaN;
}

export function passwordRequirements(password: string) {
  return [
    { label: 'De 8 a 16 caracteres', met: password.length >= 8 && password.length <= 16 },
    { label: 'Um número (0–9)', met: /[0-9]/.test(password) },
    { label: 'Uma letra maiúscula', met: /\p{Lu}/u.test(password) },
    { label: 'Um caractere especial', met: /[^\p{L}\p{N}\s]/u.test(password) },
  ];
}

export function validateRegistrationStep(draft: RegistrationDraft, step: number): RegistrationErrors {
  const errors: RegistrationErrors = {};
  if (step === 0) {
    if (!draft.fullName.trim()) errors.fullName = 'Informe seu nome completo.';
    if (!birthDateToISO(draft.birthDate)) errors.birthDate = 'Informe uma data válida, sem datas futuras.';
    if (!genders.includes(draft.gender)) errors.gender = 'Selecione uma opção de gênero.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) errors.email = 'Informe um e-mail válido.';
  }
  if (step === 1) {
    if (!Number.isFinite(decimalValue(draft.height)) || !(decimalValue(draft.height) > 0)) errors.height = 'Informe uma altura maior que zero, em cm.';
    if (!Number.isFinite(decimalValue(draft.weight)) || !(decimalValue(draft.weight) > 0)) errors.weight = 'Informe um peso maior que zero, em kg.';
    if (draft.activityLevel && !activityLevels.includes(draft.activityLevel)) errors.activityLevel = 'Selecione uma opção válida.';
  }
  if (step === 2) {
    if (!draft.categories.length || draft.categories.some(category => !exerciseCategories.includes(category))) errors.categories = 'Escolha ao menos uma modalidade.';
    if (!draft.goal.trim()) errors.goal = 'Conte qual é seu objetivo com os treinos.';
  }
  if (step === 3) {
    const hours = draft.hours === '' ? 0 : /^\d+$/.test(draft.hours) ? Number(draft.hours) : NaN;
    const minutes = draft.minutes === '' ? 0 : /^\d+$/.test(draft.minutes) ? Number(draft.minutes) : NaN;
    if (!Number.isFinite(hours) || hours > 24) errors.hours = 'Informe horas entre 0 e 24.';
    if (!Number.isFinite(minutes) || minutes > 59) errors.minutes = 'Informe minutos entre 0 e 59.';
    if (!errors.hours && !errors.minutes && (hours * 60 + minutes <= 0 || hours * 60 + minutes > 1440)) errors.minutes = 'Informe um tempo maior que zero e de até 24 horas.';
    if (!draft.days.length || draft.days.some(day => !Number.isInteger(day) || day < 1 || day > 7)) errors.days = 'Selecione ao menos um dia da semana.';
  }
  if (step === 4) {
    if (passwordRequirements(draft.password).some(rule => !rule.met)) errors.password = 'A senha deve atender aos quatro requisitos.';
    if (!draft.confirmPassword || draft.confirmPassword !== draft.password) errors.confirmPassword = 'As senhas precisam ser iguais.';
    if (!accentColors.some(color => color.value === draft.accentColor)) errors.accentColor = 'Selecione uma das cores disponíveis.';
  }
  return errors;
}

export function toProfilePayload(draft: RegistrationDraft) {
  for (let step = 0; step < 4; step++) {
    if (Object.keys(validateRegistrationStep(draft, step)).length) throw new Error('Cadastro inválido. Revise os campos.');
  }
  if (!accentColors.some(color => color.value === draft.accentColor)) throw new Error('Cor de destaque inválida.');
  return {
    fullName: draft.fullName.trim().replace(/\s+/g, ' '),
    birthDate: birthDateToISO(draft.birthDate)!,
    gender: draft.gender,
    email: draft.email.trim(),
    heightCm: decimalValue(draft.height),
    weightKg: decimalValue(draft.weight),
    activityLevel: draft.activityLevel || null,
    medicalNotes: draft.medicalNotes.trim() || null,
    exerciseCategories: [...new Set(draft.categories)],
    goal: draft.goal.trim(),
    availableMinutesPerDay: Number(draft.hours) * 60 + Number(draft.minutes),
    availableDays: [...new Set(draft.days)].sort((a, b) => a - b),
    accentColor: draft.accentColor,
  };
}
export type RegistrationProfile = ReturnType<typeof toProfilePayload>;

export function toRegistrationPayload(draft: RegistrationDraft) {
  if (Object.keys(validateRegistrationStep(draft, 4)).length) throw new Error('Cadastro inválido. Revise os campos.');
  return { ...toProfilePayload(draft), password: draft.password };
}
export type RegistrationPayload = ReturnType<typeof toRegistrationPayload>;

export function profileToDraft(profile: RegistrationProfile): RegistrationDraft {
  return {
    ...initialRegistration,
    fullName: profile.fullName, birthDate: profile.birthDate.split('-').reverse().join('/'),
    gender: profile.gender, email: profile.email,
    height: String(profile.heightCm), weight: String(profile.weightKg),
    activityLevel: profile.activityLevel ?? '', medicalNotes: profile.medicalNotes ?? '',
    categories: [...profile.exerciseCategories], goal: profile.goal,
    hours: String(Math.floor(profile.availableMinutesPerDay / 60)), minutes: String(profile.availableMinutesPerDay % 60),
    days: [...profile.availableDays], accentColor: profile.accentColor,
  };
}
