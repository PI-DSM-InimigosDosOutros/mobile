import { Redirect } from 'expo-router';
import { Tabs, TabList, TabTrigger, TabSlot } from 'expo-router/ui';
import { StyleSheet } from 'react-native';
import { useDashboard } from '@/hooks/use-dashboard';
import { ThemedText } from '@/components/themed-text';

export default function PreviewLayout() {
  const { ready, session, isDemo } = useDashboard();
  if (!ready) return <ThemedText>Recuperando sua sessão...</ThemedText>;
  if (!session && !isDemo) return <Redirect href="/" />;
  return (
    <Tabs style={styles.root} options={{ backBehavior: 'history' }}>
      <TabList style={styles.hidden} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <TabTrigger name="today" href="/(preview)/treino" />
        <TabTrigger name="history" href="/(preview)/anteriores" />
        <TabTrigger name="account" href="/(preview)/conta" />
      </TabList>
      <TabSlot style={styles.slot} />
    </Tabs>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, minHeight: 0 },
  slot: { flex: 1, flexShrink: 1, minHeight: 0 },
  hidden: { display: 'none' },
});
