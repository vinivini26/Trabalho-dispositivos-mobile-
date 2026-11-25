import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_KEY;

export const isSupabaseConfigured = Boolean(
  url && /^https?:\/\//.test(url) && key && key !== 'SUA-CHAVE-ANON-OU-PUBLISHABLE',
);

export const supabase = createClient(
  isSupabaseConfigured ? url! : 'http://127.0.0.1:54321',
  isSupabaseConfigured ? key! : 'not-configured',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: isSupabaseConfigured,
      persistSession: isSupabaseConfigured,
      detectSessionInUrl: false,
    },
  },
);

// Renova o token só enquanto o app está em primeiro plano.
AppState.addEventListener('change', (state) => {
  if (!isSupabaseConfigured) return;
  if (state === 'active') supabase.auth.startAutoRefresh();
  else supabase.auth.stopAutoRefresh();
});
