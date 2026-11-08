import React from 'react';
import { create, act } from 'react-test-renderer';
import * as Location from 'expo-location';
import { useRunTracker } from '@/hooks/useRunTracker';

jest.mock('expo-crypto', () => ({
  randomUUID: () => '33333333-3333-4333-8333-333333333333',
}));
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  hasServicesEnabledAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
  Accuracy: { BestForNavigation: 6 },
}));
let result, tree;
function Probe() {
  result = useRunTracker();
  return null;
}
beforeEach(async () => {
  jest.useFakeTimers();
  jest.setSystemTime(10000);
  Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
  Location.hasServicesEnabledAsync.mockResolvedValue(true);
  Location.watchPositionAsync.mockResolvedValue({ remove: jest.fn() });
  await act(async () => {
    tree = create(React.createElement(Probe));
  });
});
afterEach(async () => {
  await act(async () => tree.unmount());
  jest.useRealTimers();
  jest.clearAllMocks();
});
it('nega permissão sem iniciar relógio nem GPS', async () => {
  Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });
  await act(async () => {
    expect(await result.start()).toBe(false);
  });
  expect(result.status).toBe('idle');
  expect(result.permissionDenied).toBe(true);
  expect(Location.watchPositionAsync).not.toHaveBeenCalled();
});
it('falha do GPS preserva estado idle e permite nova tentativa', async () => {
  Location.watchPositionAsync.mockRejectedValueOnce(new Error('GPS indisponível'));
  await act(async () => {
    await expect(result.start()).rejects.toThrow('GPS indisponível');
  });
  expect(result.status).toBe('idle');
  await act(async () => {
    await result.start();
  });
  expect(result.status).toBe('active');
});
it('remove uma assinatura que termina de abrir após desmontar a tela', async () => {
  let resolveWatch;
  Location.watchPositionAsync.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        resolveWatch = resolve;
      }),
  );
  let starting;
  await act(async () => {
    starting = result.start();
  });
  await act(async () => tree.unmount());
  const remove = jest.fn();
  await act(async () => {
    resolveWatch({ remove });
    await starting;
  });
  expect(remove).toHaveBeenCalledTimes(1);
});
it('finalização preserva duração e payload para repetir um salvamento que falhou', async () => {
  await act(async () => {
    await result.start();
  });
  await act(async () => {
    jest.advanceTimersByTime(5000);
  });
  let first;
  await act(async () => {
    first = result.finish('Faixa de teste');
  });
  expect(first.durationSeconds).toBe(5);
  await act(async () => {
    jest.advanceTimersByTime(30000);
  });
  expect(result.finish('Outra faixa')).toBe(first);
  expect(result.elapsedSeconds).toBe(5);
});
it('interrupção do sensor pausa a corrida e informa o usuário', async () => {
  await act(async () => {
    await result.start();
  });
  const reportError = Location.watchPositionAsync.mock.calls[0][2];
  await act(async () => {
    reportError('Sensor indisponível');
  });
  expect(result.status).toBe('paused');
  expect(result.locationError).toContain('GPS foi interrompido');
});
