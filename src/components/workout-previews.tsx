import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';
import { ActionButton } from '@/components/action-button';
import { Artwork } from '@/components/artwork';
import { ThemedText } from '@/components/themed-text';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useDashboard } from '@/hooks/use-dashboard';
import { useState } from 'react';
import { formatDuration, type DashboardData, type Exercise } from '@/utils/dashboard';
import { closePreview, openPreview, replacePreview } from '@/utils/preview-navigation';

export type WorkoutPreviewName = 'criar-treino' | 'exercicio' | 'treino' | 'execucao' | 'pausa' | 'encerramento' | 'conclusao';

export function WorkoutPreview({ screen, data, id }: { screen: WorkoutPreviewName; data: DashboardData; id?: string }) {
  const theme = useTheme();
  const dashboard = useDashboard();
  const session = dashboard.practice;
  const current = session.practice;
  const notice = session.error ? <ThemedText accessibilityRole="alert">{session.error}</ThemedText> : null;
  async function finish() {
    const result = await session.finish();
    if (result) { dashboard.keepSummary(result); replacePreview('sessao', result.id); }
  }
  if (screen === 'criar-treino') {
    const { goal, exerciseCategories, availableMinutesPerDay } = data.profile;
    return <>
      <ThemedText type="title">Seu treino, do seu jeito</ThemedText>
      <ThemedText>O treino será montado automaticamente com as preferências do seu cadastro.</ThemedText>
      <ThemedText type="label" accent>{dashboard.isDemo ? "Preferências de exemplo" : "Preferências da conta"}</ThemedText>
      <ThemedText>Meta: {goal || 'Ainda não informada'}{'\n'}Modalidades: {exerciseCategories.join(', ') || 'Ainda não informadas'}{'\n'}Tempo disponível: {availableMinutesPerDay > 0 ? `${availableMinutesPerDay} min/dia` : 'Ainda não informado'}</ThemedText>
      <ThemedText type="technical">A geração de um novo treino aguarda a operação de criação e o cadastro de preferências no servidor.</ThemedText>
      <ActionButton title="Voltar ao treino do dia" outlined onPress={closePreview} />
    </>;
  }

  const exercises = data.workout.exercises;
  const executionScreen = ['execucao', 'pausa', 'encerramento', 'conclusao'].includes(screen);
  const index = executionScreen && current ? current.index : id ? exercises.findIndex(item => item.id === id) : 0;
  const exercise = exercises[index];
  if (!exercise) return <ThemedText>Não há exercício disponível. Volte ao treino do dia e atualize a consulta.</ThemedText>;

  switch (screen) {
    case 'treino': return <>
      <ThemedText type="title">{data.workout.title}</ThemedText>
      <ThemedText>{exercises.length} exercícios · {formatDuration(exercises.reduce((sum, item) => sum + item.estimatedSeconds, 0))} estimados</ThemedText>
      {exercises.map((item, position) => <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={`Ver exercício ${item.name}`}
        onPress={() => openPreview('exercicio', item.id)} style={[styles.row, { borderColor: theme.border }]}>
        <ThemedText type="technical" accent>{String(position + 1).padStart(2, '0')}</ThemedText>
        <View style={styles.grow}><ThemedText type="label">{item.name}</ThemedText><ThemedText type="technical">{item.muscles.join(' · ')}</ThemedText></View>
        <ThemedText type="technical">{formatDuration(item.estimatedSeconds)}</ThemedText>
      </Pressable>)}
      <ActionButton title="Visualizar execução" icon="dumbbell" onPress={() => openPreview('execucao', exercises[0]?.id)} />
      <ThemedText type="technical">Na próxima tela, confirme o início para acompanhar o tempo e concluir cada exercício.</ThemedText>
    </>;
    case 'exercicio': return <>
      <ThemedText type="title" accessibilityRole="header">{exercise.name}</ThemedText>
      <ExerciseMaterial key={exercise.id} exercise={exercise} />
      <ThemedText>{exercise.description}</ThemedText>
      <ThemedText type="label">Informações do exercício</ThemedText>
      <ThemedText>Modalidade: {exercise.category}{'\n'}Grupos: {exercise.muscles.join(', ')}{'\n'}Tempo estimado: {formatDuration(exercise.estimatedSeconds)}</ThemedText>
      <ActionButton title="Ver na execução" onPress={() => openPreview('execucao', exercise.id)} />
    </>;
    case 'execucao': return <>
      <ThemedText type="technical" accent>EXERCÍCIO {index + 1} DE {exercises.length}</ThemedText>
      <View style={[styles.track, { backgroundColor: theme.field }]}>
        <View style={{ height: '100%', width: `${(index + 1) / exercises.length * 100}%`, backgroundColor: theme.accent }} />
      </View>
      <ThemedText type="title" accessibilityRole="header">{exercise.name}</ThemedText>
      <ExerciseMaterial key={exercise.id} exercise={exercise} />
      <ThemedText style={[styles.timer, { color: theme.accent }]}>{formatDuration(current ? Math.max(0, exercise.estimatedSeconds - session.elapsed) : exercise.estimatedSeconds)}</ThemedText>
      <ThemedText type="technical">{current ? 'TEMPO DECORRIDO: ' + formatDuration(session.elapsed) : 'TEMPO ESTIMADO · CONFIRME O INÍCIO'}</ThemedText>
      {notice}
      {!current ? <ActionButton title="Iniciar treino" loading={session.pending} onPress={() => void session.begin()} /> : <>
        <ActionButton title={current.runningSince === null ? 'Retomar treino' : 'Pausar treino'} outlined disabled={session.pending}
          onPress={() => { if (current.runningSince === null) session.resume(); else { session.pause(); openPreview('pausa', exercise.id); } }} />
        <ActionButton title={current.completed.every(Boolean) ? 'Ir para conclusão' : 'Concluir exercício'} loading={session.pending}
          disabled={Boolean(session.error) && !dashboard.isDemo}
          onPress={async () => { if (current.completed.every(Boolean) || await session.advance()) replacePreview('conclusao'); }} />
        {index > 0 && <ActionButton title="Consultar exercício anterior" outlined onPress={() => { session.pause(); openPreview('exercicio', exercises[index - 1].id); }} />}
        <ActionButton title="Encerrar treino" outlined disabled={session.pending} onPress={() => { session.pause(); openPreview('encerramento', exercise.id); }} />
      </>}
      {Boolean(session.error) && !dashboard.isDemo && <ActionButton title="Consultar progresso novamente" outlined onPress={() => { session.reset(); void dashboard.refresh(); }} />}
      <ThemedText type="technical">{dashboard.isDemo ? 'Demonstração com medição local de tempo.' : 'Início e conclusões usam sua conta. O histórico definitivo aguarda a evolução do serviço.'}</ThemedText>
    </>;
    case 'pausa': return <>
      <Artwork name="stripes" width={80} />
      <ThemedText type="title">Respire.{'\n'}A gente espera.</ThemedText>
      <ThemedText>{exercise.name} · {index + 1} de {exercises.length}</ThemedText>
      <ThemedText>Tempo pausado. Continue quando estiver pronto.</ThemedText>
      <ActionButton title="Retomar treino" disabled={!current} onPress={() => { session.resume(); replacePreview('execucao', exercise.id); }} />
      <ActionButton title="Encerrar treino" outlined disabled={!current} onPress={() => openPreview('encerramento', exercise.id)} />
    </>;
    case 'encerramento': return <>
      <ThemedText type="title">Encerrar antes do fim?</ThemedText>
      <ThemedText>Você poderá consultar o resumo do que realizou nesta sessão.</ThemedText>
      {notice}
      <ActionButton title="Continuar treino" disabled={!current || session.pending} onPress={() => { session.resume(); replacePreview('execucao', exercise.id); }} />
      <ActionButton title="Encerrar e ver resumo" outlined loading={session.pending} disabled={!current} onPress={() => void finish()} />
    </>;
    case 'conclusao': return <>
      <Artwork name="star" width={88} />
      <ThemedText type="title">Mais um movimento.{'\n'}Mais um passo.</ThemedText>
      {notice}
      <ThemedText>Confirme a finalização para consultar o resumo desta sessão.</ThemedText>
      <ActionButton title="Finalizar e ver resumo" disabled={!current} loading={session.pending} onPress={() => void finish()} />
      <ActionButton title="Fechar" outlined onPress={closePreview} />
    </>;
  }
}

function ExerciseMaterial({ exercise }: { exercise: Exercise }) {
  const theme = useTheme();
  const [failed, setFailed] = useState(false);
  return <View style={[styles.material, { borderColor: theme.border, backgroundColor: theme.surface }]}>
    {exercise.gifUrl && !failed ? <Image source={{ uri: exercise.gifUrl }} onError={() => setFailed(true)} style={styles.gif} contentFit="contain" accessibilityLabel={`Demonstração de ${exercise.name}`} /> :
      <><Artwork name="person" width={70} height={90} /><ThemedText type="technical">DEMONSTRAÇÃO VISUAL INDISPONÍVEL</ThemedText></>}
  </View>;
}
const styles = StyleSheet.create({
  row: { minHeight: 64, flexDirection: 'row', gap: Spacing.two, alignItems: 'center', borderBottomWidth: 1, paddingVertical: Spacing.two },
  grow: { flex: 1, minWidth: 0 },
  material: { minHeight: 170, borderWidth: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.three, gap: Spacing.three },
  gif: { width: '100%', height: 200 }, track: { height: 8 },
  timer: { fontFamily: Fonts.bold, fontSize: 64, lineHeight: 76, textAlign: 'center' },
});
