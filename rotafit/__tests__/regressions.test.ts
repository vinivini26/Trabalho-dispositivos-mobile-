import { formatPace } from '@/utils/geo';
import { elapsedSeconds, initialTrackerState, trackerReducer } from '@/utils/tracker';

it('arredonda ritmo para o minuto seguinte sem mostrar 60 segundos', () => {
  expect(formatPace(359.6)).toBe('6\'00"/km');
});
it('uma pausa no instante zero congela o relógio e é descontada ao finalizar', () => {
  let state = trackerReducer(initialTrackerState, { type: 'START', now: 0 });
  state = trackerReducer(state, { type: 'PAUSE', now: 0 });
  expect(elapsedSeconds(state, 10000)).toBe(0);
  state = trackerReducer(state, { type: 'FINISH', now: 10000 });
  expect(elapsedSeconds(state, 20000)).toBe(0);
});
it('não acrescenta à distância o deslocamento feito durante uma pausa', () => {
  let state = trackerReducer(initialTrackerState, { type: 'START', now: 0 });
  state = trackerReducer(state, { type: 'ADD_POINT', now: 1000, lat: 0, lng: 0 });
  state = trackerReducer(state, { type: 'PAUSE', now: 2000 });
  state = trackerReducer(state, { type: 'RESUME', now: 60000 });
  state = trackerReducer(state, { type: 'ADD_POINT', now: 61000, lat: 0, lng: 0.001 });
  expect(state.distanceMeters).toBe(0);
  state = trackerReducer(state, { type: 'ADD_POINT', now: 63000, lat: 0, lng: 0.0011 });
  expect(state.distanceMeters).toBeGreaterThan(10);
  expect(state.distanceMeters).toBeLessThan(12);
});
it('ignora coordenadas inválidas vindas do sensor', () => {
  const state = trackerReducer(initialTrackerState, { type: 'START', now: 0 });
  for (const lat of [NaN, Infinity, 91]) {
    expect(trackerReducer(state, { type: 'ADD_POINT', now: 1000, lat, lng: 0 })).toBe(
      state,
    );
  }
});
