import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { ActionButton } from '@/components/action-button';
import { Artwork } from '@/components/artwork';
import { AvailabilityStep, PersonalStep, PhysicalStep, PreferencesStep, SecurityStep } from '@/components/registration-steps';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { initialRegistration, validateRegistrationStep, type RegistrationErrors } from '@/utils/registration';
import { useState } from 'react';
import { useRegistration } from '@/hooks/use-registration';

const steps = [PersonalStep, PhysicalStep, PreferencesStep, AvailabilityStep, SecurityStep];

export default function RegisterScreen() {
  const theme = useTheme();
  const { draft, setDraft } = useRegistration();
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [message, setMessage] = useState('');
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

  function advance() {
    const current = { ...draft, accentColor: theme.accent };
    const validation = validateRegistrationStep(current, step);
    setErrors(validation);
    if (Object.keys(validation).length) { setMessage('Revise os campos indicados.'); return; }
    if (step < 4) navigateToStep(step + 1);
    else {
      const invalidStep = [0, 1, 2, 3].find(index => Object.keys(validateRegistrationStep(current, index)).length > 0);
      if (invalidStep !== undefined) { navigateToStep(invalidStep); return; }
      setMessage('Seu formulário está preenchido. O cadastro completo aguarda a integração de medidas, preferências e disponibilidade com o servidor.');
    }
  }

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
      <CurrentStep draft={{ ...draft, accentColor: theme.accent }} errors={errors} onChange={patch => { setDraft(current => ({ ...current, ...patch })); setMessage(''); }} />
      {Boolean(message) && <ThemedText accessibilityRole="alert">{message}</ThemedText>}
      <View style={styles.actions}>
        <View style={styles.grow}>
          <ActionButton title={step === 4 ? 'Revisar cadastro' : 'Avançar'} onPress={advance} />
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
