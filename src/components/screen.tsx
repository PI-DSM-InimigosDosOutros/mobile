import type { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Artwork } from '@/components/artwork';
import { ThemedText } from '@/components/themed-text';
import { Decoration, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = PropsWithChildren<{ code: string; includeTopInset?: boolean; registrationStep?: number; dashboard?: boolean }>;

export function Screen({ children, code, includeTopInset = true, registrationStep, dashboard }: Props) {
  const theme = useTheme();
  return (
    <SafeAreaView edges={includeTopInset ? ['top', 'bottom', 'left', 'right'] : ['bottom', 'left', 'right']}
      style={[styles.safe, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView testID="screen-scroll" style={styles.safe} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag" contentInsetAdjustmentBehavior="never" alwaysBounceVertical={false}>
          <View style={styles.content}>
            <View pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
              style={styles.watermark}>
              <Artwork name="star" width="100%" height="100%" color={theme.text} />
            </View>
            <View style={[styles.header, { borderColor: theme.border }]}>
              <View style={styles.marks}>
                <Artwork name={dashboard ? 'globe' : registrationStep === undefined ? 'symbol' : 'circle'} width={18} color={theme.accent} />
                <Artwork name="star" width={16} color={theme.accent} />
                <Artwork name="star" width={13} color={registrationStep !== undefined && registrationStep >= 2 ? theme.accent : theme.text} />
                <Artwork name="star" width={13} color={registrationStep !== undefined && registrationStep >= 3 ? theme.accent : theme.textSecondary} />
              </View>
              <ThemedText type="technical" accent>{dashboard ? '02' : registrationStep === undefined ? '01' : '00'} {'//'}</ThemedText>
              <ThemedText type="technical" accent style={[styles.terminal, { backgroundColor: theme.background }]}>...</ThemedText>
            </View>
            <View style={styles.body}>{children}</View>
            <View style={[styles.footer, { borderColor: theme.border }]}>
              <View style={styles.marks}>
                <Artwork name="star" width={10} />
                <Artwork name="star" width={8} color={theme.text} />
                <Artwork name="star" width={8} color={theme.textSecondary} />
              </View>
              <ThemedText type="technical" accent>{'// '}{code}</ThemedText>
            </View>
            <ThemedText type="technical" style={[styles.bottomDetail, { color: theme.textSecondary }]}>{'... —'}</ThemedText>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, minHeight: 0 }, scroll: { flexGrow: 1, alignItems: 'center' },
  content: { width: '100%', maxWidth: MaxContentWidth, flexGrow: 1, paddingHorizontal: Spacing.four, overflow: 'hidden' },
  watermark: { position: 'absolute', width: '120%', aspectRatio: 1, top: 110, left: '22%', opacity: Decoration.watermarkOpacity },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, paddingVertical: Spacing.three, gap: Spacing.two },
  terminal: { position: 'absolute', bottom: -6, right: 0, paddingLeft: Spacing.one },
  marks: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  body: { flexGrow: 1, paddingVertical: Spacing.three, gap: Spacing.three },
  footer: { borderBottomWidth: 1, paddingVertical: Spacing.two, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bottomDetail: { fontSize: 9, paddingBottom: Spacing.two },
});
