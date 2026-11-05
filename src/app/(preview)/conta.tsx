import { Pressable, StyleSheet, View } from 'react-native';
import { AccentPalette } from '@/components/accent-palette';
import { ActionButton } from '@/components/action-button';
import { Artwork } from '@/components/artwork';
import { DashboardEmpty, DashboardScreen, SectionHeading } from '@/components/dashboard-screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useDashboard } from '@/hooks/use-dashboard';
import { useTheme } from '@/hooks/use-theme';
import { ageFromBirthDate, formatDate } from '@/utils/dashboard';
import { weekDays, type RegistrationProfile } from '@/utils/registration';
import { openPreview } from '@/utils/preview-navigation';

export default function AccountScreen() {
  const { data } = useDashboard();
  return <DashboardScreen>{data ? <AccountContent profile={data.profile} /> :
    <DashboardEmpty title="O WorkIn do seu jeito" description="Seus dados pessoais, metas e preferências ficarão aqui quando sua conta estiver conectada." />}
  </DashboardScreen>;
}

function AccountContent({ profile }: { profile: RegistrationProfile }) {
  const theme = useTheme();
  return <View style={styles.section}>
    <Artwork name="checker" width="100%" height={24} />
    <View style={styles.identity}>
      <View style={styles.identityText}>
        <ThemedText type="title" accessibilityRole="header" style={styles.name}>{profile.fullName}</ThemedText>
        <ThemedText type="technical" accent>PERFIL DE DEMONSTRAÇÃO</ThemedText>
        <Pressable style={styles.edit} accessibilityRole="button" accessibilityLabel="Visualizar edição dos dados pessoais" onPress={() => openPreview('dados')}>
          <Artwork name="pencil" width={18} /><ThemedText type="technical" accent>EDITAR DADOS</ThemedText>
        </Pressable>
      </View>
      <View style={[styles.avatar, { backgroundColor: theme.field }]} accessible accessibilityLabel="Imagem de perfil ilustrativa">
        <Artwork name="person" width={76} height={96} color={theme.onField} />
        <View style={styles.avatarCorner}><Artwork name="corners" width={28} /></View>
      </View>
    </View>
    <ActionButton title="Configurações" outlined onPress={() => openPreview('configuracoes')} />
    <SectionHeading title="Sobre você" />
    <View style={styles.facts}>
      <Fact label="Idade" value={`${ageFromBirthDate(profile.birthDate)} anos`} />
      <Fact label="Altura" value={`${profile.heightCm} cm`} />
      <Fact label="Peso" value={`${profile.weightKg} kg`} />
      <Fact label="Nascimento" value={formatDate(profile.birthDate)} />
    </View>
    <Fact label="Gênero" value={profile.gender} />
    <Fact label="E-mail" value={profile.email} />
    <Fact label="Atividade física" value={profile.activityLevel ?? 'Não informada'} />
    <Fact label="Observações médicas" value={profile.medicalNotes ?? 'Não informadas'} />
    <ActionButton title="Visualizar medidas e atividade" outlined onPress={() => openPreview('medidas')} />
    <SectionHeading title="Metas e preferências" />
    <ThemedText type="technical" accent>OBJETIVO {'>>>>>>>>'}</ThemedText>
    <ThemedText>{profile.goal}</ThemedText>
    <ThemedText type="technical" accent>MODALIDADES {'>>>>>>'}</ThemedText>
    <View style={styles.tags}>{profile.exerciseCategories.map(category => <View key={category} style={[styles.tag, { backgroundColor: theme.accent }]}>
      <ThemedText type="technical" style={{ color: theme.onAccent }}>{category}</ThemedText>
    </View>)}</View>
    <Fact label="Tempo disponível" value={`${profile.availableMinutesPerDay} minutos por dia`} />
    <Fact label="Dias de treino" value={profile.availableDays.map(day => weekDays[day - 1]).join(' · ')} />
    <ActionButton title="Editar preferências" outlined onPress={() => openPreview('preferencias')} />
    <SectionHeading title="Aparência" />
    <AccentPalette />
    <ActionButton title="Abrir personalização" outlined onPress={() => openPreview('aparencia')} />
    <ThemedText type="technical">A cor acompanha as telas nesta sessão. Ao recarregar, volta ao verde-lima.</ThemedText>
  </View>;
}

function Fact({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return <View style={[styles.fact, { borderColor: theme.border }]}>
    <ThemedText type="technical" accent>{label.toUpperCase()}</ThemedText><ThemedText>{value}</ThemedText>
  </View>;
}
const styles = StyleSheet.create({
  section: { gap: Spacing.three }, identity: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  identityText: { flex: 1, minWidth: 0, gap: Spacing.two }, name: { fontSize: 30, lineHeight: 36 },
  avatar: { width: 110, height: 132, justifyContent: 'flex-end', alignItems: 'center' }, avatarCorner: { position: 'absolute', right: Spacing.two, top: Spacing.two },
  edit: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  facts: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three }, fact: { minWidth: '40%', flexGrow: 1, borderBottomWidth: 1, paddingBottom: Spacing.two, gap: Spacing.one },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two }, tag: { paddingHorizontal: Spacing.two, paddingVertical: Spacing.one },
});
