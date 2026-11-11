import type { RegistrationPayload } from '@/utils/registration';

export class RegistrationError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'RegistrationError';
    this.status = status;
  }
}

// O endpoint completo será configurado quando o contrato com a API estiver definido.
export async function registerUser(payload: RegistrationPayload, signal?: AbortSignal): Promise<void> {
  const endpoint = process.env.EXPO_PUBLIC_REGISTER_URL;
  if (!endpoint) throw new RegistrationError('A integração de cadastro ainda não foi configurada. Seus dados não foram enviados e continuam nesta tela.');

  const controller = new AbortController();
  const cancel = () => controller.abort();
  signal?.addEventListener('abort', cancel);
  if (signal?.aborted) controller.abort();
  let timedOut = false;
  const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, 15000);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (response.status === 201) return;
    if (response.status === 409) throw new RegistrationError('Este e-mail já está cadastrado. Use outro e-mail ou volte ao login.', 409);
    if (response.status === 400 || response.status === 422) throw new RegistrationError('O servidor não aceitou os dados. Revise as informações e tente novamente.', response.status);
    throw new RegistrationError('Não foi possível confirmar a criação da conta. Tente novamente mais tarde.', response.status);
  } catch (error) {
    if (signal?.aborted) throw error;
    if (error instanceof RegistrationError) throw error;
    throw new RegistrationError(timedOut
      ? 'O servidor demorou para responder. A criação da conta não foi confirmada. Seus dados continuam nesta tela.'
      : 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', cancel);
  }
}
