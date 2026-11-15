import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ActionButton } from '@/components/action-button';
import { Artwork } from '@/components/artwork';
import { ChoiceGroup } from '@/components/choice-group';
import { DashboardEmpty, DashboardScreen, SectionHeading } from '@/components/dashboard-screen';
import { ThemedText } from '@/components/themed-text';
import { Fonts, Spacing } from '@/constants/theme';
import { useDashboard } from '@/hooks/use-dashboard';
import { useTheme } from '@/hooks/use-theme';
import { formatDate, formatDuration, historySummary, type DashboardData } from '@/utils/dashboard';
import { openPreview } from '@/utils/preview-navigation';
import { filterSessionHistory } from '@/utils/dashboard';

export default function HistoryScreen() {
  const { data } = useDashboard();
  return <DashboardScreen>{data ? <HistoryContent data={data} /> :
    <DashboardEmpty title="Cada treino conta" description="Suas sessões e seus resultados ficarão aqui. Ainda não há histórico conectado à sua conta." />}
  </DashboardScreen>;
}

function HistoryContent({ data }: { data: DashboardData }) {
  const theme = useTheme();
  const { filters, setFilters, isDemo } = useDashboard();
  const summary = historySummary(data.history);
  const filtered = filterSessionHistory(data.history, filters);
  const sessions = filtered.slice(0, 3);
  const mostRecent = data.history[0];
  return <View style={styles.section}>
    <SectionHeading title="Treinos anteriores" />
    {!isDemo && <ThemedText type="technical">Resumos desta abertura do aplicativo. A consulta do histórico completo da conta aguarda o serviço de histórico.</ThemedText>}
    <View style={styles.overview}>
      <View style={[styles.receipt, { backgroundColor: theme.field }]}>
        <View style={styles.receiptTitle}><ThemedText type="label" style={{ color: theme.onField }}>Resumo:</ThemedText><Artwork name="history" width={22} color={theme.onField} /></View>
        <ThemedText type="technical" style={[styles.receiptCaption, { color: theme.onField }]}>{isDemo ? 'SESSÕES DO MOCK LOCAL' : 'RESUMOS DESTA ABERTURA'}</ThemedText>
        <View style={[styles.receiptLine, { borderColor: theme.onField }]} />
        <ThemedText style={[styles.receiptText, { color: theme.onField }]}>{data.history.length} sessões registradas{'\n'}{summary.completed} concluídas{'\n'}{summary.ended} encerrada(s) antes do fim</ThemedText>
        <ThemedText type="technical" style={{ color: theme.onField }}>Último registro:{'\n'}{mostRecent ? formatDate(mostRecent.date) : '—'}</ThemedText>
        <Artwork name="checker" width="100%" height={20} color={theme.onField} />
      </View>
      <View style={styles.stats}>
        <View style={[styles.countPanel, { backgroundColor: theme.accent }]}><Artwork name="corners" width={25} color={theme.onAccent} />
          <ThemedText type="label" style={[styles.smallLabel, { color: theme.onAccent }]}>Treinos feitos:</ThemedText>
          <ThemedText style={[styles.count, { color: theme.onAccent }]}>{summary.completed}</ThemedText>
        </View>
        <Artwork name="stripeLine" width="100%" height={18} />
        <ThemedText type="label" accent style={styles.smallLabel}>Tempo registrado:</ThemedText>
        <ThemedText style={styles.duration}>{formatDuration(summary.totalSeconds)}</ThemedText>
      </View>
    </View>
    <ThemedText type="technical">Tempo registrado inclui sessões encerradas manualmente. Apenas treinos completos contam para a sequência.</ThemedText>
    <SectionHeading title="Histórico de treinos" />
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.calendar}>
      {data.week.map(day => <View key={day.date} accessible accessibilityLabel={formatDate(day.date)}
        style={[styles.day, { backgroundColor: theme.field, borderColor: theme.accent }]}>
        <ThemedText type="technical" style={{ color: theme.onField }}>{day.date.slice(8)}</ThemedText>
        <ThemedText style={{ color: theme.onField }}>{day.status === 'completed' ? '✓' : day.status === 'ended' ? '/' : '—'}</ThemedText>
      </View>)}
    </ScrollView>
    <ChoiceGroup label="Mostrar sessões" options={['Todos', 'Concluídos', 'Encerrados']} selected={[filters.status === 'all' ? 'Todos' : filters.status === 'completed' ? 'Concluídos' : 'Encerrados']} onSelect={value => setFilters({ ...filters, status: value === 'Todos' ? 'all' : value === 'Concluídos' ? 'completed' : 'ended' })} />
    <ActionButton title="Visualizar filtros" outlined onPress={() => openPreview('filtros')} />
    {sessions.map(session => <Pressable key={session.id} accessibilityRole="button" accessibilityLabel={`Ver sessão de ${formatDate(session.date)}`}
      onPress={() => openPreview('sessao', session.id)}
      style={[styles.session, { backgroundColor: theme.surface, borderColor: theme.accent }]}>
      <View style={styles.sessionTop}><ThemedText type="technical" accent>{formatDate(session.date)}</ThemedText><ThemedText type="technical">{formatDuration(session.durationSeconds)}</ThemedText></View>
      <ThemedText type="label">{session.title}</ThemedText>
      <ThemedText type="technical">{session.status === 'completed' ? '✓ CONCLUÍDO' : '/ ENCERRADO MANUALMENTE'}</ThemedText>
    </Pressable>)}
    {!sessions.length && <ThemedText>Nenhum treino registrado.</ThemedText>}
    {filtered.length > 3 && <ActionButton title="Ver mais treinos" onPress={() => openPreview('historico')} />}
  </View>;
}

const styles = StyleSheet.create({
  section: { gap: Spacing.three }, grow: { flex: 1, minWidth: 0 },
  overview: { flexDirection: 'row', gap: Spacing.three }, receipt: { flex: 1, padding: Spacing.two, gap: Spacing.two },
  receiptTitle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  receiptCaption: { fontSize: 8, lineHeight: 12 }, receiptText: { fontSize: 13, lineHeight: 21 }, receiptLine: { borderTopWidth: 1, borderStyle: 'dashed' },
  stats: { flex: 1, gap: Spacing.two }, countPanel: { padding: Spacing.two }, count: { fontFamily: Fonts.bold, fontSize: 60, lineHeight: 70, textAlign: 'right' },
  smallLabel: { fontSize: 12, lineHeight: 17 }, duration: { fontFamily: Fonts.bold, fontSize: 28, lineHeight: 34 },
  calendar: { gap: Spacing.two }, day: { minWidth: 44, minHeight: 64, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.one },
  session: { borderLeftWidth: 3, padding: Spacing.three, gap: Spacing.two }, sessionTop: { flexDirection: 'row', justifyContent: 'space-between' },
});
