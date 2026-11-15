import { Pressable, StyleSheet, View } from 'react-native';
import { ActionButton } from '@/components/action-button';
import { ChoiceGroup } from '@/components/choice-group';
import { FormField } from '@/components/form-field';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatDate, formatDuration, filterSessionHistory, type HistoryFilters, type DashboardData } from '@/utils/dashboard';
import { openPreview, closePreview } from '@/utils/preview-navigation';
import { useState } from 'react';
import { useDashboard } from '@/hooks/use-dashboard';
import { birthDateToISO, formatBirthDate } from '@/utils/registration';

export type HistoryPreviewName = 'historico' | 'sessao' | 'filtros' | 'sequencia';

export function HistoryPreview({ screen, data, id }: { screen: HistoryPreviewName; data: DashboardData; id?: string }) {
  const theme = useTheme();
  const dashboard = useDashboard();
  const [filter, setFilter] = useState(dashboard.filters.status);
  const [from, setFrom] = useState(dashboard.filters.from ? formatDate(dashboard.filters.from) : '');
  const [to, setTo] = useState(dashboard.filters.to ? formatDate(dashboard.filters.to) : '');
  const [message, setMessage] = useState('');
  const filtered = filterSessionHistory(data.history, dashboard.filters);
  const labels = { all: 'Todos', completed: 'Concluídos', ended: 'Encerrados' };

  function applyFilters() {
    const fromISO = from ? birthDateToISO(from) : '';
    const toISO = to ? birthDateToISO(to) : '';
    if (fromISO === null || toISO === null || (fromISO && toISO && fromISO > toISO)) {
      setMessage('Informe datas válidas, com o início anterior ao fim.');
      return;
    }
    dashboard.setFilters({ status: filter, from: fromISO, to: toISO });
    closePreview();
  }
  switch (screen) {
    case 'historico': return <>
      <ThemedText type="title">Cada treino conta</ThemedText>
      <ActionButton title="Visualizar filtros" outlined onPress={() => openPreview('filtros')} />
      {filtered.map(session => <Pressable key={session.id} accessibilityRole="button" accessibilityLabel={`Ver sessão de ${formatDate(session.date)}`}
        onPress={() => openPreview('sessao', session.id)} style={[styles.row, { borderColor: theme.border }]}>
        <ThemedText type="technical" accent>{formatDate(session.date)}</ThemedText>
        <ThemedText type="label">{session.title}</ThemedText>
        <ThemedText type="technical">{session.status === 'completed' ? '✓ CONCLUÍDO' : '/ ENCERRADO MANUALMENTE'} · {formatDuration(session.durationSeconds)}</ThemedText>
      </Pressable>)}
      {!filtered.length && <ThemedText>Nenhuma sessão corresponde aos filtros.</ThemedText>}
    </>;
    case 'sessao': {
      const session = id ? data.history.find(item => item.id === id) : data.history[0];
      if (!session) return <ThemedText>Sessão não encontrada nesta prévia.</ThemedText>;
      const completed = session.exercises.filter(exercise => exercise.completed);
      const average = completed.length ? completed.reduce((sum, exercise) => sum + exercise.durationSeconds, 0) / completed.length : 0;
      return <>
        {session.id.startsWith('local-') && <ThemedText type="technical">Tempos medidos nesta prática; tempos de conclusões anteriores não são recuperados. O resumo fica nesta abertura do app. Histórico definitivo e sequência dependem do serviço da conta.</ThemedText>}
        <ThemedText type="technical" accent>{formatDate(session.date)}</ThemedText>
        <ThemedText type="title">{session.title}</ThemedText>
        <ThemedText>{session.status === 'completed' ? 'Treino concluído integralmente.' : 'Treino encerrado manualmente. Não incrementa a sequência.'}</ThemedText>
        <ThemedText type="label">{completed.length} de {session.exercises.length} exercícios concluídos</ThemedText>
        {session.exercises.map((exercise, index) => <View key={`${exercise.name}-${index}`} style={[styles.detail, { borderColor: theme.border }]}>
          <View style={styles.grow}><ThemedText>{exercise.name}</ThemedText>
            <ThemedText type="technical" accent>{exercise.completed ? '✓ CONCLUÍDO' : exercise.durationSeconds ? '/ INTERROMPIDO' : 'NÃO REALIZADO'}</ThemedText>
          </View>
          <ThemedText type="technical">{formatDuration(exercise.durationSeconds)}</ThemedText>
        </View>)}
        <ThemedText>Duração total: {formatDuration(session.durationSeconds)}{'\n'}Média dos exercícios concluídos: {formatDuration(average)}</ThemedText>
      </>;
    }
    case 'filtros': return <>
      <ThemedText type="title">Encontre seus treinos</ThemedText>
      <ChoiceGroup label="Situação" options={Object.values(labels)} selected={[labels[filter]]} onSelect={value => setFilter((Object.keys(labels) as HistoryFilters['status'][]).find(key => labels[key] === value)!)} />
      <FormField label="Data inicial" placeholder="DD/MM/AAAA" value={from} editable onChangeText={value => setFrom(formatBirthDate(value))} keyboardType="number-pad" required={false} />
      <FormField label="Data final" placeholder="DD/MM/AAAA" value={to} editable onChangeText={value => setTo(formatBirthDate(value))} keyboardType="number-pad" required={false} />
      {Boolean(message) && <ThemedText accessibilityRole="alert">{message}</ThemedText>}
      <ActionButton title="Aplicar filtros" onPress={applyFilters} />
      <ActionButton title="Limpar filtros" outlined onPress={() => { dashboard.setFilters({ status: 'all', from: '', to: '' }); setFilter('all'); setFrom(''); setTo(''); setMessage(''); }} />
    </>;
    case 'sequencia': {
      const status = { completed: '✓ Concluído', ended: '/ Encerrado manualmente', scheduled: '○ Programado', rest: '· Sem treino programado' };
      return <>
        <ThemedText type="title" accent>{dashboard.isDemo ? `${data.currentStreak} dias em sequência` : 'Cada treino conta'}</ThemedText>
        {!dashboard.isDemo && <ThemedText>A sequência da conta estará disponível quando o histórico e os dias programados forem fornecidos pelo servidor.</ThemedText>}
        {data.week.map(day => <View key={day.date} style={[styles.detail, { borderColor: theme.border }]}>
          <ThemedText type="technical">{formatDate(day.date)}</ThemedText><View style={styles.grow}><ThemedText style={styles.right}>{status[day.status]}</ThemedText></View>
        </View>)}
        <ThemedText type="label">Como funciona</ThemedText>
        <ThemedText>A sequência aumenta apenas após um treino completo. Um dia programado sem treino interrompe a sequência; dias sem treino programado não exigem uma sessão.</ThemedText>
        <ThemedText>O encerramento manual permite consultar um resumo parcial, mas não conta como conclusão integral.</ThemedText>
      </>;
    }
  }
}
const styles = StyleSheet.create({
  row: { gap: Spacing.two, paddingVertical: Spacing.three, borderBottomWidth: 1 },
  detail: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingBottom: Spacing.two, borderBottomWidth: 1 },
  grow: { flex: 1, minWidth: 0 }, right: { textAlign: 'right', fontSize: 14 },
});
