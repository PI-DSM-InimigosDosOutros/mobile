import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Colors } from '@/constants/theme';
import { DashboardProvider } from '@/hooks/use-dashboard';
import { ThemeProvider } from '@/hooks/use-theme';
import { SessionProvider, useSession } from '@/hooks/use-session';
import { RegistrationProvider } from '@/hooks/use-registration';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'SpaceGrotesk-Regular': require('@/assets/Fonts/Space_Grotesk/static/SpaceGrotesk-Regular.ttf'),
    'SpaceGrotesk-Medium': require('@/assets/Fonts/Space_Grotesk/static/SpaceGrotesk-Medium.ttf'),
    'SpaceGrotesk-Bold': require('@/assets/Fonts/Space_Grotesk/static/SpaceGrotesk-Bold.ttf'),
    'DMMono-Regular': require('@/assets/Fonts/DM_Mono/DMMono-Regular.ttf'),
    'DMMono-Medium': require('@/assets/Fonts/DM_Mono/DMMono-Medium.ttf'),
  });

  useEffect(() => {
    if (loaded || error) void SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <ThemeProvider>
      <SessionProvider>
        <AppNavigation />
      </SessionProvider>
    </ThemeProvider>
  );
}

function AppNavigation() {
  const { session } = useSession();
  return (
    <DashboardProvider key={session?.token ?? 'guest'}>
      <RegistrationProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
          <Stack.Screen name="modal" options={{ presentation: 'transparentModal', animation: 'fade', contentStyle: { backgroundColor: 'transparent' } }} />
        </Stack>
      </RegistrationProvider>
    </DashboardProvider>
  );
}
