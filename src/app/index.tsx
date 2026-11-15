import { useRef, useState } from 'react';
import { router } from 'expo-router';
import { login } from '@/services/api';
import { useSession } from '@/hooks/use-session';
import { useDashboard } from '@/hooks/use-dashboard';
import { Pressable, StyleSheet, View } from 'react-native';
import { ActionButton } from '@/components/action-button';
import { Artwork } from '@/components/artwork';
import { FormField } from '@/components/form-field';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { openPreview } from '@/utils/preview-navigation';

export default function LoginScreen() {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useSession();
  const dashboard = useDashboard();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const sending = useRef(false);
  const loginHandler = async () => {
    if (sending.current) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || !password) {
      setMessage('Informe um e-mail válido e sua senha.');
      return;
    }
    sending.current = true;
    setLoading(true);
    setMessage('');
    try {
      await signIn(await login(email, password));
      dashboard.leaveDemo();
      setPassword('');
      router.replace('/(preview)/treino');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível entrar. Tente novamente.');
    } finally { sending.current = false; setLoading(false); }
  }

  return (
    <Screen code="user:login">
      <View style={styles.heading}>
        <View style={styles.headingTitle}>
          <ThemedText type="title" accessibilityRole="header">LOGI<ThemedText type="title" accent>N</ThemedText></ThemedText>
          <Artwork name="globe" width={23} />
        </View>
        <View style={styles.caption}>
          <ThemedText type="technical" accent style={styles.captionText}>registre-se ou faça login</ThemedText>
          <ThemedText type="technical" style={[styles.captionText, { color: theme.textSecondary }]}>com suas credenciais. {'\\\\'}</ThemedText>
        </View>
      </View>
      <View style={styles.brand}>
        <View style={styles.brandArrow}>
          <Artwork name="arrow" width="100%" height="100%" />
        </View>
        <View style={styles.brandDots} accessible={false}>
          {[0, 1, 2, 3].map((dot) => <View key={dot} style={[styles.dot, { backgroundColor: theme.text }]} />)}
        </View>
        <View style={styles.brandLogo}>
          <Artwork name="logo" width="100%" height="100%" label="WorkIn" />
        </View>
      </View>
      <View style={[styles.divider, { borderColor: theme.border }]}>
        <ThemedText type="technical" style={[styles.instruction, { color: theme.textSecondary }]}>
          insira seus <ThemedText type="technical" accent style={styles.instruction}>dados</ThemedText> abaixo... <ThemedText type="technical" accent style={styles.instruction}>{'//'}</ThemedText>
        </ThemedText>
      </View>
      <View style={styles.fields}>
        <FormField label="Usuário" placeholder="DIGITE SEU E-MAIL..." editable value={email} onChangeText={setEmail} />
        <FormField label="Senha" placeholder="DIGITE SUA SENHA..." editable password value={password} onChangeText={setPassword} />
      </View>
      <View style={styles.helpRow}>
        <Pressable accessibilityRole="link" accessibilityLabel="Esqueci minha senha" onPress={() => openPreview('recuperacao')} style={styles.help}>
          <ThemedText type="label" style={[styles.helpText, styles.underline]}>ESQUECI MINHA <ThemedText type="label" accent style={styles.helpText}>SENHA...</ThemedText></ThemedText>
        </Pressable>
        <Pressable accessibilityRole="link" accessibilityLabel="PRECISA DE AJUDA?" onPress={() => router.push('/ajuda')} style={[styles.help, styles.helpRight]}>
          <View style={[styles.question, { backgroundColor: theme.accent }]}>
            <ThemedText type="technical" style={[styles.questionMark, { color: theme.onAccent }]}>?</ThemedText>
          </View>
          <ThemedText type="label" style={[styles.helpText, styles.underline]}>precisa de <ThemedText type="label" accent style={styles.helpText}>ajuda?</ThemedText></ThemedText>
        </Pressable>
      </View>
      <View style={[styles.separator, { borderColor: theme.border }]} />
      <View style={styles.actions}>
        <View style={styles.signIn}>
          <Artwork name="stripes" width={60} height={60} />
          <View style={styles.grow}>
            <ActionButton title="Entrar" icon="dumbbell" loading={loading} loadingTitle="Entrando..." onPress={loginHandler}/>
          </View>
        </View>
        {Boolean(message) && <ThemedText accessibilityRole="alert" style={{ color: theme.error }}>{message}</ThemedText>}
        <View style={styles.register}>
          <ThemedText type="label" style={styles.registerText}>
            <ThemedText type="label" accent style={styles.registerText}>E SE AINDA NÃO COMEÇOU </ThemedText>SUA EXPERIÊNCIA CONOSCO
          </ThemedText>
          <ActionButton title="Criar conta" outlined onPress={() => router.push('/cadastro')} />
        </View>
      </View>
      {__DEV__ && <Pressable accessibilityRole="link" style={styles.preview} onPress={() => { dashboard.enterDemo(); router.push('/(preview)/treino'); }}>
        <ThemedText type="technical" style={[styles.underline, { color: theme.textSecondary }]}>DESENVOLVIMENTO: PRÉVIA DAS TELAS →</ThemedText>
      </Pressable>}
    </Screen>
  );
}
const styles = StyleSheet.create({
  heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two, flexWrap: 'wrap' },
  headingTitle: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  caption: { flex: 1, minWidth: 130 },
  captionText: { fontSize: 8, lineHeight: 12, textAlign: 'right' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  brandArrow: { flex: 1, aspectRatio: 1 },
  brandDots: { gap: Spacing.three },
  dot: { width: 11, height: 11, borderRadius: 6 },
  brandLogo: { flex: 1.25, aspectRatio: 157 / 124 },
  divider: { borderTopWidth: 1, paddingTop: Spacing.one },
  instruction: { fontSize: 9, lineHeight: 14 },
  fields: { gap: Spacing.three, marginTop: Spacing.two },
  helpRow: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', marginTop: -Spacing.three },
  help: { minHeight: 44, justifyContent: 'center', flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  helpRight: { marginLeft: 'auto' },
  helpText: { fontSize: 9, lineHeight: 14, textTransform: 'none' },
  question: { width: 13, height: 13, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  questionMark: { fontSize: 10, lineHeight: 13 },
  underline: { textDecorationLine: 'underline' },
  separator: { width: '75%', alignSelf: 'center', borderTopWidth: 1, marginBottom: Spacing.two },
  actions: { gap: Spacing.two },
  signIn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  grow: { flex: 1 },
  developmentNotice: { fontSize: 8, lineHeight: 13, textAlign: 'right' },
  register: { gap: Spacing.two, marginTop: Spacing.two },
  registerText: { fontSize: 9, lineHeight: 14 },
  preview: { minHeight: 44, justifyContent: 'center' },
});
