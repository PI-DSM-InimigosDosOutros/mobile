import { test } from 'node:test';
import assert from 'node:assert/strict';
import { accentColors, birthDateToISO, initialRegistration, passwordRequirements, toRegistrationPayload, validateRegistrationStep } from '../src/utils/registration.ts';
import { registerUser } from '../src/services/registration.ts';

const validDraft = () => ({
  ...initialRegistration, fullName: '  Pessoa   Teste  ', birthDate: '29/02/2000', gender: 'Prefiro não informar',
  email: ' teste@example.com ', height: '170,5', weight: '70.2', categories: ['Yoga'], goal: '  Melhorar condicionamento  ',
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

function configureEndpoint(t, value) {
  const previous = process.env.EXPO_PUBLIC_REGISTER_URL;
  if (value) process.env.EXPO_PUBLIC_REGISTER_URL = value;
  else delete process.env.EXPO_PUBLIC_REGISTER_URL;
  t.after(() => {
    if (previous === undefined) delete process.env.EXPO_PUBLIC_REGISTER_URL;
    else process.env.EXPO_PUBLIC_REGISTER_URL = previous;
  });
}

test('sem endpoint, nenhum pedido é enviado e não há sucesso simulado', async t => {
  configureEndpoint(t);
  const fetch = t.mock.method(globalThis, 'fetch', () => { throw new Error('Não deve ser chamado'); });
  await assert.rejects(registerUser(toRegistrationPayload(validDraft())), /não foi configurada/);
  assert.equal(fetch.mock.callCount(), 0);
});

test('serviço envia JSON e só confirma criação com HTTP 201', async t => {
  configureEndpoint(t, 'https://example.invalid/register');
  const payload = toRegistrationPayload(validDraft());
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, 'https://example.invalid/register');
    assert.equal(options.method, 'POST');
    assert.deepEqual(JSON.parse(options.body), payload);
    return new Response(null, { status: 201 });
  });
  await registerUser(payload);
});

test('conflito, validação e falha do servidor retornam erro', async t => {
  configureEndpoint(t, 'https://example.invalid/register');
  for (const status of [200, 400, 409, 422, 500]) {
    const mock = t.mock.method(globalThis, 'fetch', async () => new Response(null, { status }));
    await assert.rejects(registerUser(toRegistrationPayload(validDraft())), error => error.status === status);
    mock.mock.restore();
  }
});

test('falha de rede permite nova tentativa e timeout não confirma conta', async t => {
  configureEndpoint(t, 'https://example.invalid/register');
  const mock = t.mock.method(globalThis, 'fetch', async () => { throw new Error('Offline'); });
  await assert.rejects(registerUser(toRegistrationPayload(validDraft())), /conectar ao servidor/);
  mock.mock.restore();
  t.mock.timers.enable({ apis: ['setTimeout'] });
  t.mock.method(globalThis, 'fetch', (_url, options) => new Promise((_, reject) => {
    options.signal.addEventListener('abort', () => reject(new Error('Timeout')));
  }));
  const pending = registerUser(toRegistrationPayload(validDraft()));
  const check = assert.rejects(pending, /demorou para responder/);
  t.mock.timers.tick(15000);
  await check;
});

test('cancelamento da tela aborta o pedido', async t => {
  configureEndpoint(t, 'https://example.invalid/register');
  t.mock.method(globalThis, 'fetch', (_url, options) => new Promise((_, reject) => {
    options.signal.addEventListener('abort', () => reject(new Error('Cancelado')));
  }));
  const controller = new AbortController();
  const pending = registerUser(toRegistrationPayload(validDraft()), controller.signal);
  const check = assert.rejects(pending, /Cancelado/);
  controller.abort();
  await check;
});
