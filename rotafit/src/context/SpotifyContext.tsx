import { Alert } from '@/utils/alert';
import { queryClient } from '@/lib/queryClient';
import { useAuth } from '@/context/AuthContext';
import { friendlyError } from '@/utils/errors';
import * as AuthSession from 'expo-auth-session';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { deleteSecureItem, getSecureItem, setSecureItem } from '@/lib/secureStore';
import { SPOTIFY_SCOPES, spotifyClientId, spotifyDiscovery } from '@/lib/spotify';
import type { SpotifyTokens } from '@/types';

const STORE_PREFIX = 'rotafit.spotify.tokens.';

interface SpotifyContextValue {
  tokens: SpotifyTokens | null;
  connecting: boolean;
  connect: () => void;
  disconnect: () => Promise<void>;
  getValidAccessToken: () => Promise<string | null>;
}

const SpotifyContext = createContext<SpotifyContextValue | undefined>(undefined);

const redirectUri = AuthSession.makeRedirectUri({
  scheme: 'rotafit',
  path: 'spotify-auth',
});

async function saveTokens(key: string, tokens: SpotifyTokens) {
  await setSecureItem(key, JSON.stringify(tokens));
}

async function loadTokens(key: string): Promise<SpotifyTokens | null> {
  const raw = await getSecureItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SpotifyTokens;
  } catch {
    return null;
  }
}

// Login e controle de sessão do Spotify. Usa PKCE (sem client secret) e guarda
// os tokens no SecureStore do aparelho — são credenciais de terceiro, mais
// sensíveis que uma preferência qualquer, por isso não vão no AsyncStorage.
export function SpotifyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const storeKey = STORE_PREFIX + (user?.id ?? 'signed-out');
  const [tokens, setTokens] = useState<SpotifyTokens | null>(null);
  const [connecting, setConnecting] = useState(false);
  const refreshing = useRef<Promise<string | null> | null>(null);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    { clientId: spotifyClientId, scopes: SPOTIFY_SCOPES, redirectUri, usePKCE: true },
    spotifyDiscovery,
  );

  useEffect(() => {
    let live = true;
    loadTokens(storeKey)
      .then((loaded) => {
        if (live) setTokens(loaded);
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [storeKey]);

  useEffect(() => {
    if (response?.type !== 'success' || !request?.codeVerifier) {
      if (response && response.type !== 'success') {
        setConnecting(false);
        if (response.type === 'error')
          Alert.alert('Spotify', 'Não foi possível conectar. Tente novamente.');
      }
      return;
    }
    setConnecting(true);
    AuthSession.exchangeCodeAsync(
      {
        clientId: spotifyClientId,
        code: response.params.code,
        redirectUri,
        extraParams: { code_verifier: request.codeVerifier },
      },
      spotifyDiscovery,
    )
      .then(async (result) => {
        const next: SpotifyTokens = {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken ?? '',
          expiresAt: Date.now() + (result.expiresIn ?? 3600) * 1000,
        };
        await saveTokens(storeKey, next);
        setTokens(next);
      })
      .catch((error) => Alert.alert('Spotify', friendlyError(error)))
      .finally(() => setConnecting(false));
  }, [response, request, storeKey]);

  const connect = useCallback(() => {
    if (!spotifyClientId || spotifyClientId.includes('SEU-')) {
      Alert.alert(
        'Spotify indisponível',
        'Configure o Client ID do Spotify conforme o README.',
      );
      return;
    }
    if (!request) {
      Alert.alert('Spotify', 'Aguarde um instante e tente novamente.');
      return;
    }
    setConnecting(true);
    promptAsync()
      .then((result) => {
        if (result.type !== 'success') setConnecting(false);
      })
      .catch((error) => {
        setConnecting(false);
        Alert.alert('Spotify', friendlyError(error));
      });
  }, [promptAsync, request]);

  const disconnect = useCallback(async () => {
    await deleteSecureItem(storeKey);
    queryClient.removeQueries({ queryKey: ['spotify'] });
    setTokens(null);
  }, [storeKey]);

  // Renova o token de acesso quando falta menos de um minuto para expirar, e
  // devolve um token pronto para uso (ou null, se não há conta conectada).
  const getValidAccessToken = useCallback(async (): Promise<string | null> => {
    if (!tokens) return null;
    if (tokens.expiresAt - Date.now() > 60_000) return tokens.accessToken;
    if (!refreshing.current) {
      refreshing.current = AuthSession.refreshAsync(
        { clientId: spotifyClientId, refreshToken: tokens.refreshToken },
        spotifyDiscovery,
      )
        .then(async (result) => {
          const next: SpotifyTokens = {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken ?? tokens.refreshToken,
            expiresAt: Date.now() + (result.expiresIn ?? 3600) * 1000,
          };
          await saveTokens(storeKey, next);
          setTokens(next);
          return next.accessToken;
        })
        .catch(async () => {
          // Refresh token revogado ou expirado: peça para conectar de novo.
          await disconnect();
          return null;
        })
        .finally(() => {
          refreshing.current = null;
        });
    }
    return refreshing.current;
  }, [tokens, disconnect, storeKey]);

  const value = useMemo(
    () => ({ tokens, connecting, connect, disconnect, getValidAccessToken }),
    [tokens, connecting, connect, disconnect, getValidAccessToken],
  );

  return <SpotifyContext.Provider value={value}>{children}</SpotifyContext.Provider>;
}

export function useSpotify(): SpotifyContextValue {
  const context = useContext(SpotifyContext);
  if (!context) throw new Error('useSpotify deve ser usado dentro de <SpotifyProvider>');
  return context;
}
