import { Text, View, StyleSheet } from 'react-native';
import { isSupabaseConfigured } from '@/lib/supabase';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { queryClient } from '@/lib/queryClient';

export default function RootLayout() {
  if (!isSupabaseConfigured)
    return (
      <View style={setup.container}>
        <Text style={setup.brand}>MarketGo</Text>
        <Text style={setup.title}>Vamos conectar sua loja</Text>
        <Text style={setup.text}>
          Configure a URL e a chave pública do Supabase no arquivo .env. Execute
          schema.sql e seed.sql no SQL Editor e reinicie o Expo.
        </Text>
        <Text style={setup.note}>
          O passo a passo está no README. Pagamentos e entregas são simulados neste
          projeto acadêmico.
        </Text>
      </View>
    );
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }} />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

const setup = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#F6F9F7',
    gap: 18,
  },
  brand: { color: '#16734A', fontSize: 40, fontWeight: '800' },
  title: { color: '#172A21', fontSize: 24, fontWeight: '700' },
  text: { color: '#334C40', fontSize: 17, lineHeight: 26 },
  note: { color: '#52645A', fontSize: 14, lineHeight: 22 },
});
