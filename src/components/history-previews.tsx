import { Pressable, StyleSheet, View } from 'react-native';
import { ActionButton } from '@/components/action-button';
import { ChoiceGroup } from '@/components/choice-group';
import { FormField } from '@/components/form-field';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatDate, formatDuration, type DashboardData } from '@/utils/dashboard';
import { openPreview } from '@/utils/preview-navigation';

export type HistoryPreviewName = 'historico' | 'sessao' | 'filtros' | 'sequencia';

export function HistoryPreview({ screen, data, id }: { screen: HistoryPreviewName; data: DashboardData; id?: string }) {
  const theme = useTheme();
  switch (screen) {
    case 'historico': return <>
      <ThemedText type="title">Cada treino conta</ThemedText>
      <ActionButton title="Visualizar filtros" outlined onPress={() => openPreview('filtros')} />
      {data.history.map(session => <Pressable key={session.id} accessibilityRole="button" accessibilityLabel={`Ver sessão de ${formatDate(session.date)}`}
        onPress={() => openPreview('sessao', session.id)} style={[styles.row, { borderColor: theme.border }]}>
        <ThemedText type="technical" accent>{formatDate(session.date)}</ThemedText>
        <ThemedText type="label">{session.title}</ThemedText>
        <ThemedText type="technical">{session.status === 'completed' ? '✓ CONCLUÍDO' : '/ ENCERRADO MANUALMENTE'} · {formatDuration(session.durationSeconds)}</ThemedText>
      </Pressable>)}
      {!data.history.length && <ThemedText>Ainda não há sessões disponíveis.</ThemedText>}
    </>;
    case 'sessao': {
      const session = id ? data.history.find(item => item.id === id) : data.history[0];
      if (!session) return <ThemedText>Sessão não encontrada nesta prévia.</ThemedText>;
      const completed = session.exercises.filter(exercise => exercise.completed);
      const average = completed.length ? completed.reduce((sum, exercise) => sum + exercise.durationSeconds, 0) / completed.length : 0;
      return <>
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
      <ChoiceGroup label="Situação" options={['Todos', 'Concluídos', 'Encerrados']} selected={['Todos']} />
      <FormField label="Data inicial" placeholder="DD/MM/AAAA" value="" required={false} />
      <FormField label="Data final" placeholder="DD/MM/AAAA" value="" required={false} />
      <ThemedText>Esta tela mostra a organização dos filtros. A seleção e a aplicação serão implementadas posteriormente.</ThemedText>
      <ActionButton title="Aplicar filtros" />
    </>;
    case 'sequencia': {
      const status = { completed: '✓ Concluído', ended: '/ Encerrado manualmente', scheduled: '○ Programado', rest: '· Sem treino programado' };
      return <>
        <ThemedText type="title" accent>{data.currentStreak} dias em sequência</ThemedText>
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
