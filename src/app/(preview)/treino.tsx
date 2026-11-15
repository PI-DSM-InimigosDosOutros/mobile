import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { ActionButton } from '@/components/action-button';
import { Artwork } from '@/components/artwork';
import { DashboardEmpty, DashboardScreen, SectionHeading } from '@/components/dashboard-screen';
import { ThemedText } from '@/components/themed-text';
import { Fonts, Spacing } from '@/constants/theme';
import { useDashboard } from '@/hooks/use-dashboard';
import { useTheme } from '@/hooks/use-theme';
import { formatDate, formatDuration, workoutLabel, exerciseLabel, exerciseDescription, type DailyWorkout } from '@/utils/dashboard';
import { openPreview } from '@/utils/preview-navigation';

export default function TodayScreen() {
  const { data, loading, error, refresh } = useDashboard();
  const { exercicio } = useLocalSearchParams<{ exercicio?: string }>();
  return <DashboardScreen>
    <ActionButton title="Criar treino" icon="dumbbell" disabled={!data} onPress={() => openPreview('criar-treino')} />
    {loading && <ThemedText accessibilityLiveRegion="polite">Carregando seu treino...</ThemedText>}
    {Boolean(error) && <ThemedText accessibilityRole="alert">{error}</ThemedText>}
    {Boolean(error) && <ActionButton title="Tentar novamente" outlined loading={loading} onPress={() => void refresh()} />}
    {data && data.workout.exercises.length > 0 ? <WorkoutOverview workout={data.workout} availableMinutes={data.profile.availableMinutesPerDay} exerciseId={exercicio} /> :
      data ? <ThemedText>Seu próximo movimento começa aqui. Toque em Criar treino para preparar sua sequência.</ThemedText> :
      <DashboardEmpty title="Primeiro vamos ajustar seu treino pra você!" description="Preencha seu perfil e escolha como quer começar." />}
  </DashboardScreen>;
}

function WorkoutOverview({ workout, availableMinutes, exerciseId }: { workout: DailyWorkout; availableMinutes: number; exerciseId?: string }) {
  const theme = useTheme();
  const index = Math.max(0, workout.exercises.findIndex(item => item.id === exerciseId));
  const exercise = workout.exercises[index];
  const duration = workout.exercises.reduce((sum, item) => sum + item.estimatedSeconds, 0);
  const categories = [...new Set(workout.exercises.map(item => item.category))];
  const muscles = [...new Set(workout.exercises.flatMap(item => item.muscles))];
  return <View style={styles.section}>
    <SectionHeading title={workoutLabel(workout.title)} />
    <ThemedText type="technical">TREINO DO DIA · {formatDate(workout.date)}</ThemedText>
    <View style={styles.tags}>{categories.map(category => <View key={category} style={[styles.tag, { backgroundColor: theme.accent }]}>
      <ThemedText type="technical" style={{ color: theme.onAccent }}>{category.toUpperCase()}</ThemedText>
    </View>)}</View>
    <View style={styles.metrics}>
      <View style={[styles.metric, { borderColor: theme.border }]}><ThemedText type="title" accent>{formatDuration(duration)}</ThemedText><ThemedText type="technical">TEMPO ESTIMADO</ThemedText></View>
      <View style={[styles.metric, { borderColor: theme.border }]}><ThemedText type="title">{workout.exercises.length.toString().padStart(2, '0')}</ThemedText><ThemedText type="technical">EXERCÍCIOS</ThemedText></View>
    </View>
    <ThemedText type="technical">Grupos: {muscles.join(' · ')}{availableMinutes > 0 ? `\nDisponibilidade: ${availableMinutes} min/dia.` : ''}</ThemedText>
    <View style={styles.sequence}>
      <Pressable accessibilityRole="button" accessibilityLabel="Exercício anterior" disabled={index === 0} aria-disabled={index === 0}
        onPress={() => router.setParams({ exercicio: workout.exercises[index - 1].id })}
        style={[styles.sequenceButton, { borderColor: theme.border, opacity: index === 0 ? 0.4 : 1 }]}>
        <ThemedText type="technical">ANTERIOR</ThemedText>
      </Pressable>
      <View style={styles.sequenceCount}>
        <ThemedText type="technical" accent accessibilityLiveRegion="polite">{String(index + 1).padStart(2, '0')} / {String(workout.exercises.length).padStart(2, '0')}</ThemedText>
        <View style={styles.dots}>{workout.exercises.map((item, position) => <View key={item.id} style={[styles.dot, { borderColor: theme.accent, backgroundColor: index === position ? theme.accent : 'transparent' }]} />)}</View>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Próximo exercício" disabled={index === workout.exercises.length - 1} aria-disabled={index === workout.exercises.length - 1}
        onPress={() => router.setParams({ exercicio: workout.exercises[index + 1].id })}
        style={[styles.sequenceButton, { borderColor: theme.border, opacity: index === workout.exercises.length - 1 ? 0.4 : 1 }]}>
        <ThemedText type="technical">PRÓXIMO</ThemedText>
      </Pressable>
    </View>
    <View style={[styles.exercise, { backgroundColor: theme.field }]}>
      <View style={styles.exerciseText}>
        <ThemedText type="label" accessibilityRole="header" style={{ color: theme.onField }}>{exerciseLabel(exercise.name)}</ThemedText>
        <ThemedText style={[styles.description, { color: theme.onField }]}>{exerciseDescription(exercise)}</ThemedText>
        <ThemedText type="technical" style={{ color: theme.onField }}>{workout.exercises.length - index - 1} exercício(s) após este.</ThemedText>
      </View>
      <View style={[styles.exerciseVisual, { borderColor: theme.border }]}>
        {exercise.gifUrl ? <Image source={{ uri: exercise.gifUrl }} style={styles.gifPreview} contentFit="contain" accessibilityLabel={`Demonstração de ${exerciseLabel(exercise.name)}`} /> :
          <Artwork name="person" width={44} height={50} color={theme.onField} />}
        <ThemedText style={[styles.exerciseTime, { color: theme.onField }]}>{formatDuration(exercise.estimatedSeconds)}</ThemedText>
        <ThemedText type="technical" style={[styles.pending, { color: theme.onField }]}>{exercise.gifUrl ? 'DEMONSTRAÇÃO VISUAL' : 'TEMPO ESTIMADO'}</ThemedText>
      </View>
    </View>
    <ActionButton title="Visualizar exercício" outlined onPress={() => openPreview('exercicio', exercise.id)} />
    <View style={styles.training}><Artwork name="checker" width={74} height={44} /><View style={styles.grow}>
      <ActionButton title="Revisar treino" icon="dumbbell" onPress={() => openPreview('treino')} />
    </View></View>
    <ActionButton title="Visualizar execução" onPress={() => openPreview('execucao', exercise.id)} />
    <ThemedText type="technical">Prepare seu espaço e comece quando estiver pronto. Você pode pausar a qualquer momento.</ThemedText>
  </View>;
}
const styles = StyleSheet.create({
  section: { gap: Spacing.three }, grow: { flex: 1, minWidth: 0 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two }, tag: { paddingHorizontal: Spacing.two, paddingVertical: Spacing.one },
  metrics: { flexDirection: 'row', gap: Spacing.three }, metric: { flex: 1, borderBottomWidth: 1, paddingBottom: Spacing.two },
  sequence: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  sequenceButton: { minHeight: 44, justifyContent: 'center', borderBottomWidth: 1 },
  sequenceCount: { alignItems: 'center', gap: Spacing.two }, dots: { flexDirection: 'row', gap: Spacing.one }, dot: { width: 9, height: 9, borderWidth: 1 },
  exercise: { flexDirection: 'row', padding: Spacing.two, gap: Spacing.two }, exerciseText: { flex: 1, gap: Spacing.two },
  exerciseVisual: { width: 112, alignItems: 'center', justifyContent: 'center', borderLeftWidth: 1, gap: Spacing.one, paddingLeft: Spacing.two },
  description: { fontSize: 14, lineHeight: 20 }, exerciseTime: { fontFamily: Fonts.bold, fontSize: 27, lineHeight: 34 }, pending: { fontSize: 8 },
  gifPreview: { width: 80, height: 70 },
  training: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
});
