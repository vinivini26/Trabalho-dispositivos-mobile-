import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();
export const authRedirectUri = AuthSession.makeRedirectUri({
  scheme: 'rotafit',
  path: 'auth/callback',
});

// Supabase exchanges the Google credentials on the server; PKCE binds the callback
// to this installation. Configure the exact redirect URI in the Supabase dashboard.
export async function signInWithGoogle(): Promise<void> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: authRedirectUri, skipBrowserRedirect: true },
  });
  if (error) throw error;
  if (!data.url) throw new Error('Não foi possível iniciar o login com o Google.');
  const result = await WebBrowser.openAuthSessionAsync(data.url, authRedirectUri);
  if (result.type !== 'success') {
    if (result.type === 'cancel' || result.type === 'dismiss') return;
    throw new Error('O login com o Google não foi concluído.');
  }
  const callback = new URL(result.url);
  const description = callback.searchParams.get('error_description');
  if (description) throw new Error(description);
  const code = callback.searchParams.get('code');
  if (!code) throw new Error('O Google não devolveu uma sessão válida.');
  const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
  if (sessionError) throw sessionError;
}
