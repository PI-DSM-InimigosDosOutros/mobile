import { router } from 'expo-router';

export const previewTitles = {
  dados: 'Dados pessoais', medidas: 'Medidas e atividade', preferencias: 'Preferências de treino',
  metas: 'Metas e modalidades', disponibilidade: 'Disponibilidade', aparencia: 'Personalização',
  configuracoes: 'Configurações', seguranca: 'Acesso e segurança', recuperacao: 'Recuperar acesso',
  ajuda: 'Ajuda com o WorkIn', sobre: 'Sobre o WorkIn', saida: 'Voltar ao login',
  'criar-treino': 'Criar treino', exercicio: 'Detalhes do exercício', treino: 'Treino completo', execucao: 'Execução do treino',
  pausa: 'Treino pausado', encerramento: 'Encerrar treino', conclusao: 'Treino concluído',
  historico: 'Histórico completo', sessao: 'Resumo do treino', filtros: 'Filtros do histórico', sequencia: 'Sua sequência',
} as const;
export type PreviewScreenName = keyof typeof previewTitles;

export function openPreview(tela: PreviewScreenName, id?: string) {
  router.push({ pathname: '/modal', params: { tela, ...(id ? { id } : {}) } });
}

export function replacePreview(tela: PreviewScreenName, id?: string) {
  router.replace({ pathname: '/modal', params: { tela, ...(id ? { id } : {}) } });
}

export function closePreview() {
  if (router.canGoBack()) router.back();
  else router.replace('/(preview)/treino');
}
