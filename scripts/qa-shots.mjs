import { chromium, devices } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const BASE = process.env.QA_BASE || 'http://127.0.0.1:4330';
const OUT = '/workspace/sgs-site/qa';

await mkdir(OUT, { recursive: true });

async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: false });
}

async function midAnimationFrames(page, prefix) {
  // Capture early paint + after scroll triggers motion
  await page.waitForTimeout(200);
  await shot(page, `${prefix}-t0`);
  await page.evaluate(() => window.scrollTo(0, 420));
  await page.waitForTimeout(450);
  await shot(page, `${prefix}-mid-scroll`);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.45));
  await page.waitForTimeout(500);
  await shot(page, `${prefix}-mid-page`);
}

const browser = await chromium.launch({ headless: true });

// Desktop
{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await midAnimationFrames(page, 'desktop');
  await page.screenshot({ path: path.join(OUT, 'desktop-full.png'), fullPage: true });
  // sections
  for (const id of ['topo', 'produto', 'modulos', 'sophie', 'seguranca', 'faq', 'contato']) {
    const el = page.locator(`#${id}`);
    if (await el.count()) {
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(250);
      await shot(page, `desktop-${id}`);
    }
  }
  await context.close();
}

// Mobile
{
  const iPhone = devices['iPhone 13'];
  const context = await browser.newContext({ ...iPhone });
  const page = await context.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await midAnimationFrames(page, 'mobile');
  await page.screenshot({ path: path.join(OUT, 'mobile-full.png'), fullPage: true });
  for (const id of ['topo', 'modulos', 'contato']) {
    const el = page.locator(`#${id}`);
    if (await el.count()) {
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(250);
      await shot(page, `mobile-${id}`);
    }
  }
  await context.close();
}

await browser.close();
console.log('QA shots written to', OUT);
