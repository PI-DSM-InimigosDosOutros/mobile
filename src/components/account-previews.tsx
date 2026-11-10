import { useState } from 'react';
import * as Axios from 'axios';
import { router } from 'expo-router';
import { View } from 'react-native';
import { AccentPalette } from '@/components/accent-palette';
import { ActionButton } from '@/components/action-button';
import { Artwork } from '@/components/artwork';
import { FormField } from '@/components/form-field';
import { AvailabilityStep, PersonalStep, PhysicalStep, PreferencesStep } from '@/components/registration-steps';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { closePreview, openPreview, type PreviewScreenName } from '@/utils/preview-navigation';
import { profileToDraft, type RegistrationProfile } from '@/utils/registration';

export type AccountPreviewName = 'dados' | 'medidas' | 'preferencias' | 'metas' | 'disponibilidade' | 'aparencia' | 'configuracoes' | 'seguranca' | 'recuperacao' | 'ajuda' | 'sobre' | 'saida';

export function AccountPreview({ screen, profile }: { screen: AccountPreviewName; profile: RegistrationProfile }) {
  
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const handleRecovery = ()=>{
    const body = JSON.stringify({ email: recoveryEmail });
    try {
      Axios.default.post(`${process.env.EXPO_PUBLIC_API_URL}/user/forgot-password`, body, {
        headers: { 'Content-Type': 'application/json' },
      })
        .then((response) => {
          console.log('Password recovery successful:', response.data);
          // Handle successful password recovery, e.g., navigate to the next screen
        })
        .catch((error) => {
          console.error('Password recovery failed:', error.response?.data || error.message);
          // Handle password recovery failure, e.g., show an error message to the user
        });
    } catch (error) {
      console.error('An unexpected error occurred:', error);
      // Handle unexpected errors, e.g., show a generic error message
    }
  }
  
  const draft = profileToDraft(profile);
  switch (screen) {
    case 'dados': return <>
      <PersonalStep draft={draft} />
      <ActionButton title="Ver medidas e atividade" outlined onPress={() => openPreview('medidas')} />
      <ActionButton title="Salvar dados pessoais" />
    </>;
    case 'medidas': return <><PhysicalStep draft={draft} /><ActionButton title="Salvar medidas" /></>;
    case 'metas': return <><PreferencesStep draft={draft} /><ActionButton title="Salvar metas e modalidades" /></>;
    case 'disponibilidade': return <><AvailabilityStep draft={draft} /><ActionButton title="Salvar disponibilidade" /></>;
    case 'preferencias': return <>
      <ThemedText type="title">Seu treino,{ '\n' }seu ritmo.</ThemedText>
      <ThemedText>Confira os grupos de informações usados para personalizar seus próximos treinos.</ThemedText>
      <PreviewLinks items={[
        { title: 'Metas e modalidades', screen: 'metas' }, { title: 'Disponibilidade', screen: 'disponibilidade' },
        { title: 'Medidas e atividade', screen: 'medidas' }, { title: 'Personalização', screen: 'aparencia' },
      ]} />
    </>;
    case 'aparencia': return <>
      <Artwork name="corners" width={70} />
      <ThemedText type="title">Do seu jeito</ThemedText>
      <AccentPalette />
      <Artwork name="checker" width="100%" height={48} />
      <ThemedText>A cor selecionada aparece imediatamente nas telas. Ao recarregar, o aplicativo volta ao verde-lima.</ThemedText>
    </>;
    case 'configuracoes': return <>
      <ThemedText type="title">Ajuste seu espaço</ThemedText>
      <PreviewLinks items={[
        { title: 'Dados pessoais', screen: 'dados' }, { title: 'Preferências de treino', screen: 'preferencias' },
        { title: 'Personalização', screen: 'aparencia' }, { title: 'Acesso e segurança', screen: 'seguranca' },
        { title: 'Ajuda', screen: 'ajuda' }, { title: 'Sobre o WorkIn', screen: 'sobre' },
        { title: 'Voltar ao login', screen: 'saida' },
      ]} />
    </>;
    case 'seguranca': return <>
      <ThemedText type="label">E-mail da conta</ThemedText>
      <FormField label="E-mail" value={profile.email} />
      <ThemedText type="label">Alterar senha</ThemedText>
      <FormField label="Senha atual" placeholder="SENHA ATUAL..." password value="" />
      <FormField label="Nova senha" placeholder="NOVA SENHA..." password value="" />
      <FormField label="Confirmar nova senha" placeholder="CONFIRME A NOVA SENHA..." password value="" />
      <ActionButton title="Atualizar senha" />
      <ActionButton title="Visualizar recuperação de acesso" outlined onPress={() => openPreview('recuperacao')} />
    </>;
    case 'recuperacao': return <>
      <Artwork name="arrow" width={70} />
      <ThemedText type="title">Vamos recuperar seu acesso</ThemedText>
      <ThemedText>Esta é a prévia do formulário de recuperação. Nenhuma mensagem será enviada nesta versão.</ThemedText>
      <FormField label="E-mail da conta" placeholder="SEU E-MAIL..." value={recoveryEmail} onChangeText={setRecoveryEmail} editable />
      <ActionButton title="Enviar instruções" onPress={handleRecovery} />
    </>;
    case 'ajuda': return <>
      <ThemedText type="title">Como funciona?</ThemedText>
      <ThemedText type="label">01 · Seu perfil</ThemedText>
      <ThemedText>Dados pessoais, medidas, metas, modalidades e disponibilidade compõem o cadastro.</ThemedText>
      <ThemedText type="label">02 · Seu treino</ThemedText>
      <ThemedText>Treino do dia apresenta a sequência, a duração estimada e os grupos musculares. As telas de execução são apenas prévias.</ThemedText>
      <ThemedText type="label">03 · Seu progresso</ThemedText>
      <ThemedText>Treinos anteriores diferencia sessões concluídas e encerradas manualmente. Os dados exibidos aqui são ilustrativos.</ThemedText>
      <ActionButton title="Entender a sequência" outlined onPress={() => openPreview('sequencia')} />
    </>;
    case 'sobre': return <>
      <Artwork name="logo" width={157} height={124} label="WorkIn" />
      <ThemedText type="title">Seu espaço.{ '\n' }Seu movimento.</ThemedText>
      <ThemedText>WorkIn é um projeto acadêmico de aplicativo para treinos personalizados em casa.</ThemedText>
      <ThemedText>Esta versão permite conhecer a identidade e os fluxos visuais do projeto. Cadastro, autenticação e treinos reais serão integrados posteriormente.</ThemedText>
      <ThemedText type="technical" accent>VERSÃO EM DESENVOLVIMENTO</ThemedText>
    </>;
    case 'saida': return <>
      <ThemedText type="title">Voltar ao início?</ThemedText>
      <ThemedText>Nenhuma conta está conectada nesta prévia. Você pode voltar ao login ou continuar explorando as telas.</ThemedText>
      <ActionButton title="Continuar nas telas" onPress={closePreview} />
      <ActionButton title="Voltar ao login" outlined onPress={() => router.dismissTo('/')} />
    </>;
  }
}

function PreviewLinks({ items }: { items: { title: string; screen: PreviewScreenName }[] }) {
  return <View style={{ gap: Spacing.two }}>
    {items.map(item => <ActionButton key={item.screen} title={item.title} outlined onPress={() => openPreview(item.screen)} />)}
  </View>;
}
