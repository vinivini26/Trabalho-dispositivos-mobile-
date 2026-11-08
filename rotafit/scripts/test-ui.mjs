// Isolated UI verification: all backend and GPS responses below are test fixtures.
// No mock session, GPS generator, or fake data is included in the application bundle.
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const base = process.env.ROTAFIT_UI_URL ?? 'http://localhost:8081';
let server;
if (!process.env.ROTAFIT_UI_URL) {
  server = spawn('npx', ['expo', 'start', '--web', '--port', '8081'], {
    env: { ...process.env, BROWSER: 'none', CI: '1', EXPO_NO_TELEMETRY: '1',
      EXPO_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54321', EXPO_PUBLIC_SUPABASE_KEY: 'ui-test-public-key' },
    stdio: 'ignore', detached: true,
  });
}
const output = new URL('../docs/capturas/', import.meta.url);
await mkdir(output, { recursive: true });
const checks = [];
const uid = '11111111-1111-4111-8111-111111111111';
const user = { id: uid, email: 'teste@example.invalid', app_metadata: { provider: 'google' },
  user_metadata: { full_name: 'vinivini26' }, aud: 'authenticated', created_at: new Date().toISOString() };
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ['--no-sandbox'] });

async function visible(page, text) { await page.getByText(text, { exact: true }).waitFor({ timeout: 60000 }); }
async function layout(page, name) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
  assert.equal(overflow, false, `${name}: overflow horizontal`);
  checks.push(`${name}: sem overflow horizontal`);
}
async function checkThemeBackground(page, dark) {
  const channels = await page.getByText('Pronto para correr?', { exact: true }).evaluate((element) => {
    for (let node = element; node; node = node.parentElement) {
      const color = getComputedStyle(node).backgroundColor;
      if (color === 'transparent' || color.endsWith(', 0)')) continue;
      const values = color.match(/[\d.]+/g)?.map(Number);
      if (values && (values.length === 3 || values[3] >= 0.95)) return values.slice(0, 3);
    }
    return [255, 255, 255];
  });
  assert.ok(dark ? channels.every((n) => n < 50) : channels[0] > 180 && channels[1] > 180,
    `Fundo do tema ${dark ? 'escuro' : 'claro'} incorreto: ${channels}`);
}
async function capture(page, name) { await page.screenshot({ path: new URL(name + '.png', output).pathname, fullPage: true }); }
async function mockBackend(context, state) {
  await context.route('http://127.0.0.1:54321/**', async (route) => {
    const request = route.request(); const url = new URL(request.url());
    const json = (body, status = 200) => route.fulfill({ status, json: body,
      headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' } });
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: {
      'access-control-allow-origin': '*', 'access-control-allow-headers': '*',
      'access-control-allow-methods': 'GET,POST,DELETE,PUT' } });
    if (url.pathname.endsWith('/auth/v1/user')) return json(user);
    if (url.pathname.endsWith('/auth/v1/logout')) return json({});
    if (url.pathname.endsWith('/rpc/weekly_stats')) return json({ total_distance_meters: 2500, total_duration_seconds: 900, run_count: 1 });
    if (url.pathname.endsWith('/runs')) {
      if (request.method() === 'POST') {
        state.attempts.push(request.postDataJSON());
        if (state.failSave) { state.failSave = false; return json({ message: 'Falha temporária de teste' }, 503); }
        state.rows.push({ id: '22222222-2222-4222-8222-222222222222', ...request.postDataJSON() });
        return json({ id: state.rows.at(-1).id }, 201);
      }
      if (request.method() === 'DELETE') { state.rows = []; return json({}); }
      if (url.searchParams.has('id')) return json(state.rows[0]);
      return json(state.rows);
    }
    throw new Error(`Requisição inesperada: ${request.method()} ${url.pathname}`);
  });
  await context.route('https://api.spotify.com/**', (route) => {
    if (route.request().method() !== 'GET') return route.fulfill({ status: 403,
      json: { error: { message: 'Premium required' } } });
    return route.fulfill({ json: { is_playing: true, item: { id: 'test-track', name: 'Faixa de teste',
      artists: [{ name: 'Artista de teste' }], album: { images: [] }, duration_ms: 180000 }, progress_ms: 1000 } });
  });
}
async function seed(context, spotify = false) {
  await context.addInitScript(({ user, spotify }) => {
    const token = btoa(JSON.stringify({ alg: 'none' })) + '.' + btoa(JSON.stringify({ sub: user.id,
      exp: Math.floor(Date.now() / 1000) + 3600, role: 'authenticated' })) + '.ui-test';
    localStorage.setItem('sb-127-auth-token', JSON.stringify({ access_token: token,
      refresh_token: 'test-refresh', token_type: 'bearer', expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600, user }));
    if (spotify) localStorage.setItem('rotafit.spotify.tokens.' + user.id, JSON.stringify({
      accessToken: 'test-spotify-token', refreshToken: 'test-refresh', expiresAt: Date.now() + 3600000 }));
    let callback, timer, point = 0, watchId = 0;
    Object.defineProperty(navigator, 'geolocation', { value: {
      getCurrentPosition(success) { success({ coords: { latitude: -15.79, longitude: -47.88, accuracy: 5 }, timestamp: Date.now() }); },
      watchPosition(success) {
        callback = success;
        timer = setInterval(() => { callback({ coords: { latitude: -15.79, longitude: -47.88 + point++ * 0.00008,
          accuracy: 5, altitude: 0, altitudeAccuracy: 5, heading: 0, speed: 4 }, timestamp: Date.now() }); }, 1600);
        return ++watchId;
      },
      clearWatch() { clearInterval(timer); },
    }, configurable: true });
  }, { user, spotify });
}

try {
  for (let attempt = 0; attempt < 90; attempt++) {
    try { if ((await fetch(base)).ok) break; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (attempt === 89) throw new Error('Servidor Expo indisponível');
  }
  const login = await browser.newContext({ viewport: { width: 320, height: 568 } });
  const loginPage = await login.newPage();
  await loginPage.goto(base + '/login'); await visible(loginPage, 'Continuar com Google');
  await layout(loginPage, 'Login 320×568'); await capture(loginPage, 'login-320');
  await login.close();

  for (const viewport of [{ width: 320, height: 568 }, { width: 390, height: 844 }, { width: 768, height: 1024 }]) {
    const label = `${viewport.width}×${viewport.height}`;
    const context = await browser.newContext({ viewport, permissions: ['geolocation'], geolocation: { latitude: -15.79, longitude: -47.88 } });
    const state = { rows: [], attempts: [], failSave: viewport.width === 390 };
    await seed(context, true); await mockBackend(context, state);
    const page = await context.newPage(); const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('dialog', (dialog) => { console.log('Diálogo:', dialog.message()); return dialog.accept(); });
    await page.goto(base); await visible(page, 'Pronto para correr?');
    await visible(page, 'Faixa de teste');
    await checkThemeBackground(page, false);
    await layout(page, `Início ${label}`); await capture(page, `inicio-claro-${viewport.width}`);
    await page.getByRole('tab', { name: /Histórico/ }).click();
    await visible(page, 'Nenhuma corrida ainda'); checks.push(`Histórico vazio ${label}`);
    await page.getByRole('tab', { name: /Perfil/ }).click();
    await visible(page, 'APARÊNCIA'); await page.getByRole('button', { name: 'Escuro', exact: true }).click();
    await layout(page, `Perfil escuro ${label}`); await capture(page, `perfil-escuro-${viewport.width}`);
    await page.reload(); await visible(page, 'APARÊNCIA');
    await page.waitForFunction(() => localStorage.getItem('rotafit.theme-preference') === 'dark');
    checks.push(`Tema escuro persiste ao reabrir ${label}`);
    await page.getByRole('tab', { name: /Início/ }).click();
    await visible(page, 'Pronto para correr?');
    await checkThemeBackground(page, true);
    checks.push(`Fundo e contraste claro/escuro ${label}`);
    await capture(page, `inicio-escuro-${viewport.width}`);
    await page.getByRole('button', { name: 'Pausar', exact: true }).click();
    await visible(page, 'O controle exige Spotify Premium e acesso autorizado ao aplicativo. Confira sua conta no Spotify.');
    await page.getByRole('button', { name: 'Tentar novamente', exact: true }).click();
    checks.push(`Erro Spotify 403 tratado ${label}`);
    await page.getByRole('button', { name: 'Iniciar corrida', exact: true }).click();
    await visible(page, 'Pronto para começar?');
    await page.getByRole('button', { name: 'Começar corrida', exact: true }).click();
    await visible(page, 'Finalizar');
    await page.waitForTimeout(5200);
    await layout(page, `Corrida ${label}`); await capture(page, `corrida-${viewport.width}`);
    await page.getByRole('button', { name: 'Pausar', exact: true }).last().click();
    await visible(page, 'Corrida pausada. Retome para continuar registrando o GPS.');
    await page.getByRole('button', { name: 'Retomar', exact: true }).click();
    await page.waitForTimeout(3400);
    await page.getByRole('button', { name: 'Finalizar', exact: true }).click();
    if (viewport.width === 390) {
      await visible(page, 'Tentar salvar novamente');
      await page.getByRole('button', { name: 'Tentar salvar novamente', exact: true }).click();
      assert.deepEqual(state.attempts[0], state.attempts[1]);
      checks.push('Falha ao salvar: nova tentativa preserva payload e duração');
    }
    await visible(page, 'Excluir corrida');
    assert.ok(state.rows[0].distance_meters > 0);
    assert.ok(state.rows[0].duration_seconds > 0);
    assert.ok(state.rows[0].route.length > 1);
    assert.equal(state.rows[0].spotify_track_name, 'Faixa de teste — Artista de teste');
    await layout(page, `Resumo ${label}`); await capture(page, `resumo-${viewport.width}`);
    checks.push(`Iniciar → GPS simulado → pausar → retomar → salvar → resumo ${label}`);
    await page.getByRole('button', { name: 'Excluir corrida', exact: true }).click();
    await visible(page, 'Pronto para correr?');
    await page.getByRole('tab', { name: /Histórico/ }).click();
    await visible(page, 'Nenhuma corrida ainda');
    assert.equal(state.rows.length, 0); checks.push(`Exclusão e histórico atualizado ${label}`);
    assert.deepEqual(errors, [], `Erros JS ${label}: ${errors.join('; ')}`);
    await context.close();
  }
  console.log(checks.join('\n'));
  console.log(`PASS: ${checks.length} verificações de interface; APIs e GPS simulados.`);
  await writeFile(new URL('../docs/VALIDACAO_UI.txt', import.meta.url), checks.join('\n') + `\nPASS: ${checks.length} verificações. APIs e GPS simulados; Chromium.\n`);
} finally {
  await browser.close();
  if (server?.pid) { try { process.kill(-server.pid, 'SIGTERM'); } catch {} }
}
