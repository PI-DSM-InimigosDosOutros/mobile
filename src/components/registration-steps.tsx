import { StyleSheet, View } from 'react-native';
import { AccentPalette } from '@/components/accent-palette';
import { Artwork } from '@/components/artwork';
import { ChoiceGroup } from '@/components/choice-group';
import { FormField } from '@/components/form-field';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  activityLevels, exerciseCategories, genders,
  passwordRequirements, weekDays, type RegistrationDraft, type RegistrationErrors,
} from '@/utils/registration';

export type RegistrationStepProps = {
  draft: RegistrationDraft;
  errors?: RegistrationErrors;
};

export function PersonalStep({ draft, errors = {} }: RegistrationStepProps) {
  return (
    <View style={styles.section}>
      <SectionTitle first="Dados" accent="pessoais" />
      <FormField label="Nome completo" placeholder="DIGITE SEU NOME COMPLETO..." autoComplete="name" textContentType="name"
        value={draft.fullName} error={errors.fullName} />
      <FormField label="Data de nascimento" placeholder="DD/MM/AAAA" keyboardType="number-pad" maxLength={10}
        value={draft.birthDate} error={errors.birthDate} />
      <ChoiceGroup label="Gênero" options={genders} selected={[draft.gender]} error={errors.gender} />
      <FormField label="E-mail" placeholder="SEU E-MAIL..." keyboardType="email-address" autoComplete="email" textContentType="emailAddress"
        autoCapitalize="none" autoCorrect={false} value={draft.email} error={errors.email} />
      <ThemedText type="technical">Representação visual dos campos do cadastro. O preenchimento será implementado posteriormente.</ThemedText>
    </View>
  );
}

export function PhysicalStep({ draft, errors = {} }: RegistrationStepProps) {
  const theme = useTheme();
  return (
    <View style={styles.section}>
      <SectionTitle first="Seu" accent="físico" />
      <View style={styles.measure}>
        <Artwork name="measure" width={28} height={44} color={theme.accent} />
        <View style={styles.grow}><FormField label="Altura (cm)" placeholder="EX.: 170" tone="accent" keyboardType="decimal-pad"
          value={draft.height} error={errors.height} /></View>
      </View>
      <View style={styles.measure}>
        <Artwork name="dumbbell" width={28} height={36} color={theme.accent} />
        <View style={styles.grow}><FormField label="Peso (kg)" placeholder="EX.: 70,5" tone="accent" keyboardType="decimal-pad"
          value={draft.weight} error={errors.weight} /></View>
      </View>
      <ThemedText type="technical">Informe a altura em centímetros e o peso em quilos. A demonstração visual de medidas ainda não está disponível.</ThemedText>
      <ChoiceGroup label="Sua relação com atividades físicas (opcional)" options={activityLevels}
        selected={draft.activityLevel ? [draft.activityLevel] : []}
        error={errors.activityLevel} />
      <FormField label="Observações médicas (opcional)" required={false} placeholder="O QUE VOCÊ GOSTARIA DE INFORMAR?" multiline
        value={draft.medicalNotes} />
    </View>
  );
}

export function PreferencesStep({ draft, errors = {} }: RegistrationStepProps) {
  const theme = useTheme();
  return (
    <View style={styles.section}>
      <SectionTitle first="Metas e" accent="preferências" />
      <View style={styles.measure}>
        <Artwork name="dumbbell" width={44} height={44} color={theme.accent} />
        <View style={styles.grow}><ThemedText type="label" accent>Exercícios</ThemedText><ThemedText type="technical">Escolha os tipos de exercício que te agradam.</ThemedText></View>
      </View>
      <FormField label="Procurar exercícios" required={false} placeholder="PROCURAR MODALIDADES..." value="" />
      <ChoiceGroup label="Modalidades" options={exerciseCategories} selected={draft.categories} multiple error={errors.categories} />
      <ThemedText type="technical" accent accessibilityLiveRegion="polite">Selecionadas: {draft.categories.length ? draft.categories.join(', ') : 'nenhuma'}</ThemedText>
      <FormField label="Qual seu objetivo treinando?" placeholder="CONTE SEU OBJETIVO..." multiline tone="accent"
        value={draft.goal} error={errors.goal} />
      <Artwork name="stripeLine" width="100%" height={16} color={theme.accent} />
    </View>
  );
}

export function AvailabilityStep({ draft, errors = {} }: RegistrationStepProps) {
  const theme = useTheme();
  return (
    <View style={styles.section}>
      <SectionTitle first="Disponibilidade" />
      <View style={styles.measure}>
        <ThemedText type="label">Tempo por dia</ThemedText><Artwork name="history" width={24} color={theme.accent} />
        <Artwork name="checker" width={80} height={30} color={theme.accent} />
      </View>
      <View style={styles.timeRow}>
        <View style={styles.grow}><FormField label="Horas" placeholder="00" tone="accent" decorated={false} keyboardType="number-pad" maxLength={2}
          value={draft.hours} error={errors.hours} /></View>
        <View style={styles.grow}><FormField label="Minutos" placeholder="00" tone="accent" decorated={false} keyboardType="number-pad" maxLength={2}
          value={draft.minutes} error={errors.minutes} /></View>
      </View>
      <View style={styles.measure}>
        <Artwork name="checker" width={80} height={30} color={theme.accent} />
        <Artwork name="calendar" width={24} color={theme.accent} /><ThemedText type="label">Dias por semana</ThemedText>
      </View>
      <ChoiceGroup label="Escolha seus dias de treino" options={weekDays} multiple selected={draft.days.map(day => weekDays[day - 1])}
         error={errors.days} />
      <ThemedText type="technical">Os próximos treinos considerarão o tempo e os dias selecionados aqui.</ThemedText>
    </View>
  );
}

export function SecurityStep({ draft, errors = {} }: RegistrationStepProps) {
  const theme = useTheme();
  return (
    <View style={styles.section}>
      <ThemedText type="title" style={styles.right}>Agora só falta <ThemedText type="title" accent>sua senha!</ThemedText></ThemedText>
      <View style={styles.security}>
        <Artwork name="stripes" width={86} height={106} color={theme.accent} />
        <View style={[styles.requirements, { borderColor: theme.accent }]}>
          <ThemedText type="technical">SUA SENHA DEVE TER:</ThemedText>
          {passwordRequirements(draft.password).map(rule => (
            <ThemedText key={rule.label} type="technical" accent={rule.met}>{rule.met ? '✓' : '○'} {rule.label}</ThemedText>
          ))}
        </View>
      </View>
      <FormField label="Crie uma senha" placeholder="DIGITE A SENHA..." password autoCapitalize="none" autoCorrect={false} autoComplete="new-password" textContentType="newPassword"
        value={draft.password} error={errors.password} />
      <FormField label="Confirme sua senha" placeholder="CONFIRME A SENHA..." password autoCapitalize="none" autoCorrect={false} autoComplete="new-password" textContentType="newPassword"
        value={draft.confirmPassword} error={errors.confirmPassword} />
      <AccentPalette error={errors.accentColor} />
    </View>
  );
}

function SectionTitle({ first, accent }: { first: string; accent?: string }) {
  const theme = useTheme();
  return (
    <View style={styles.sectionTitle}>
      <ThemedText type="label" accessibilityRole="header" style={styles.sectionTitleText}>{first}{accent ? ' ' : ''}{accent && <ThemedText type="label" accent style={styles.sectionTitleText}>{accent}</ThemedText>}</ThemedText>
      <View style={styles.grow}><Artwork name="stripeLine" width="100%" height={20} color={theme.accent} /></View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: Spacing.three },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  sectionTitleText: { fontSize: 20, lineHeight: 26, flexShrink: 1 },
  measure: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: Spacing.two },
  timeRow: { flexDirection: 'row', gap: Spacing.three },
  grow: { flex: 1, minWidth: 0 },
  right: { textAlign: 'right', fontSize: 27, lineHeight: 34 },
  security: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  requirements: { flex: 1, borderWidth: 1, padding: Spacing.two, gap: Spacing.one },
});
