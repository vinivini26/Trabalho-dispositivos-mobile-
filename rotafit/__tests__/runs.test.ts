import { saveRun } from '@/services/runs';
import { supabase } from '@/lib/supabase';
import type { SaveRunInput } from '@/types';

jest.mock('@/lib/supabase', () => ({ supabase: { from: jest.fn() } }));
const input: SaveRunInput = {
  id: 'stable-run-id',
  startedAt: '2026-11-08T10:00:00Z',
  endedAt: '2026-11-08T10:01:00Z',
  distanceMeters: 100,
  durationSeconds: 60,
  route: [],
  spotifyTrackName: null,
};
it('reconhece corrida já salva após perda da resposta da rede', async () => {
  const insert = jest.fn().mockReturnValue({
    select: () => ({ single: async () => ({ data: null, error: { code: '23505' } }) }),
  });
  const eq = jest.fn().mockReturnValue({
    single: async () => ({
      data: { id: input.id, route: [], distance_meters: 100 },
      error: null,
    }),
  });
  (supabase.from as jest.Mock).mockReturnValue({ insert, select: () => ({ eq }) });
  expect(await saveRun(input, 'current-user', 600)).toBe(input.id);
  expect(insert).toHaveBeenCalledWith(
    expect.objectContaining({ id: input.id, user_id: 'current-user' }),
  );
  expect(eq).toHaveBeenCalledWith('id', input.id);
});
it('não aceita a colisão com um ID que o usuário não pode ler', async () => {
  (supabase.from as jest.Mock).mockReturnValue({
    insert: () => ({
      select: () => ({ single: async () => ({ error: { code: '23505' } }) }),
    }),
    select: () => ({
      eq: () => ({ single: async () => ({ error: new Error('Sem acesso') }) }),
    }),
  });
  await expect(saveRun(input, 'current-user', 600)).rejects.toThrow('Sem acesso');
});
