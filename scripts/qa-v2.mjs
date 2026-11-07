import { chromium, devices } from 'playwright';
import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';

const BASE = process.env.QA_BASE || 'http://127.0.0.1:4330';
const OUT = '/workspace/sgs-site/qa/v2';
await mkdir(OUT, { recursive: true });

async function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: false });
}

async function sectionShots(page, prefix, ids) {
  for (const id of ids) {
    const el = page.locator(`#${id}`);
    if (await el.count()) {
      await el.scrollIntoViewIfNeeded();
      // Sophie chat types in over a few seconds; wait for bubbles to settle.
      await wait(id === 'sophie' ? 5200 : 400);
      if (id === 'sophie') {
        await page.waitForFunction(() => {
          const bubbles = [...document.querySelectorAll('[data-chat-bubble]')];
          return bubbles.length >= 4 && bubbles.every((b) => (b.textContent || '').trim().length > 8);
        }, { timeout: 8000 }).catch(() => {});
      }
      await shot(page, `${prefix}-${id}`);
    }
  }
}

async function heroAnimFrames(page, prefix) {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(150);
  await shot(page, `${prefix}-hero-t0`);

  // Capture sync animation progress by waiting for class changes / time
  // Animation: phone checks ~0.45s apart, then dash items, then chart
  for (const [label, ms] of [
    ['25', 900],
    ['50', 1800],
    ['75', 2700],
  ]) {
    await wait(ms - (label === '25' ? 150 : label === '50' ? 900 : 1800));
    // absolute waits from t0 handled below differently
  }
}

async function captureHeroPercents(page, prefix) {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(120);
  await shot(page, `${prefix}-hero-t0`);

  // Restart timeline by reload for clean percents
  const marks = [
    ['25', 1100],
    ['50', 2200],
    ['75', 3200],
  ];
  for (const [label, delay] of marks) {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.evaluate(() => window.scrollTo(0, 0));
    await wait(delay);
    await shot(page, `${prefix}-hero-sync-${label}`);
  }
}

async function captureJourneyPercents(page, prefix) {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const journey = page.locator('#jornada');
  await journey.scrollIntoViewIfNeeded();
  await wait(400);
  await shot(page, `${prefix}-jornada-start`);

  // Scroll through pinned area
  const box = await journey.boundingBox();
  if (!box) return;
  const startY = box.y + (await page.evaluate(() => window.scrollY));
  for (const [label, frac] of [
    ['25', 0.25],
    ['50', 0.5],
    ['75', 0.75],
  ]) {
    await page.evaluate(
      ([y, f]) => window.scrollTo(0, y + f * 2400),
      [startY, frac],
    );
    await wait(500);
    await shot(page, `${prefix}-jornada-${label}`);
  }
}

const browser = await chromium.launch({ headless: true });

// Desktop settled + anim
{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await captureHeroPercents(page, 'desk');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(200);
  await sectionShots(page, 'desk', [
    'topo',
    'produto',
    'modulos',
    'jornada',
    'campo',
    'sophie',
    'seguranca',
    'faq',
    'contato',
  ]);
  await captureJourneyPercents(page, 'desk');
  await page.screenshot({ path: path.join(OUT, 'desk-full.png'), fullPage: true });
  await context.close();
}

// Mobile
{
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(200);
  await shot(page, 'mobile-hero-t0');
  await captureHeroPercents(page, 'mobile');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await sectionShots(page, 'mobile', ['topo', 'modulos', 'jornada', 'sophie', 'contato']);
  // menu open
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.click('[data-nav-toggle]');
  await wait(300);
  await shot(page, 'mobile-menu-open');
  await context.close();
}

// Desktop scroll video via Playwright recordVideo -> webm, then ffmpeg mp4
const videoDir = path.join(OUT, '_video-raw');
await rm(videoDir, { recursive: true, force: true });
await mkdir(videoDir, { recursive: true });
{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: videoDir, size: { width: 1440, height: 900 } },
  });
  const page = await context.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(800);
  // smooth scroll down
  const height = await page.evaluate(() => document.body.scrollHeight);
  const steps = 40;
  for (let i = 1; i <= steps; i++) {
    await page.evaluate(
      ([h, i, steps]) => window.scrollTo(0, (h - 900) * (i / steps)),
      [height, i, steps],
    );
    await wait(180);
  }
  await wait(600);
  await context.close(); // finalize video
}

await browser.close();

// convert webm to mp4
const { readdirSync } = await import('node:fs');
const webms = readdirSync(videoDir).filter((f) => f.endsWith('.webm'));
if (!webms.length) throw new Error('No webm recorded');
const webmPath = path.join(videoDir, webms[0]);
const mp4Path = path.join(OUT, 'desk-scroll.mp4');
await new Promise((resolve, reject) => {
  const ff = spawn(
    'ffmpeg',
    ['-y', '-i', webmPath, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4Path],
    { stdio: 'inherit' },
  );
  ff.on('exit', (code) => (code === 0 ? resolve() : reject(new Error('ffmpeg failed'))));
});

console.log('v2 QA complete', OUT);
