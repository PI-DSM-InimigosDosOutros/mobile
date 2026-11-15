import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { ActionButton } from '@/components/action-button';
import { Artwork } from '@/components/artwork';
import { AvailabilityStep, PersonalStep, PhysicalStep, PreferencesStep, SecurityStep } from '@/components/registration-steps';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { initialRegistration, toProfilePayload, toRegistrationPayload, validateRegistrationStep, type RegistrationErrors } from '@/utils/registration';
import { useRef, useState } from 'react';
import { useRegistration } from '@/hooks/use-registration';
import { useDashboard } from '@/hooks/use-dashboard';
import { registerAccount, useMockRegistration } from '@/services/api';
import { useSession } from '@/hooks/use-session';

const steps = [PersonalStep, PhysicalStep, PreferencesStep, AvailabilityStep, SecurityStep];

export default function RegisterScreen() {
  const theme = useTheme();
  const { draft, setDraft, ready, storageError } = useRegistration();
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  const busy = useRef(false);
  const dashboard = useDashboard();
  const { signIn } = useSession();
  const { etapa } = useLocalSearchParams<{ etapa?: string }>();
  const number = Number(etapa);
  const step = Number.isInteger(number) && number >= 1 && number <= 5 ? number - 1 : 0;
  const CurrentStep = steps[step];
  const progress = [0, 25, 50, 75, 99][step];

  function navigateToStep(next: number) {
    setMessage('');
    setErrors({});
    router.replace({ pathname: '/cadastro', params: { etapa: String(next + 1) } });
  }

  async function advance() {
    if (busy.current) return;
    const current = { ...draft, accentColor: theme.accent };
    const validation = validateRegistrationStep(current, step);
    setErrors(validation);
    if (Object.keys(validation).length) { setMessage('Revise os campos indicados.'); return; }
    if (step < 4) navigateToStep(step + 1);
    else {
      const invalidStep = [0, 1, 2, 3].find(index => Object.keys(validateRegistrationStep(current, index)).length > 0);
      if (invalidStep !== undefined) { navigateToStep(invalidStep); return; }
      busy.current = true; setPending(true);
      try {
        if (useMockRegistration) await dashboard.registerLocal(toProfilePayload(current));
        else {
          const session = await registerAccount(toRegistrationPayload(current));
          await dashboard.leaveDemo();
          await signIn(session);
        }
        setDraft(initialRegistration);
        router.replace('/(preview)/treino');
      } catch (error) { setMessage(error instanceof Error ? error.message : 'Não foi possível concluir seu cadastro. Tente novamente.'); }
      finally { busy.current = false; setPending(false); }
    }
  }

  if (!ready) return <Screen code="user:register"><ThemedText>Recuperando seu rascunho...</ThemedText></Screen>;

  return (
    <Screen key={step} code="user:register" registrationStep={step}>
      <View style={styles.hero}>
        <Artwork name="chevrons" width={36} height={step === 0 ? 192 : 132} />
        <View style={styles.heroContent}>
          <View style={styles.heroTitle}>
            <View style={styles.grow}>
              <ThemedText type="label" style={styles.headline}>{step === 0 ? 'Comece sua' : 'Você está'}</ThemedText>
              <ThemedText type="title" accent style={styles.headline}>{step === 0 ? 'Jornada' : 'Quase lá!'}</ThemedText>
            </View>
            <Artwork name="corners" width={42} />
          </View>
          <ThemedText style={styles.percent}>{progress}%</ThemedText>
          <View style={[styles.track, { backgroundColor: theme.field }]}>
            <View style={{ height: '100%', width: `${progress}%`, minWidth: 4, backgroundColor: theme.accent }} />
          </View>
        </View>
      </View>
      <ThemedText type="technical" accent>SEU CADASTRO · ETAPA {step + 1} DE 5</ThemedText>
      {Boolean(storageError) && <ThemedText accessibilityRole="alert">{storageError}</ThemedText>}
      <CurrentStep draft={{ ...draft, accentColor: theme.accent }} errors={errors} onChange={patch => { setDraft(current => ({ ...current, ...patch })); setMessage(''); }} />
      {Boolean(message) && <ThemedText accessibilityRole="alert">{message}</ThemedText>}
      <View style={styles.actions}>
        <View style={styles.grow}>
          <ActionButton title={step === 4 ? 'Concluir cadastro' : 'Avançar'} loading={pending} onPress={advance} />
        </View>
        <ThemedText type="technical" accent>{String(step + 1).padStart(2, '0')} / 05</ThemedText>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={step ? 'Etapa anterior' : 'Voltar ao login'}
        onPress={() => {
          if (step) navigateToStep(step - 1);
          else { setDraft(initialRegistration); router.dismissTo('/'); }
        }} style={styles.back}>
        <ThemedText type="technical" accent>← {step ? 'ETAPA ANTERIOR' : 'VOLTAR AO LOGIN'}</ThemedText>
      </Pressable>
    </Screen>
  );
}
const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  heroContent: { flex: 1, gap: Spacing.two },
  heroTitle: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two },
  headline: { fontSize: 32, lineHeight: 38 }, percent: { alignSelf: 'flex-end', fontSize: 24, lineHeight: 30 },
  track: { height: 12, width: '100%' }, grow: { flex: 1, minWidth: 0 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, marginTop: Spacing.three },
  back: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
});
