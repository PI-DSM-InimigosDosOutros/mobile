import { useFocusEffect } from 'expo-router';
import { useCallback, type PropsWithChildren } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Artwork } from '@/components/artwork';
import { ThemedText } from '@/components/themed-text';
import { Decoration, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { closePreview } from '@/utils/preview-navigation';

export function PreviewModal({ title, children }: PropsWithChildren<{ title: string }>) {
  const theme = useTheme();
  useFocusEffect(useCallback(() => {
    if (Platform.OS !== 'web') return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); closePreview(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []));

  return (
    <SafeAreaView style={[styles.overlay, { backgroundColor: theme.backdrop }]}>
      <Pressable style={StyleSheet.absoluteFill} onPress={closePreview} accessible={false} focusable={false} />
      <View role="dialog" aria-modal accessibilityLabel={title} accessibilityViewIsModal onAccessibilityEscape={closePreview}
        style={[styles.panel, { backgroundColor: theme.background, borderColor: theme.accent }]}>
        <View pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.watermark}>
          <Artwork name="star" width="100%" height="100%" color={theme.text} />
        </View>
        <View style={[styles.header, { borderColor: theme.border }]}>
          <Artwork name="star" width={20} />
          <ThemedText type="label" accessibilityRole="header" style={styles.title}>{title}</ThemedText>
          <Pressable accessibilityRole="button" accessibilityLabel="Fechar visualização" onPress={closePreview} style={styles.close}>
            <ThemedText type="technical" accent>FECHAR ×</ThemedText>
          </Pressable>
        </View>
        <ScrollView testID="preview-modal-scroll" style={styles.scroll} contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled" contentInsetAdjustmentBehavior="never" alwaysBounceVertical={false}>
          <ThemedText type="technical" accent>PRÉVIA VISUAL · DADOS ILUSTRATIVOS</ThemedText>
          <ThemedText type="technical">Os campos não são editáveis e as ações não salvam dados. A cor de destaque continua ativa.</ThemedText>
          {children}
          <ThemedText type="technical" accent style={styles.footer}>{'// WorkIn: preview'}</ThemedText>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  overlay: { flex: 1, minHeight: 0, alignItems: 'center', justifyContent: 'center', padding: Spacing.three },
  panel: { flex: 1, minHeight: 0, width: '100%', maxWidth: MaxContentWidth, maxHeight: '96%', borderWidth: 1, overflow: 'hidden' },
  watermark: { position: 'absolute', width: '120%', aspectRatio: 1, top: 110, left: '22%', opacity: Decoration.watermarkOpacity },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, borderBottomWidth: 1, paddingHorizontal: Spacing.three },
  title: { flex: 1, minWidth: 0 }, close: { minHeight: 52, minWidth: 66, alignItems: 'flex-end', justifyContent: 'center' },
  scroll: { flex: 1, minHeight: 0 }, content: { padding: Spacing.three, gap: Spacing.three },
  footer: { marginTop: Spacing.three, paddingBottom: Spacing.two },
});
