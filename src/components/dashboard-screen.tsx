import { router } from 'expo-router';
import { TabTrigger, type TabTriggerSlotProps } from 'expo-router/ui';
import type { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ActionButton } from '@/components/action-button';
import { Artwork } from '@/components/artwork';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Fonts, Spacing } from '@/constants/theme';
import { useDashboard } from '@/hooks/use-dashboard';
import { useTheme } from '@/hooks/use-theme';
import { formatDate } from '@/utils/dashboard';
import { openPreview } from '@/utils/preview-navigation';

export function DashboardScreen({ children }: PropsWithChildren) {
  const { data, isDemo } = useDashboard();
  const theme = useTheme();
  return (
    <Screen code="user:home" dashboard>
      <ThemedText type="technical">seja bem-vindo(a), <ThemedText type="technical" accent>{data ? data.profile.fullName.split(' ')[0] : 'seu próximo movimento começa aqui'}...</ThemedText></ThemedText>
      <ThemedText type="technical" accent>{isDemo ? 'DEMONSTRAÇÃO · DADOS ILUSTRATIVOS' : 'SUA CONTA · WORKIN'}</ThemedText>
      <StreakPanel />
      <View style={styles.tabs} accessibilityRole="tablist">
        <TabTrigger name="today" asChild><MenuTab>Treino do dia</MenuTab></TabTrigger>
        <TabTrigger name="history" asChild><MenuTab>Treinos anteriores</MenuTab></TabTrigger>
        <TabTrigger name="account" asChild><MenuTab>Conta</MenuTab></TabTrigger>
      </View>
      {children}
      <View style={[styles.footer, { borderColor: theme.border }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Sair" onPress={() => openPreview('saida')} style={styles.link}>
          <ThemedText type="technical">SAIR ↗</ThemedText>
        </Pressable>
      </View>
    </Screen>
  );
}

function MenuTab({ children, isFocused, ...props }: TabTriggerSlotProps) {
  const theme = useTheme();
  return (
    <Pressable {...props} accessibilityRole="tab" accessibilityLabel={String(children)} aria-selected={Boolean(isFocused)}
      accessibilityState={{ selected: isFocused }} style={({ pressed }) => [styles.tab, {
        borderColor: theme.accent, backgroundColor: isFocused ? theme.accent : theme.background, opacity: pressed ? 0.7 : 1,
      }]}>
      <ThemedText type="label" style={[styles.tabText, { color: isFocused ? theme.onAccent : theme.text }]}>{children}</ThemedText>
    </Pressable>
  );
}

function StreakPanel() {
  const { data, isDemo } = useDashboard();
  const theme = useTheme();
  const labels = { completed: 'concluído', ended: 'encerrado manualmente', scheduled: 'programado', rest: 'sem treino programado' };
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Ver detalhes da sequência" onPress={() => openPreview('sequencia')}
      style={[styles.streak, { backgroundColor: theme.field }]}>
      <View style={styles.streakHeading}>
        <ThemedText style={[styles.streakNumber, { color: theme.onField }]}>{isDemo ? data?.currentStreak : '—'}</ThemedText>
        <View style={styles.grow}>
          <ThemedText type="label" style={{ color: theme.onField }}>Dias{ '\n' }em sequência</ThemedText>
          <ThemedText type="technical" style={[styles.streakCaption, { color: theme.onField }]}>{isDemo ? 'DIAS PROGRAMADOS CONCLUÍDOS' : 'SEQUÊNCIA AGUARDA HISTÓRICO DA CONTA'}</ThemedText>
        </View>
      </View>
      <View style={styles.week}>
        {(data?.week ?? Array.from({ length: 7 }, () => null)).map((activity, index) => (
          <View key={activity?.date ?? index} style={styles.day} accessible
            accessibilityLabel={activity ? `${formatDate(activity.date)}: ${labels[activity.status]}` : 'Sem informação de treino'}>
            <View style={[styles.circle, { borderColor: theme.onField, backgroundColor: activity?.status === 'completed' ? theme.accent : 'transparent' }]}>
              <ThemedText style={[styles.dayMark, { color: theme.onField }]}>{activity?.status === 'completed' ? '✓' : activity?.status === 'ended' ? '/' : activity?.status === 'rest' ? '·' : ''}</ThemedText>
            </View>
            <ThemedText type="technical" style={{ color: theme.onField }}>{activity ? activity.date.slice(-2) : '—'}</ThemedText>
          </View>
        ))}
      </View>
      {data && data.week.length > 0 && <ThemedText type="technical" style={[styles.weekLegend, { color: theme.onField }]}>
        {formatDate(data.week[0].date).slice(0, 5)} a {formatDate(data.week[data.week.length - 1].date).slice(0, 5)}{'\n'}
        ✓ concluído · / encerrado · ○ programado · · descanso
      </ThemedText>}
    </Pressable>
  );
}

export function SectionHeading({ title }: { title: string }) {
  return <View style={styles.sectionHeading}>
    <ThemedText type="label" accessibilityRole="header" style={styles.sectionTitle}>{title}</ThemedText>
    <View style={styles.grow}><Artwork name="stripeLine" width="100%" height={20} /></View>
  </View>;
}

export function DashboardEmpty({ title, description }: { title: string; description: string }) {
  return <View style={styles.empty}>
    <View style={styles.emptyHeading}><Artwork name="corners" width={64} /><ThemedText type="title" style={styles.emptyTitle}>{title}</ThemedText></View>
    <ThemedText>{description}</ThemedText>
    <ActionButton title="Criar conta" outlined onPress={() => router.replace('/cadastro')} />
    <ThemedText type="technical">Seu perfil reúne as informações para personalizar os treinos.</ThemedText>
    <Artwork name="checker" width={160} height={44} />
  </View>;
}

const styles = StyleSheet.create({
  grow: { flex: 1, minWidth: 0 },
  tabs: { flexDirection: 'row', gap: Spacing.one },
  tab: { flex: 1, minWidth: 0, minHeight: 48, borderWidth: 1, padding: Spacing.one, alignItems: 'center', justifyContent: 'center' },
  tabText: { fontSize: 11, lineHeight: 15, textAlign: 'center' },
  streak: { padding: Spacing.three, gap: Spacing.two },
  streakHeading: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  streakNumber: { fontFamily: Fonts.bold, fontSize: 54, lineHeight: 64 },
  streakCaption: { fontSize: 8, lineHeight: 12, marginTop: Spacing.one },
  week: { flexDirection: 'row', justifyContent: 'space-between' },
  day: { alignItems: 'center', gap: Spacing.one },
  circle: { width: 19, height: 19, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  dayMark: { fontSize: 11, lineHeight: 15 },
  weekLegend: { fontSize: 8, lineHeight: 13 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  sectionTitle: { fontSize: 21, lineHeight: 27, flexShrink: 1 },
  empty: { gap: Spacing.three, paddingVertical: Spacing.three },
  emptyHeading: { flexDirection: 'row', gap: Spacing.three, alignItems: 'center' },
  emptyTitle: { flex: 1, fontSize: 25, lineHeight: 30 },
  footer: { borderTopWidth: 1, marginTop: Spacing.three },
  link: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
});
