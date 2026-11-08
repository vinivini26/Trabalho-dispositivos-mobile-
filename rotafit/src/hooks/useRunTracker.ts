import { randomUUID } from 'expo-crypto';
import * as Location from 'expo-location';
import { AppState } from 'react-native';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { averagePaceSecPerKm, simplifyRoute } from '@/utils/geo';
import { elapsedSeconds, initialTrackerState, trackerReducer } from '@/utils/tracker';
import type { SaveRunInput } from '@/types';

export function useRunTracker() {
  const [state, dispatch] = useReducer(trackerReducer, initialTrackerState);
  const [now, setNow] = useState(Date.now);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const subscription = useRef<Location.LocationSubscription | null>(null);
  const generation = useRef(0);
  const pending = useRef(false);
  const savedInput = useRef<SaveRunInput | null>(null);

  const stopWatching = useCallback(() => {
    generation.current += 1;
    subscription.current?.remove();
    subscription.current = null;
  }, []);
  useEffect(() => stopWatching, [stopWatching]);

  useEffect(() => {
    if (state.status !== 'active') return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [state.status]);

  const pause = useCallback(() => {
    stopWatching();
    const at = Date.now();
    setNow(at);
    dispatch({ type: 'PAUSE', now: at });
  }, [stopWatching]);

  // This guide tracks foreground runs only. Pause explicitly when leaving the app
  // instead of reporting time with no GPS coverage as if tracking had continued.
  useEffect(() => {
    const listener = AppState.addEventListener('change', (next) => {
      if (next !== 'active' && state.status === 'active') pause();
    });
    return () => listener.remove();
  }, [state.status, pause]);

  const watch = useCallback(
    async (ticket: number) => {
      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 2000,
          distanceInterval: 5,
        },
        (loc) => {
          if (ticket !== generation.current) return;
          if (loc.coords.accuracy !== null && loc.coords.accuracy > 50) return;
          dispatch({
            type: 'ADD_POINT',
            now: loc.timestamp,
            lat: loc.coords.latitude,
            lng: loc.coords.longitude,
          });
        },
        (reason) => {
          if (ticket !== generation.current) return;
          stopWatching();
          const at = Date.now();
          setNow(at);
          dispatch({ type: 'PAUSE', now: at });
          setLocationError(
            'O GPS foi interrompido. Confira a localização e retome a corrida. ' + reason,
          );
        },
      );
      if (ticket !== generation.current) {
        sub.remove();
        return false;
      }
      subscription.current = sub;
      return true;
    },
    [stopWatching],
  );

  const start = useCallback(async () => {
    if (pending.current || state.status !== 'idle') return false;
    pending.current = true;
    const ticket = ++generation.current;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (ticket !== generation.current) return false;
      if (status !== 'granted') {
        setPermissionDenied(true);
        return false;
      }
      setPermissionDenied(false);
      setLocationError(null);
      if (!(await Location.hasServicesEnabledAsync()))
        throw new Error('Ative o GPS do aparelho e tente novamente.');
      if (!(await watch(ticket))) return false;
      const at = Date.now();
      setNow(at);
      savedInput.current = null;
      dispatch({ type: 'START', now: at });
      return true;
    } catch (error) {
      stopWatching();
      throw error;
    } finally {
      pending.current = false;
    }
  }, [state.status, watch, stopWatching]);

  const resume = useCallback(async () => {
    if (pending.current || state.status !== 'paused') return;
    pending.current = true;
    const ticket = ++generation.current;
    try {
      if (!(await watch(ticket))) return;
      setLocationError(null);
      const at = Date.now();
      setNow(at);
      dispatch({ type: 'RESUME', now: at });
    } catch (error) {
      stopWatching();
      throw error;
    } finally {
      pending.current = false;
    }
  }, [state.status, watch, stopWatching]);

  const finish = useCallback(
    (spotifyTrackName: string | null): SaveRunInput | null => {
      if (savedInput.current) return savedInput.current;
      if (state.startedAt === null) return null;
      stopWatching();
      const at = Date.now();
      const finished = trackerReducer(state, { type: 'FINISH', now: at });
      dispatch({ type: 'FINISH', now: at });
      setNow(at);
      savedInput.current = {
        id: randomUUID(),
        startedAt: new Date(state.startedAt).toISOString(),
        endedAt: new Date(at).toISOString(),
        distanceMeters: state.distanceMeters,
        durationSeconds: Math.max(1, Math.round(elapsedSeconds(finished, at))),
        route: simplifyRoute(state.route),
        spotifyTrackName,
      };
      return savedInput.current;
    },
    [state, stopWatching],
  );

  const reset = useCallback(() => {
    stopWatching();
    savedInput.current = null;
    dispatch({ type: 'RESET' });
  }, [stopWatching]);
  const seconds = elapsedSeconds(state, now);
  return {
    status: state.status,
    route: state.route,
    distanceMeters: state.distanceMeters,
    elapsedSeconds: seconds,
    pace: averagePaceSecPerKm(state.distanceMeters, seconds),
    permissionDenied,
    locationError,
    start,
    pause,
    resume,
    finish,
    reset,
  };
}
