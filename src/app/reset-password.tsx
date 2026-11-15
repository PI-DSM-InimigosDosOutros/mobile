import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { ActionButton } from '@/components/action-button';
import { FormField } from '@/components/form-field';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { resetPassword } from '@/services/api';
import { passwordRequirements } from '@/utils/registration';

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const busy = useRef(false);

  async function submit() {
    if (busy.current) return;
    if (typeof token !== 'string' || !token) { setMessage('O link está incompleto. Solicite uma nova recuperação.'); return; }
    if (passwordRequirements(password).some(rule => !rule.met)) { setMessage('A senha precisa atender aos requisitos abaixo.'); return; }
    if (password !== confirmation) { setMessage('As senhas precisam ser iguais.'); return; }
    busy.current = true;
    setPending(true);
    setMessage('');
    try {
      await resetPassword(token, password);
      setPassword('');
      setConfirmation('');
      setDone(true);
      setMessage('Senha redefinida. Você já pode entrar na sua conta.');
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : 'Não foi possível redefinir a senha.'); }
    finally { busy.current = false; setPending(false); }
  }

  return <Screen code="user:reset">
    <ThemedText type="title">Um novo acesso</ThemedText>
    <ThemedText>Escolha sua nova senha para continuar sua jornada.</ThemedText>
    {!done && <>
      <FormField label="Nova senha" password editable value={password} onChangeText={setPassword} autoComplete="new-password" />
      <FormField label="Confirmar nova senha" password editable value={confirmation} onChangeText={setConfirmation} autoComplete="new-password" />
      {passwordRequirements(password).map(rule => <ThemedText key={rule.label} type="technical" accent={rule.met}>{rule.met ? '✓' : '○'} {rule.label}</ThemedText>)}
      <ActionButton title="Redefinir senha" loading={pending} onPress={submit} />
    </>}
    {Boolean(message) && <ThemedText accessibilityRole="alert">{message}</ThemedText>}
    <ActionButton title="Voltar ao login" outlined onPress={() => router.dismissTo('/')} />
  </Screen>;
}

