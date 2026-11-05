import { router } from 'expo-router';
import { ActionButton } from '@/components/action-button';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';

export default function HelpScreen() {
  return <Screen code="user: help">
    <ThemedText type="title">Precisa de <ThemedText type="title" accent>ajuda?</ThemedText></ThemedText>
    <ThemedText type="label">Sobre esta versão</ThemedText>
    <ThemedText>Esta versão apresenta os layouts do WorkIn. Você pode navegar pelas cinco etapas do cadastro, pelos três menus principais e pelas prévias de configurações, treino e histórico.</ThemedText>
    <ThemedText type="label">Acesso à conta</ThemedText>
    <ThemedText>Os campos estão somente para visualização. Login, cadastro, recuperação de senha e envio de dados ainda não estão ativos.</ThemedText>
    <ThemedText type="label">Conheça as telas principais</ThemedText>
    <ThemedText>Treino do dia, Treinos anteriores e Conta usam dados ilustrativos. Os painéis podem ser abertos e fechados, mas edição, filtros e execução real de treinos ainda não estão ativos.</ThemedText>
    <ThemedText type="label">Cor do aplicativo</ThemedText>
    <ThemedText>A cor de destaque pode ser alterada no cadastro, na Conta ou no painel de personalização. A escolha permanece durante a navegação e volta ao verde-lima ao recarregar.</ThemedText>
    <ActionButton title="Voltar ao login" outlined onPress={() => router.dismissTo('/')} />
  </Screen>;
}
