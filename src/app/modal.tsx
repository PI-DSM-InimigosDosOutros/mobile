import { useLocalSearchParams } from 'expo-router';
import { AccountPreview } from '@/components/account-previews';
import { HistoryPreview } from '@/components/history-previews';
import { PreviewModal } from '@/components/preview-modal';
import { ThemedText } from '@/components/themed-text';
import { WorkoutPreview } from '@/components/workout-previews';
import { useDashboard } from '@/hooks/use-dashboard';
import { previewTitles } from '@/utils/preview-navigation';

export default function ModalScreen() {
  const { data } = useDashboard();
  const params = useLocalSearchParams<{ tela?: string; id?: string }>();
  const screen = typeof params.tela === 'string' && Object.hasOwn(previewTitles, params.tela) ? params.tela as keyof typeof previewTitles : null;
  const id = typeof params.id === 'string' ? params.id : undefined;
  if (!data && (screen === 'recuperacao' || screen === 'aparencia' || screen === 'sobre' || screen === 'ajuda')) {
    return <PreviewModal title={previewTitles[screen]}><AccountPreview screen={screen} /></PreviewModal>;
  }
  if (!data) return <PreviewModal title="Entre na sua conta"><ThemedText>Entre na sua conta ou abra a demonstração para acessar esta tela.</ThemedText></PreviewModal>;
  let content;
  switch (screen) {
    case 'dados': case 'medidas': case 'preferencias': case 'metas': case 'disponibilidade': case 'aparencia':
    case 'configuracoes': case 'seguranca': case 'recuperacao': case 'ajuda': case 'sobre': case 'saida':
      content = <AccountPreview screen={screen} profile={data.profile} />;
      break;
    case 'criar-treino': case 'exercicio': case 'treino': case 'execucao': case 'pausa': case 'encerramento': case 'conclusao':
      content = <WorkoutPreview screen={screen} data={data} id={id} />;
      break;
    case 'historico': case 'sessao': case 'filtros': case 'sequencia':
      content = <HistoryPreview screen={screen} data={data} id={id} />;
      break;
    default:
      content = <ThemedText>Esta visualização não foi encontrada. Feche o painel para voltar.</ThemedText>;
  }
  return <PreviewModal title={screen ? previewTitles[screen] : 'Visualização indisponível'}>{content}</PreviewModal>;
}
