import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  label: string;
  options: string[];
  selected: string[];
  onSelect?: (value: string) => void;
  multiple?: boolean;
  disabled?: boolean;
  error?: string;
};

export function ChoiceGroup({ label, options, selected, onSelect, multiple, disabled, error }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.group}>
      <ThemedText type="label">{label}</ThemedText>
      <View style={styles.options} accessibilityRole={multiple ? undefined : 'radiogroup'} accessibilityLabel={label}>
        {options.map(option => {
          const active = selected.includes(option);
          return (
            <Pressable key={option} accessibilityRole={multiple ? 'checkbox' : 'radio'} accessibilityLabel={option}
              aria-checked={active} aria-disabled={disabled || !onSelect}
              accessibilityState={{ checked: active, disabled: disabled || !onSelect }} disabled={disabled || !onSelect} onPress={() => onSelect?.(option)}
              style={({ pressed }) => [styles.option, { borderColor: active ? theme.accent : theme.border, backgroundColor: active ? theme.accent : theme.surface, opacity: pressed || disabled ? 0.6 : 1 }]}>
              <ThemedText style={[styles.text, { color: active ? theme.onAccent : theme.text }]}>{active ? '✓ ' : ''}{option}</ThemedText>
            </Pressable>
          );
        })}
      </View>
      {error && <ThemedText accessibilityLiveRegion="polite" style={{ color: theme.error, fontSize: 14 }}>{error}</ThemedText>}
    </View>
  );
}
const styles = StyleSheet.create({
  group: { gap: Spacing.two },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  option: { minHeight: 44, borderWidth: 1, padding: Spacing.two, justifyContent: 'center' },
  text: { fontSize: 13, lineHeight: 20 },
});
