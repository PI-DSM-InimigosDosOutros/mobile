import { test } from 'node:test';
import assert from 'node:assert/strict';
import { accentColors, birthDateToISO, initialRegistration, passwordRequirements, toRegistrationPayload, validateRegistrationStep } from '../src/utils/registration.ts';


const validDraft = () => ({
  ...initialRegistration, fullName: '  Pessoa   Teste  ', birthDate: '29/02/2000', gender: 'Prefiro não informar',
  email: ' teste@example.com ', height: '170,5', weight: '70.2', categories: ['Flexibilidade'], goal: '  Melhorar condicionamento  ',
  hours: '1', minutes: '15', days: [7, 1], password: 'Teste123!', confirmPassword: 'Teste123!',
});

test('cadastro válido normaliza unidades e datas sem enviar confirmação de senha', () => {
  const draft = validDraft();
  for (let step = 0; step < 5; step++) assert.deepEqual(validateRegistrationStep(draft, step), {});
  const payload = toRegistrationPayload(draft);
  assert.equal(payload.fullName, 'Pessoa Teste');
  assert.equal(payload.email, 'teste@example.com');
  assert.equal(payload.birthDate, '2000-02-29');
  assert.equal(payload.heightCm, 170.5);
  assert.equal(payload.weightKg, 70.2);
  assert.equal(payload.availableMinutesPerDay, 75);
  assert.deepEqual(payload.availableDays, [1, 7]);
  assert.equal(payload.medicalNotes, null);
  assert.equal(payload.goal, 'Melhorar condicionamento');
  assert.ok(!('confirmPassword' in payload));
});

test('datas impossíveis, incompletas e futuras não são aceitas', () => {
  for (const date of ['29/02/2001', '31/04/2000', '01/13/2000', '1/1/2000', '01/01/0000', '01/01/2100']) {
    assert.equal(birthDateToISO(date, new Date(2026, 10, 4)), null);
  }
  assert.equal(birthDateToISO('29/02/2000'), '2000-02-29');
});

test('etapas exigem dados essenciais, medidas finitas, modalidades e disponibilidade válida', () => {
  assert.ok(validateRegistrationStep(initialRegistration, 0).fullName);
  assert.ok(validateRegistrationStep({ ...validDraft(), weight: '-5', height: '9'.repeat(400) }, 1).height);
  assert.ok(validateRegistrationStep({ ...validDraft(), weight: '-5' }, 1).weight);
  assert.ok(validateRegistrationStep({ ...validDraft(), categories: [], goal: ' ' }, 2).categories);
  for (const fields of [{ hours: '', minutes: '' }, { hours: '24', minutes: '1' }, { hours: '0', minutes: '60' }, { hours: '-1', minutes: '0' }]) {
    assert.ok(Object.keys(validateRegistrationStep({ ...validDraft(), ...fields }, 3)).length);
  }
  assert.ok(validateRegistrationStep({ ...validDraft(), days: [] }, 3).days);
  assert.throws(() => toRegistrationPayload(initialRegistration));
});

test('senha segue os quatro requisitos do protótipo e exige confirmação', () => {
  for (const password of ['Curta1!', 'somente123!', 'SemNumero!', 'SemSimbolo123', 'MuitoLonga123456789!']) {
    assert.ok(passwordRequirements(password).some(rule => !rule.met));
  }
  assert.ok(passwordRequirements('ABCDEFG1!').every(rule => rule.met));
  assert.ok(validateRegistrationStep({ ...validDraft(), confirmPassword: 'outra' }, 4).confirmPassword);
});

test('cores de destaque mantêm contraste para texto grafite', () => {
  const luminance = hex => {
    const values = hex.match(/[a-f\d]{2}/gi).map(value => parseInt(value, 16) / 255)
      .map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
  };
  for (const color of accentColors) assert.ok((luminance(color.value) + 0.05) / (luminance('#20212B') + 0.05) >= 4.5);
});
