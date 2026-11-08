import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox'] });
try {
  const page = await browser.newPage({ viewport: { width: 320, height: 568 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(process.env.ROTAFIT_CONFIG_URL ?? 'http://localhost:8086');
  await page.getByText('Configuração inicial', { exact: true }).waitFor({ timeout: 60000 });
  await page.getByRole('button', { name: 'Escuro', exact: true }).click();
  await page.reload();
  await page.getByText('Configuração inicial', { exact: true }).waitFor();
  await page.waitForFunction(() => localStorage.getItem('rotafit.theme-preference') === 'dark');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
  assert.deepEqual(errors, []);
  await page.screenshot({ path: new URL('../docs/capturas/configuracao-320.png', import.meta.url).pathname, fullPage: true });
  console.log('PASS: sem credenciais, tela de configuração acessível em 320×568; tema persiste; sem erros JS nem overflow horizontal.');
} finally { await browser.close(); }
