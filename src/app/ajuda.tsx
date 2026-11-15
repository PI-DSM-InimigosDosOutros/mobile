import { router } from 'expo-router';
import { ActionButton } from '@/components/action-button';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';

export default function HelpScreen() {
  return <Screen code="user: help">
    <ThemedText type="title">Precisa de <ThemedText type="title" accent>ajuda?</ThemedText></ThemedText>
    <ThemedText type="label">Seu primeiro passo</ThemedText>
    <ThemedText>Você pode preencher as cinco etapas do cadastro, navegar pelos três menus principais e acompanhar a execução de exercícios.</ThemedText>
    <ThemedText type="label">Acesso à conta</ThemedText>
    <ThemedText>Entre com seu e-mail e senha. Se precisar redefinir sua senha, toque em “Esqueci minha senha” na tela de entrada.</ThemedText>
    <ThemedText type="label">Conheça as telas principais</ThemedText>
    <ThemedText>Em Treino do dia, confira a sequência e comece quando estiver pronto. Pause sempre que precisar. Ao finalizar, consulte seu resumo em Treinos anteriores.</ThemedText>
    <ThemedText type="label">Cor do aplicativo</ThemedText>
    <ThemedText>Escolha sua cor no cadastro ou em Conta → Personalização. A mudança acompanha todas as telas.</ThemedText>
    <ActionButton title="Voltar ao login" outlined onPress={() => router.dismissTo('/')} />
  </Screen>;
}
