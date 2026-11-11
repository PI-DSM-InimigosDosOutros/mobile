import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { Artwork } from '@/components/artwork';
import { ThemedText } from '@/components/themed-text';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = Omit<TextInputProps, 'onFocus' | 'onBlur'> & {
  label: string; error?: string; password?: boolean; required?: boolean; tone?: 'neutral' | 'accent'; decorated?: boolean;
};
export function FormField({ label, error, password, required = true, tone = 'neutral', decorated = true, ...props }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.group}>
      <View style={[styles.label, { borderBottomColor: theme.border }]}>
        {required && <Artwork name="star" width={9} color={theme.text} />}
        <ThemedText type="label" style={styles.labelText}>{label}</ThemedText>
      </View>
      <View style={styles.decoratedRow}>
        <View style={[styles.fieldFrame, { backgroundColor: theme.surface }]}>
          <View style={[styles.row, { backgroundColor: tone === 'accent' ? theme.accent : theme.field, borderColor: error ? theme.error : theme.border }]}>
            <TextInput {...props} editable={props.editable ?? false} accessibilityLabel={label} accessibilityHint={error || props.accessibilityHint} secureTextEntry={password}
              aria-invalid={Boolean(error)} aria-required={required}
              placeholderTextColor={theme.placeholder} selectionColor={theme.onField}
              style={[styles.input, props.multiline && styles.multiline, { color: theme.onField }]} />
            {password && (
              <View style={styles.toggle} accessible={false}>
                <Artwork name="eyeOff" width={23} height={22} color={theme.onField} />
              </View>
            )}
          </View>
        </View>
        {decorated && <Artwork name="stripes" width={30} height={36} />}
      </View>
      {error && <ThemedText accessibilityLiveRegion="polite" style={{ color: theme.error, fontSize: 14 }}>{error}</ThemedText>}
    </View>
  );
}
const styles = StyleSheet.create({
  group: { gap: Spacing.one },
  label: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, borderBottomWidth: 1, paddingBottom: Spacing.one },
  labelText: { fontSize: 15, lineHeight: 20 },
  decoratedRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  fieldFrame: { flex: 1, padding: Spacing.one },
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: 1 },
  input: { flex: 1, minWidth: 0, minHeight: 44, paddingHorizontal: Spacing.two, fontFamily: Fonts.mono, fontSize: 12 },
  multiline: { minHeight: 96, textAlignVertical: 'top', paddingVertical: Spacing.two },
  toggle: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});
