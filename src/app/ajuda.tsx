import { router } from 'expo-router';
import { ActionButton } from '@/components/action-button';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';

export default function HelpScreen() {
  return <Screen code="user: help">
    <ThemedText type="title">Precisa de <ThemedText type="title" accent>ajuda?</ThemedText></ThemedText>
    <ThemedText type="label">Sobre esta versão</ThemedText>
    <ThemedText>Você pode preencher as cinco etapas do cadastro, navegar pelos três menus principais e acompanhar a execução de exercícios.</ThemedText>
    <ThemedText type="label">Acesso à conta</ThemedText>
    <ThemedText>Entre com o e-mail e a senha da sua conta. Se precisar, solicite a recuperação de acesso. O cadastro completo ainda aguarda a integração de medidas, preferências e disponibilidade.</ThemedText>
    <ThemedText type="label">Conheça as telas principais</ThemedText>
    <ThemedText>Treino do dia consulta a sequência disponível na sua conta. Inicie, pause e conclua os exercícios para consultar o resumo desta prática. Os filtros funcionam sobre os resumos disponíveis enquanto o app está aberto; o histórico definitivo ainda está em integração.</ThemedText>
    <ThemedText>O acesso de desenvolvimento abre uma demonstração identificada, com exemplos e sem registrar exercícios no servidor.</ThemedText>
    <ThemedText type="label">Cor do aplicativo</ThemedText>
    <ThemedText>A cor de destaque pode ser alterada no cadastro, na Conta ou no painel de personalização. Sua escolha fica salva neste dispositivo.</ThemedText>
    <ActionButton title="Voltar ao login" outlined onPress={() => router.dismissTo('/')} />
  </Screen>;
}
