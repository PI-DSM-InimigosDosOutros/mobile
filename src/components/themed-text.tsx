import { StyleSheet, Text, type TextProps } from 'react-native';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = TextProps & { type?: 'body' | 'title' | 'label' | 'technical'; accent?: boolean };
export function ThemedText({ type = 'body', accent, style, ...props }: Props) {
  const theme = useTheme();
  return (
    <Text {...props} style={[styles.base, styles[type], { color: accent ? theme.accent : theme.text }, style]} />
  );
}
const styles = StyleSheet.create({
  base: { fontFamily: Fonts.sans },
  body: { fontSize: 16, lineHeight: 24 },
  title: { fontFamily: Fonts.bold, fontSize: 34, lineHeight: 40, textTransform: 'uppercase' },
  label: { fontFamily: Fonts.bold, fontSize: 16, lineHeight: 22, textTransform: 'uppercase' },
  technical: { fontFamily: Fonts.mono, fontSize: 10, lineHeight: 16, letterSpacing: 0.2 },
});
