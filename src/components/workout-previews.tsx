import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { ActionButton } from '@/components/action-button';
import { Artwork } from '@/components/artwork';
import { ThemedText } from '@/components/themed-text';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useDashboard } from '@/hooks/use-dashboard';
import { useState } from 'react';
import { formatDuration, workoutLabel, exerciseLabel, exerciseDescription, type DashboardData, type Exercise } from '@/utils/dashboard';
import { closePreview, openPreview, replacePreview } from '@/utils/preview-navigation';

export type WorkoutPreviewName = 'criar-treino' | 'exercicio' | 'treino' | 'execucao' | 'pausa' | 'encerramento' | 'conclusao';

export function WorkoutPreview({ screen, data, id }: { screen: WorkoutPreviewName; data: DashboardData; id?: string }) {
  const theme = useTheme();
  const dashboard = useDashboard();
  const session = dashboard.practice;
  const current = session.practice;
  const [message, setMessage] = useState('');
  const [creating, setCreating] = useState(false);
  const [reviewIndex, setReviewIndex] = useState<number | null>(null);
  const [resumeAfterReview, setResumeAfterReview] = useState(false);
  const notice = session.error ? <ThemedText accessibilityRole="alert">{session.error}</ThemedText> : null;
  async function finish(completed = false) {
    const result = await session.finish();
    if (result) { dashboard.keepSummary(result); replacePreview(completed ? 'conclusao' : 'sessao', result.id); }
  }
  async function train() {
    if (current) {
      session.resume();
      replacePreview('execucao', exercises[current.index]?.id);
    } else if (await session.begin()) replacePreview('execucao');
  }
  function review(position: number) {
    if (!current) return;
    if (position >= current.index) {
      setReviewIndex(null);
      if (resumeAfterReview) session.resume();
    } else {
      if (reviewIndex === null) { setResumeAfterReview(current.runningSince !== null); session.pause(); }
      setReviewIndex(position);
    }
  }
  if (screen === 'criar-treino') {
    const { goal, exerciseCategories, availableMinutesPerDay } = data.profile;
    return <>
      <ThemedText type="title">Seu treino, do seu jeito</ThemedText>
      <ThemedText>O treino será montado automaticamente com as preferências do seu cadastro.</ThemedText>
      <ThemedText type="label" accent>Suas preferências</ThemedText>
      <ThemedText>Meta: {goal || 'Ainda não informada'}{'\n'}Modalidades: {exerciseCategories.join(', ') || 'Ainda não informadas'}{'\n'}Tempo disponível: {availableMinutesPerDay > 0 ? `${availableMinutesPerDay} min/dia` : 'Ainda não informado'}</ThemedText>
      <ActionButton title="Criar meu treino" loading={creating} disabled={Boolean(current)} onPress={async () => {
        setCreating(true); setMessage('');
        try { await dashboard.createWorkout(); closePreview(); }
        catch (error) { setMessage(error instanceof Error ? error.message : 'Não foi possível criar o treino.'); }
        finally { setCreating(false); }
      }} />
      {Boolean(current) && <ThemedText>Encerre o treino em andamento antes de criar outro.</ThemedText>}
      {Boolean(message) && <ThemedText accessibilityRole="alert">{message}</ThemedText>}
      <ActionButton title="Voltar ao treino do dia" outlined onPress={closePreview} />
    </>;
  }

  const exercises = data.workout.exercises;
  if (screen === 'conclusao') {
    const summary = id ? data.history.find(item => item.id === id) : session.summary;
    return <>
      <Artwork name="star" width={88} />
      <ThemedText type="title">Mais um movimento.{'\n'}Mais um passo.</ThemedText>
      <ThemedText>{summary ? 'Treino concluído. Confira o resumo da sua prática.' : dashboard.loading ? 'Carregando seu resumo...' : 'Consulte os resultados da sua prática em Treinos anteriores.'}</ThemedText>
      <ActionButton title="Ver resumo completo" disabled={!summary} onPress={() => replacePreview('sessao', summary!.id)} />
      <ActionButton title="Voltar ao treino do dia" outlined onPress={() => router.dismissTo('/(preview)/treino')} />
    </>;
  }
  const executionScreen = ['execucao', 'pausa', 'encerramento', 'conclusao'].includes(screen);
  const index = screen === 'execucao' && reviewIndex !== null ? reviewIndex
    : executionScreen && current ? current.index : id ? exercises.findIndex(item => item.id === id) : 0;
  const reviewing = screen === 'execucao' && current && index !== current.index;
  const exercise = exercises[index];
  if (!exercise) return <ThemedText>Não há exercício disponível. Volte ao treino do dia e atualize a consulta.</ThemedText>;

  switch (screen) {
    case 'treino': return <>
      <ThemedText type="title">{workoutLabel(data.workout.title)}</ThemedText>
      <ThemedText>{exercises.length} exercícios · {formatDuration(exercises.reduce((sum, item) => sum + item.estimatedSeconds, 0))} estimados</ThemedText>
      {exercises.map((item, position) => <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={`Ver exercício ${exerciseLabel(item.name)}`}
        onPress={() => openPreview('exercicio', item.id)} style={[styles.row, { borderColor: theme.border }]}>
        <ThemedText type="technical" accent>{String(position + 1).padStart(2, '0')}</ThemedText>
        <View style={styles.grow}><ThemedText type="label">{exerciseLabel(item.name)}</ThemedText><ThemedText type="technical">{item.muscles.join(' · ')}</ThemedText></View>
        <ThemedText type="technical">{formatDuration(item.estimatedSeconds)}</ThemedText>
      </Pressable>)}
      {notice}
      <ActionButton title={current ? 'Continuar treino' : 'Treinar'} icon="dumbbell" loading={session.pending} onPress={() => void train()} />
    </>;
    case 'exercicio': return <>
      <ThemedText type="title" accessibilityRole="header">{exerciseLabel(exercise.name)}</ThemedText>
      <ExerciseMaterial key={exercise.id} exercise={exercise} />
      <ThemedText>{exerciseDescription(exercise)}</ThemedText>
      <ThemedText type="label">Informações do exercício</ThemedText>
      <ThemedText>Modalidade: {exercise.category}{'\n'}Grupos: {exercise.muscles.join(', ')}{'\n'}Tempo estimado: {formatDuration(exercise.estimatedSeconds)}</ThemedText>
      {notice}
      <ActionButton title={current ? 'Continuar treino' : 'Treinar'} loading={session.pending} onPress={() => void train()} />
    </>;
    case 'execucao': return <>
      <ThemedText type="technical" accent>EXERCÍCIO {index + 1} DE {exercises.length}</ThemedText>
      <View style={[styles.track, { backgroundColor: theme.field }]}>
        <View style={{ height: '100%', width: `${(index + 1) / exercises.length * 100}%`, backgroundColor: theme.accent }} />
      </View>
      <ThemedText type="title" accessibilityRole="header">{exerciseLabel(exercise.name)}</ThemedText>
      <ExerciseMaterial key={exercise.id} exercise={exercise} />
      <ThemedText style={[styles.timer, { color: theme.accent }]}>{formatDuration(current ? Math.max(0, exercise.estimatedSeconds - (reviewing ? current.durations[index] : session.elapsed)) : exercise.estimatedSeconds)}</ThemedText>
      <ThemedText type="technical">{reviewing ? 'EXERCÍCIO CONCLUÍDO · TREINO PAUSADO DURANTE A CONSULTA' : current ? 'TEMPO DECORRIDO: ' + formatDuration(session.elapsed) : 'TEMPO ESTIMADO · PRONTO PARA COMEÇAR?'}</ThemedText>
      {notice}
      {!current ? <ActionButton title="Treinar" loading={session.pending} onPress={() => void session.begin()} /> : reviewing ? <>
        <ActionButton title="Próximo exercício" onPress={() => review(index + 1)} />
        <ActionButton title="Exercício anterior" outlined disabled={index === 0} onPress={() => review(index - 1)} />
        <ActionButton title="Voltar ao exercício atual" outlined onPress={() => review(current.index)} />
      </> : <>
        <ActionButton title={current.runningSince === null ? 'Retomar treino' : 'Pausar treino'} outlined disabled={session.pending}
          onPress={() => { if (current.runningSince === null) session.resume(); else { session.pause(); replacePreview('pausa', exercise.id); } }} />
        <ActionButton title={index + 1 < exercises.length ? 'Próximo exercício' : 'Concluir treino'} loading={session.pending}
          disabled={Boolean(session.error) && !dashboard.isDemo}
          onPress={async () => { if (current.completed.every(Boolean) || await session.advance()) await finish(true); }} />
        <ActionButton title="Exercício anterior" outlined disabled={index === 0 || session.pending} onPress={() => review(index - 1)} />
        <ActionButton title="Encerrar treino" outlined disabled={session.pending} onPress={() => { session.pause(); replacePreview('encerramento', exercise.id); }} />
      </>}
      {Boolean(session.error) && !dashboard.isDemo && <ActionButton title="Consultar progresso novamente" outlined onPress={() => { session.reset(); void dashboard.refresh(); }} />}
    </>;
    case 'pausa': return <>
      <Artwork name="stripes" width={80} />
      <ThemedText type="title">Respire.{'\n'}A gente espera.</ThemedText>
      <ThemedText>{exerciseLabel(exercise.name)} · {index + 1} de {exercises.length}</ThemedText>
      <ThemedText>Tempo pausado. Continue quando estiver pronto.</ThemedText>
      <ActionButton title="Retomar treino" disabled={!current} onPress={() => { session.resume(); replacePreview('execucao', exercise.id); }} />
      <ActionButton title="Encerrar treino" outlined disabled={!current} onPress={() => replacePreview('encerramento', exercise.id)} />
    </>;
    case 'encerramento': return <>
      <ThemedText type="title">Encerrar antes do fim?</ThemedText>
      <ThemedText>Você poderá consultar o resumo do que realizou nesta sessão.</ThemedText>
      {notice}
      <ActionButton title="Continuar treino" disabled={!current || session.pending} onPress={() => { session.resume(); replacePreview('execucao', exercise.id); }} />
      <ActionButton title="Encerrar e ver resumo" outlined loading={session.pending} disabled={!current} onPress={() => void finish()} />
    </>;
  }
}

function ExerciseMaterial({ exercise }: { exercise: Exercise }) {
  const theme = useTheme();
  const [failed, setFailed] = useState(false);
  return <View style={[styles.material, { borderColor: theme.border, backgroundColor: theme.surface }]}>
    {exercise.gifUrl && !failed ? <Image source={{ uri: exercise.gifUrl }} onError={() => setFailed(true)} style={styles.gif} contentFit="contain" accessibilityLabel={`Demonstração de ${exerciseLabel(exercise.name)}`} /> :
      <><Artwork name="person" width={70} height={90} /><ThemedText type="technical">{exercise.category.toUpperCase()} · {exercise.muscles.join(' / ')}</ThemedText></>}
  </View>;
}
const styles = StyleSheet.create({
  row: { minHeight: 64, flexDirection: 'row', gap: Spacing.two, alignItems: 'center', borderBottomWidth: 1, paddingVertical: Spacing.two },
  grow: { flex: 1, minWidth: 0 },
  material: { minHeight: 170, borderWidth: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.three, gap: Spacing.three },
  gif: { width: '100%', height: 200 }, track: { height: 8 },
  timer: { fontFamily: Fonts.bold, fontSize: 64, lineHeight: 76, textAlign: 'center' },
});
