import { Pressable, StyleSheet, View } from 'react-native';
import { Artwork } from '@/components/artwork';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = { title: string; onPress?: () => void; outlined?: boolean; icon?: 'arrow' | 'dumbbell'; disabled?: boolean; loading?: boolean };
export function ActionButton({ title, onPress, outlined, icon = 'arrow', disabled, loading }: Props) {
  const theme = useTheme();
  const color = outlined ? theme.accent : theme.onAccent;
  const inactive = Boolean(disabled || loading || !onPress);
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={loading ? 'Enviando cadastro' : title}
      aria-disabled={inactive} aria-busy={loading}
      accessibilityState={{ disabled: inactive, busy: loading }} disabled={inactive}
      onPress={onPress} style={({ pressed }) => [styles.button, {
      borderColor: theme.accent, backgroundColor: outlined ? 'transparent' : theme.accent, opacity: pressed || disabled || loading ? 0.6 : 1,
    }]}>
      <View style={[styles.line, { borderColor: color }]}>
        <ThemedText type="label" style={[styles.title, { color }]}>{loading ? 'Enviando...' : title}</ThemedText>
        <View style={icon === 'dumbbell' && styles.dumbbell}>
          <Artwork name={icon} width={20} height={24} color={color} />
        </View>
      </View>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  button: { minHeight: 48, borderWidth: 2, paddingHorizontal: Spacing.two, paddingVertical: Spacing.one, justifyContent: 'center' },
  line: { borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  title: { flexShrink: 1, letterSpacing: 0.5 },
  dumbbell: { transform: [{ rotate: '35deg' }] },
});
