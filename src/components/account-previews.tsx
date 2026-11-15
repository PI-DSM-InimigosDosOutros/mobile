import { useRef, useState } from 'react';
import { recoverPassword, changePassword } from '@/services/api';
import { useDashboard } from '@/hooks/use-dashboard';
import { useTheme } from '@/hooks/use-theme';
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
import { initialRegistration, profileToDraft, toProfilePatch, validateRegistrationStep, passwordRequirements, type RegistrationErrors, type RegistrationProfile } from '@/utils/registration';

export type AccountPreviewName = 'dados' | 'medidas' | 'preferencias' | 'metas' | 'disponibilidade' | 'aparencia' | 'configuracoes' | 'seguranca' | 'recuperacao' | 'ajuda' | 'sobre' | 'saida';

export function AccountPreview({ screen, profile }: { screen: AccountPreviewName; profile?: RegistrationProfile }) {
  
  const dashboard = useDashboard();
  const theme = useTheme();
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [draft, setDraft] = useState(() => profile ? profileToDraft(profile) : initialRegistration);
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  const busy = useRef(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');

  async function handleRecovery() {
    if (busy.current) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recoveryEmail.trim())) { setMessage('Informe um e-mail válido.'); return; }
    busy.current = true;
    setPending(true);
    setMessage('');
    try {
      await recoverPassword(recoveryEmail);
      setMessage('Se o e-mail estiver cadastrado, você receberá as instruções de recuperação.');
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : 'Não foi possível solicitar a recuperação.'); }
    finally { busy.current = false; setPending(false); }
  }

  async function savePreview(step: number) {
    if (busy.current) return;
    const value = { ...draft, accentColor: theme.accent };
    const validation = validateRegistrationStep(value, step);
    setErrors(validation);
    if (Object.keys(validation).length) { setMessage('Revise os campos indicados.'); return; }
    busy.current = true; setPending(true);
    try {
      await dashboard.updateDemoProfile(toProfilePatch(value, step));
      setMessage('Alterações salvas.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Não foi possível salvar suas alterações.'); }
    finally { busy.current = false; setPending(false); }
  }
  const editProps = {
    draft, errors,
    onChange: (patch: Partial<typeof draft>) => { setDraft(current => ({ ...current, ...patch })); setMessage(''); },
  };
  const feedback = <>
    {Boolean(message) && <ThemedText accessibilityRole="alert">{message}</ThemedText>}
  </>;
  switch (screen) {
    case 'dados': return <>
      <PersonalStep {...editProps} />{feedback}
      <ActionButton title="Ver medidas e atividade" outlined onPress={() => openPreview('medidas')} />
      <ActionButton title="Salvar alterações" loading={pending} onPress={() => savePreview(0)} />
    </>;
    case 'medidas': return <><PhysicalStep {...editProps} />{feedback}<ActionButton title="Salvar alterações" loading={pending} onPress={() => savePreview(1)} /></>;
    case 'metas': return <><PreferencesStep {...editProps} />{feedback}<ActionButton title="Salvar alterações" loading={pending} onPress={() => savePreview(2)} /></>;
    case 'disponibilidade': return <><AvailabilityStep {...editProps} />{feedback}<ActionButton title="Salvar alterações" loading={pending} onPress={() => savePreview(3)} /></>;
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
      <ThemedText>Escolha a cor que combina com seu ritmo. Seu estilo acompanha cada tela.</ThemedText>
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
      <FormField label="E-mail" value={profile?.email ?? ''} />
      <ThemedText type="label">Alterar senha</ThemedText>
      <FormField label="Senha atual" placeholder="SENHA ATUAL..." password editable={!dashboard.isDemo} value={currentPassword} onChangeText={setCurrentPassword} />
      <FormField label="Nova senha" placeholder="NOVA SENHA..." password editable={!dashboard.isDemo} value={newPassword} onChangeText={setNewPassword} />
      <FormField label="Confirmar nova senha" placeholder="CONFIRME A NOVA SENHA..." password editable={!dashboard.isDemo} value={confirmation} onChangeText={setConfirmation} />
      {!dashboard.isDemo && <ActionButton title="Alterar senha" loading={pending} onPress={async () => {
        if (busy.current) return;
        if (!currentPassword || newPassword !== confirmation || passwordRequirements(newPassword).some(rule => !rule.met)) {
          setMessage('Confira a senha atual, os requisitos da nova senha e a confirmação.'); return;
        }
        busy.current = true; setPending(true); setMessage('');
        try { await changePassword(currentPassword, newPassword); setMessage('Senha atualizada.'); setCurrentPassword(''); setNewPassword(''); setConfirmation(''); }
        catch (error) { setMessage(error instanceof Error ? error.message : 'Não foi possível alterar sua senha.'); }
        finally { busy.current = false; setPending(false); }
      }} />}{feedback}
      <ThemedText type="technical">Para redefinir sua senha, solicite as instruções por e-mail.</ThemedText>
      <ActionButton title="Recuperar acesso" outlined onPress={() => openPreview('recuperacao')} />
    </>;
    case 'recuperacao': return <>
      <Artwork name="arrow" width={70} />
      <ThemedText type="title">Vamos recuperar seu acesso</ThemedText>
      <ThemedText>Informe o e-mail da sua conta para solicitar as instruções de recuperação.</ThemedText>
      <FormField label="E-mail da conta" placeholder="SEU E-MAIL..." value={recoveryEmail} onChangeText={setRecoveryEmail} editable />
      <ActionButton title="Enviar instruções" loading={pending} loadingTitle="Solicitando..." onPress={handleRecovery} />{feedback}
    </>;
    case 'ajuda': return <>
      <ThemedText type="title">Como funciona?</ThemedText>
      <ThemedText type="label">01 · Seu perfil</ThemedText>
      <ThemedText>Dados pessoais, medidas, metas, modalidades e disponibilidade compõem o cadastro.</ThemedText>
      <ThemedText type="label">02 · Seu treino</ThemedText>
      <ThemedText>Treino do dia apresenta a sequência, a duração estimada e os grupos musculares. Confirme o início para acompanhar o tempo, pausar e concluir cada exercício.</ThemedText>
      <ThemedText type="label">03 · Seu progresso</ThemedText>
      <ThemedText>Consulte seus treinos anteriores, confira o tempo de prática e acompanhe sua sequência. Sessões concluídas e encerradas antes do fim aparecem separadamente.</ThemedText>
      <ActionButton title="Entender a sequência" outlined onPress={() => openPreview('sequencia')} />
    </>;
    case 'sobre': return <>
      <Artwork name="logo" width={157} height={124} label="WorkIn" />
      <ThemedText type="title">Seu espaço.{ '\n' }Seu movimento.</ThemedText>
      <ThemedText>WorkIn é um projeto acadêmico de aplicativo para treinos personalizados em casa.</ThemedText>
      <ThemedText>Organize sua rotina, acompanhe cada exercício e celebre seus movimentos. Um treino de cada vez, no seu ritmo.</ThemedText>
      <ThemedText type="technical" accent>WORKIN · SEU ESPAÇO DE TREINO</ThemedText>
    </>;
    case 'saida': return <>
      <ThemedText type="title">Voltar ao início?</ThemedText>
      <ThemedText>Deseja sair agora? Você poderá voltar e continuar sua jornada.</ThemedText>
      <ActionButton title="Continuar treinando" onPress={closePreview} />
      <ActionButton title="Sair da conta" outlined loading={pending} onPress={async () => {
        if (busy.current) return;
        busy.current = true;
        setPending(true);
        try { await dashboard.logout(); router.dismissTo('/'); }
        catch { setMessage('Não foi possível remover a sessão. Tente novamente.'); }
        finally { busy.current = false; setPending(false); }
      }} />{feedback}
    </>;
  }
}

function PreviewLinks({ items }: { items: { title: string; screen: PreviewScreenName }[] }) {
  return <View style={{ gap: Spacing.two }}>
    {items.map(item => <ActionButton key={item.screen} title={item.title} outlined onPress={() => openPreview(item.screen)} />)}
  </View>;
}
