import { ConfigurationScreen } from '@/components/ConfigurationScreen';
import { isSupabaseConfigured } from '@/lib/supabase';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { SpotifyProvider } from '@/context/SpotifyContext';
import { ThemeProvider, useTheme } from '@/theme';
import { queryClient } from '@/lib/queryClient';

function Chrome({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <>
      <StatusBar style={theme.statusBar} />
      {children}
    </>
  );
}

function SpotifySession({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return <SpotifyProvider key={user?.id ?? 'signed-out'}>{children}</SpotifyProvider>;
}

export default function RootLayout() {
  if (!isSupabaseConfigured)
    return (
      <ThemeProvider>
        <ConfigurationScreen />
      </ThemeProvider>
    );
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <SpotifySession>
            <Chrome>
              <Stack screenOptions={{ headerShown: false }} />
            </Chrome>
          </SpotifySession>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
