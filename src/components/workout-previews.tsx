import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';
import { ActionButton } from '@/components/action-button';
import { Artwork } from '@/components/artwork';
import { ThemedText } from '@/components/themed-text';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatDuration, type DashboardData, type Exercise } from '@/utils/dashboard';
import { closePreview, openPreview, replacePreview } from '@/utils/preview-navigation';

export type WorkoutPreviewName = 'criar-treino' | 'exercicio' | 'treino' | 'execucao' | 'pausa' | 'encerramento' | 'conclusao';

export function WorkoutPreview({ screen, data, id }: { screen: WorkoutPreviewName; data: DashboardData; id?: string }) {
  const theme = useTheme();
  if (screen === 'criar-treino') {
    const { goal, exerciseCategories, availableMinutesPerDay } = data.profile;
    return <>
      <ThemedText type="title">Seu treino, do seu jeito</ThemedText>
      <ThemedText>O treino será montado automaticamente com as preferências do seu cadastro.</ThemedText>
      <ThemedText type="label" accent>Preferências de exemplo</ThemedText>
      <ThemedText>Meta: {goal}{'\n'}Modalidades: {exerciseCategories.join(', ')}{'\n'}Tempo disponível: {availableMinutesPerDay} min/dia</ThemedText>
      <ThemedText type="technical">A criação automática ficará disponível quando o serviço de treinos estiver conectado.</ThemedText>
      <ActionButton title="Voltar ao treino do dia" outlined onPress={closePreview} />
    </>;
  }

  const exercises = data.workout.exercises;
  const index = id ? exercises.findIndex(item => item.id === id) : 0;
  const exercise = exercises[index];
  if (!exercise) return <ThemedText>Exercício não encontrado nesta prévia.</ThemedText>;

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
      <ActionButton title="Visualizar execução" icon="dumbbell" onPress={() => openPreview('execucao', exercises[0].id)} />
      <ThemedText type="technical">Abre uma sequência de telas ilustrativas. Não inicia nem registra um treino real.</ThemedText>
    </>;
    case 'exercicio': return <>
      <ThemedText type="title">{exercise.name}</ThemedText>
      <ExerciseMaterial exercise={exercise} />
      <ThemedText>{exercise.description}</ThemedText>
      <ThemedText type="label">Informações do exercício</ThemedText>
      <ThemedText>Modalidade: {exercise.category}{'\n'}Grupos: {exercise.muscles.join(', ')}{'\n'}Tempo estimado: {formatDuration(exercise.estimatedSeconds)}</ThemedText>
      <ActionButton title="Ver na execução" onPress={() => openPreview('execucao', exercise.id)} />
    </>;
    case 'execucao': return <>
      <ThemedText type="technical" accent>EXERCÍCIO {index + 1} DE {exercises.length} · PRÉVIA</ThemedText>
      <View style={[styles.track, { backgroundColor: theme.field }]}>
        <View style={{ height: '100%', width: `${(index + 1) / exercises.length * 100}%`, backgroundColor: theme.accent }} />
      </View>
      <ThemedText type="title">{exercise.name}</ThemedText>
      <ExerciseMaterial exercise={exercise} />
      <ThemedText style={[styles.timer, { color: theme.accent }]}>{formatDuration(exercise.estimatedSeconds)}</ThemedText>
      <ThemedText type="technical">TEMPORIZADOR ILUSTRATIVO · NÃO ESTÁ CONTANDO</ThemedText>
      <ActionButton title="Visualizar pausa" outlined onPress={() => openPreview('pausa', exercise.id)} />
      <ActionButton title={index + 1 < exercises.length ? 'Próximo exercício' : 'Ver prévia de conclusão'}
        onPress={() => index + 1 < exercises.length ? replacePreview('execucao', exercises[index + 1].id) : replacePreview('conclusao')} />
      <ActionButton title="Exercício anterior" outlined onPress={index > 0 ? () => replacePreview('execucao', exercises[index - 1].id) : undefined} />
      <ActionButton title="Visualizar encerramento" outlined onPress={() => openPreview('encerramento', exercise.id)} />
    </>;
    case 'pausa': return <>
      <Artwork name="stripes" width={80} />
      <ThemedText type="title">Respire.{ '\n' }A gente espera.</ThemedText>
      <ThemedText>{exercise.name} · {index + 1} de {exercises.length}</ThemedText>
      <ThemedText>Esta tela representa a pausa de uma sessão. Nenhum cronômetro está ativo nesta prévia.</ThemedText>
      <ActionButton title="Retomar prévia" onPress={() => replacePreview('execucao', exercise.id)} />
      <ActionButton title="Ver encerramento" outlined onPress={() => openPreview('encerramento', exercise.id)} />
    </>;
    case 'encerramento': {
      const partial = data.history.find(session => session.status === 'ended');
      return <>
        <ThemedText type="title">Encerrar antes do fim?</ThemedText>
        <ThemedText>No fluxo real, o resumo mostrará o que foi realizado, mas o treino incompleto não aumentará sua sequência.</ThemedText>
        <ThemedText type="technical">NENHUMA SESSÃO SERÁ ENCERRADA OU SALVA NESTA PRÉVIA.</ThemedText>
        <ActionButton title="Voltar à prévia do exercício" onPress={() => replacePreview('execucao', exercise.id)} />
        <ActionButton title="Ver resumo parcial" outlined onPress={partial ? () => replacePreview('sessao', partial.id) : undefined} />
      </>;
    }
    case 'conclusao': {
      const completed = data.history.find(session => session.status === 'completed');
      return <>
        <Artwork name="star" width={88} />
        <ThemedText type="title">Mais um movimento.{ '\n' }Mais um passo.</ThemedText>
        <ThemedText type="label" accent>Exemplo de treino concluído</ThemedText>
        <ThemedText>Esta é a prévia da confirmação de conclusão. Nenhum treino foi registrado e a sequência não foi alterada.</ThemedText>
        <ActionButton title="Ver resumo completo" onPress={completed ? () => replacePreview('sessao', completed.id) : undefined} />
        <ActionButton title="Fechar prévia" outlined onPress={closePreview} />
      </>;
    }
  }
}

function ExerciseMaterial({ exercise }: { exercise: Exercise }) {
  const theme = useTheme();
  return <View style={[styles.material, { borderColor: theme.border, backgroundColor: theme.surface }]}>
    {exercise.gifUrl ? <Image source={{ uri: exercise.gifUrl }} style={styles.gif} contentFit="contain" accessibilityLabel={`Demonstração de ${exercise.name}`} /> :
      <><Artwork name="person" width={70} height={90} /><ThemedText type="technical">GIF/IMAGENS AINDA NÃO FORNECIDOS</ThemedText></>}
  </View>;
}
const styles = StyleSheet.create({
  row: { minHeight: 64, flexDirection: 'row', gap: Spacing.two, alignItems: 'center', borderBottomWidth: 1, paddingVertical: Spacing.two },
  grow: { flex: 1, minWidth: 0 }, material: { minHeight: 170, borderWidth: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.three, gap: Spacing.three },
  gif: { width: '100%', height: 200 }, track: { height: 8 }, timer: { fontFamily: Fonts.bold, fontSize: 64, lineHeight: 76, textAlign: 'center' },
});
