import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { Text, View } from 'react-native';
import { isSupabaseConfigured } from '@/lib/supabase';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/context/AuthContext';
import { queryClient } from '@/lib/queryClient';

export default function RootLayout() {
  if (!isSupabaseConfigured) {
    return (
      <View
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}
      >
        <Text accessibilityRole="header" style={{ fontSize: 24, fontWeight: '700' }}>
          ChatRoom
        </Text>
        <Text style={{ marginTop: 12, textAlign: 'center' }}>
          Configure a URL e a chave pública do Supabase no arquivo .env e reinicie o Expo.
        </Text>
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </QueryClientProvider>
  );
}
