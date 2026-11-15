import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { accentColors } from '@/utils/registration';

type Props = { disabled?: boolean; error?: string };

export function AccentPalette({ disabled, error }: Props) {
  const theme = useTheme();
  const value = theme.accent;
  return (
    <View style={styles.group}>
      <ThemedText type="label">O WorkIn do seu jeito</ThemedText>
      <View style={styles.palette} accessibilityLabel="Cor de destaque" accessibilityRole="radiogroup">
        {accentColors.map(({ name, value: color }) => (
          <Pressable key={color} disabled={disabled} accessibilityRole="radio" accessibilityLabel={name}
            aria-checked={value === color} aria-disabled={disabled}
            accessibilityState={{ checked: value === color, disabled }} onPress={() => theme.setAccentColor(color)}
            style={[styles.color, { backgroundColor: color, borderColor: value === color ? theme.text : theme.background }]}>
            {value === color && <ThemedText style={{ color: theme.onAccent }}>✓</ThemedText>}
          </Pressable>
        ))}
      </View>
      <ThemedText type="technical" accent>Cor selecionada: {accentColors.find(color => color.value === value)?.name}</ThemedText>
      {Boolean(error) && <ThemedText style={{ color: theme.error }}>{error}</ThemedText>}
      {Boolean(theme.persistenceMessage) && <ThemedText accessibilityRole="alert" type="technical">{theme.persistenceMessage}</ThemedText>}
    </View>
  );
}
const styles = StyleSheet.create({
  group: { gap: Spacing.two },
  palette: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.one },
  color: { width: 44, height: 44, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
});
