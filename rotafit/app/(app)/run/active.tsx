import { useEffect } from 'react';
import { usePreventRemove } from 'expo-router/react-navigation';
import type { SaveRunInput } from '@/types';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { Alert } from '@/utils/alert';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GlassSurface, glassShadow } from '@/components/glass/GlassSurface';
import { RoutePath } from '@/components/RoutePath';
import { SpotifyPlayerCard } from '@/components/spotify/SpotifyPlayerCard';
import { useNowPlaying } from '@/hooks/useSpotifyPlayer';
import { useRunTracker } from '@/hooks/useRunTracker';
import { useSaveRun } from '@/hooks/useRuns';
import { radius, spacing, useTheme } from '@/theme';
import { friendlyError } from '@/utils/errors';
import { formatDistance, formatDuration, formatPace } from '@/utils/geo';

// Tela cheia (sem abas), porque a corrida precisa da atenção do usuário: o
// mapa e os números ocupam o centro, e Pausar/Retomar/Finalizar ficam sempre
// visíveis, em vidro, por cima do traçado.
export default function ActiveRunScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const tracker = useRunTracker();
  const saveRun = useSaveRun();
  const { data: nowPlaying } = useNowPlaying();
  const [starting, setStarting] = useState(false);

  const [pendingInput, setPendingInput] = useState<SaveRunInput | null>(null);
  const [destination, setDestination] = useState<string | null>(null);
  usePreventRemove(
    !destination &&
      (tracker.status === 'active' ||
        tracker.status === 'paused' ||
        (tracker.status === 'finished' && Boolean(pendingInput))),
    () => {
      Alert.alert(
        'Corrida em andamento',
        'Finalize ou descarte a corrida antes de sair.',
      );
    },
  );
  useEffect(() => {
    if (destination) router.replace(destination);
  }, [destination, router]);

  async function handleResume() {
    try {
      await tracker.resume();
    } catch (error) {
      Alert.alert('Não foi possível retomar', friendlyError(error));
    }
  }
  function persist(input: SaveRunInput) {
    setPendingInput(input);
    saveRun.mutate(input, {
      onSuccess: (id) => setDestination(`/run/${id}`),
      onError: (error) => Alert.alert('Não foi possível salvar', friendlyError(error)),
    });
  }
  async function handleStart() {
    setStarting(true);
    try {
      const ok = await tracker.start();
      if (!ok)
        Alert.alert(
          'Permissão de localização necessária',
          'Ative a localização nas configurações do aparelho.',
        );
    } catch (error) {
      Alert.alert('Não foi possível iniciar', friendlyError(error));
    } finally {
      setStarting(false);
    }
  }

  function handleFinish() {
    Alert.alert('Finalizar corrida', 'Deseja encerrar e salvar esta corrida?', [
      { text: 'Continuar correndo', style: 'cancel' },
      {
        text: 'Finalizar',
        style: 'destructive',
        onPress: () => {
          const input = tracker.finish(
            nowPlaying?.name ? `${nowPlaying.name} — ${nowPlaying.artist}` : null,
          );
          if (!input) return;
          persist(input);
        },
      },
    ]);
  }

  function handleDiscard() {
    Alert.alert('Descartar corrida', 'Os dados desta corrida serão perdidos.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Descartar',
        style: 'destructive',
        onPress: () => {
          tracker.reset();
          setDestination('/');
        },
      },
    ]);
  }

  if (tracker.status === 'idle') {
    return (
      <Screen scroll edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.center}>
          <Ionicons name="walk" size={64} color={theme.primary} />
          <Text style={[styles.readyTitle, { color: theme.text }]}>
            Pronto para começar?
          </Text>
          <Text style={[styles.readyText, { color: theme.muted }]}>
            Vamos usar sua localização para acompanhar a rota, a distância e o ritmo em
            tempo real.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={handleStart}
            disabled={starting}
            style={styles.startWrap}
          >
            <GlassSurface
              tint={theme.primary}
              radius={radius.pill}
              style={[styles.startBtn, glassShadow(theme.primary)]}
              opacity={0.94}
            >
              <Text style={[styles.startText, { color: theme.onPrimary }]}>
                {starting ? 'Localizando...' : 'Começar corrida'}
              </Text>
            </GlassSurface>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => router.back()}>
            <Text style={[styles.cancel, { color: theme.muted }]}>Cancelar</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll edges={['top', 'bottom', 'left', 'right']}>
      <RoutePath route={tracker.route} height={280} live />

      <View style={styles.stats}>
        <GlassSurface radius={radius.lg} style={styles.statsCard}>
          <Stat label="Distância" value={formatDistance(tracker.distanceMeters)} big />
          <View style={styles.statsRow}>
            <Stat label="Tempo" value={formatDuration(tracker.elapsedSeconds)} />
            <Stat label="Ritmo" value={formatPace(tracker.pace)} />
          </View>
        </GlassSurface>

        {tracker.locationError && (
          <Text accessibilityRole="alert" style={{ color: theme.danger }}>
            {tracker.locationError}
          </Text>
        )}
        <SpotifyPlayerCard />

        <View style={styles.controls}>
          {tracker.status === 'active' ? (
            <ControlButton
              icon="pause"
              label="Pausar"
              onPress={tracker.pause}
              tint={theme.primary}
            />
          ) : tracker.status === 'paused' ? (
            <ControlButton
              icon="play"
              label="Retomar"
              onPress={handleResume}
              tint={theme.primary}
            />
          ) : null}
          {tracker.status !== 'finished' && (
            <ControlButton
              icon="stop"
              label="Finalizar"
              onPress={handleFinish}
              tint={theme.danger}
            />
          )}
        </View>
        {tracker.status === 'paused' && (
          <Text style={{ color: theme.muted }}>
            Corrida pausada. Retome para continuar registrando o GPS.
          </Text>
        )}
        {pendingInput && (
          <Button
            title={saveRun.isPending ? 'Salvando...' : 'Tentar salvar novamente'}
            disabled={saveRun.isPending}
            onPress={() => persist(pendingInput)}
          />
        )}
        <Pressable
          disabled={saveRun.isPending}
          accessibilityRole="button"
          onPress={handleDiscard}
        >
          <Text style={[styles.discard, { color: theme.muted }]}>Descartar corrida</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

function Stat({ label, value, big }: { label: string; value: string; big?: boolean }) {
  const { theme } = useTheme();
  return (
    <View style={styles.stat}>
      <Text style={[big ? styles.statBig : styles.statValue, { color: theme.text }]}>
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: theme.muted }]}>{label}</Text>
    </View>
  );
}

function ControlButton({
  icon,
  label,
  onPress,
  tint,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  tint: string;
}) {
  const { theme } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={styles.controlWrap}
    >
      <GlassSurface
        tint={tint}
        radius={radius.pill}
        style={[styles.controlBtn, glassShadow(tint)]}
        opacity={0.94}
      >
        <Ionicons name={icon} size={28} color={theme.onPrimary} />
      </GlassSurface>
      <Text style={[styles.controlLabel, { color: theme.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  readyTitle: { fontSize: 24, fontWeight: '800', marginTop: spacing.md },
  readyText: { fontSize: 15, textAlign: 'center' },
  startWrap: { marginTop: spacing.lg, alignSelf: 'stretch' },
  startBtn: { minHeight: 56, alignItems: 'center', justifyContent: 'center' },
  startText: { fontSize: 17, fontWeight: '800' },
  cancel: { marginTop: spacing.md, fontSize: 15 },
  screen: { flex: 1 },
  stats: { padding: spacing.md, gap: spacing.md, marginTop: spacing.md },
  statsCard: { padding: spacing.lg, gap: spacing.sm },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statBig: { fontSize: 44, fontWeight: '800', textAlign: 'center' },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 12, marginTop: 2 },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
    marginTop: spacing.sm,
  },
  controlWrap: { alignItems: 'center', gap: 6 },
  controlBtn: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center' },
  controlLabel: { fontSize: 13, fontWeight: '600' },
  discard: { textAlign: 'center', marginTop: spacing.sm, fontSize: 14 },
});
