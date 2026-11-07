import { chromium } from 'playwright';
import { mkdir, rm, readdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const BASE = process.env.QA_BASE || 'http://127.0.0.1:4330';
const OUT = '/workspace/sgs-site/qa/v3';
await mkdir(OUT, { recursive: true });

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const shot = async (page, name) => {
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: false });
};

async function clearStorage(page) {
  await page.addInitScript(() => {
    try { sessionStorage.removeItem('sgs-preloader-done'); } catch {}
  });
}

async function sectionShots(page, prefix, ids) {
  for (const id of ids) {
    const el = page.locator(`#${id}`);
    if (!(await el.count())) continue;
    await el.scrollIntoViewIfNeeded();
    await wait(id === 'sophie' ? 5200 : 450);
    if (id === 'sophie') {
      await page.waitForFunction(() => document.querySelector('[data-sophie-chat]')?.dataset.chatDone === 'true', null, { timeout: 9000 }).catch(() => {});
    }
    await shot(page, `${prefix}-${id}`);
  }
}

async function capturePreloader(page, prefix) {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await wait(80);
  await shot(page, `${prefix}-preloader-25`);
  await wait(350);
  await shot(page, `${prefix}-preloader-50`);
  await wait(400);
  await shot(page, `${prefix}-preloader-75`);
  await page.waitForFunction(() => document.documentElement.classList.contains('preloader-done'), null, { timeout: 4000 }).catch(() => {});
  await wait(200);
  await shot(page, `${prefix}-hero-t0`);
}

async function heroRevealFrames(page, prefix) {
  // After preloader done, capture headline reveal progression via reload with skip storage mid-way is hard;
  // capture settled + sync frames.
  for (const [label, delay] of [['25', 900], ['50', 2000], ['75', 3200]]) {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.evaluate(() => { sessionStorage.setItem('sgs-preloader-done', '1'); });
    await page.reload({ waitUntil: 'networkidle' });
    await page.evaluate(() => window.scrollTo(0, 0));
    await wait(delay);
    await shot(page, `${prefix}-hero-sync-${label}`);
  }
}

async function journeyFrames(page, prefix) {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(() => sessionStorage.setItem('sgs-preloader-done', '1'));
  await page.reload({ waitUntil: 'networkidle' });
  const journey = page.locator('#jornada');
  await journey.scrollIntoViewIfNeeded();
  await wait(500);
  await shot(page, `${prefix}-jornada-start`);
  const y = await page.evaluate(() => {
    const el = document.querySelector('#jornada');
    return el ? el.getBoundingClientRect().top + window.scrollY : 0;
  });
  for (const [label, frac] of [['25', 0.25], ['50', 0.5], ['75', 0.75]]) {
    await page.evaluate(([yy, f]) => window.scrollTo(0, yy + f * 2600), [y, frac]);
    await wait(550);
    await shot(page, `${prefix}-jornada-${label}`);
  }
}

async function toMp4(webmPath, mp4Path) {
  await new Promise((resolve, reject) => {
    const ff = spawn('ffmpeg', ['-y', '-i', webmPath, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4Path], { stdio: 'inherit' });
    ff.on('exit', (code) => (code === 0 ? resolve() : reject(new Error('ffmpeg fail'))));
  });
}

const browser = await chromium.launch({ headless: true });
const consoleErrors = [];

// Desktop settled + anim frames
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  page.on('pageerror', (e) => consoleErrors.push(`desk: ${e.message}`));
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(`desk-console: ${msg.text()}`); });
  await clearStorage(page);
  await capturePreloader(page, 'desk');
  await page.evaluate(() => sessionStorage.setItem('sgs-preloader-done', '1'));
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await wait(400);
  // mouse over hero for tilt
  const stage = page.locator('[data-hero-stage]');
  const box = await stage.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.3);
    await wait(200);
    await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.6, { steps: 12 });
    await wait(200);
    await shot(page, 'desk-hero-tilt');
  }
  // spotlight cards
  const card = page.locator('[data-spotlight]').first();
  await card.scrollIntoViewIfNeeded();
  const cb = await card.boundingBox();
  if (cb) {
    await page.mouse.move(cb.x + 20, cb.y + 20);
    await page.mouse.move(cb.x + cb.width - 20, cb.y + cb.height - 20, { steps: 10 });
    await wait(150);
    await shot(page, 'desk-card-spotlight');
  }
  await sectionShots(page, 'desk', ['topo','produto','modulos','jornada','campo','sophie','seguranca','faq','contato']);
  await heroRevealFrames(page, 'desk');
  await journeyFrames(page, 'desk');
  await page.screenshot({ path: path.join(OUT, 'desk-full.png'), fullPage: true });
  await context.close();
}

// Mobile
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  page.on('pageerror', (e) => consoleErrors.push(`mob: ${e.message}`));
  await clearStorage(page);
  await capturePreloader(page, 'mobile');
  await page.evaluate(() => sessionStorage.setItem('sgs-preloader-done', '1'));
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(250);
  await shot(page, 'mobile-hero-t0');
  await sectionShots(page, 'mobile', ['topo','modulos','jornada','sophie','contato']);
  await page.click('[data-nav-toggle]');
  await wait(300);
  await shot(page, 'mobile-menu-open');
  await context.close();
}

// Desktop scroll video with mouse movement
{
  const videoDir = path.join(OUT, '_vid_desk');
  await rm(videoDir, { recursive: true, force: true });
  await mkdir(videoDir, { recursive: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: videoDir, size: { width: 1440, height: 900 } },
  });
  const page = await context.newPage();
  await page.addInitScript(() => sessionStorage.setItem('sgs-preloader-done', '1'));
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await wait(600);
  // mouse tour hero
  const stage = page.locator('[data-hero-stage]');
  const box = await stage.boundingBox();
  if (box) {
    for (const [x, y] of [[0.2,0.3],[0.5,0.4],[0.8,0.55],[0.4,0.7]]) {
      await page.mouse.move(box.x + box.width * x, box.y + box.height * y, { steps: 8 });
      await wait(180);
    }
  }
  const height = await page.evaluate(() => document.body.scrollHeight);
  const steps = 48;
  for (let i = 1; i <= steps; i++) {
    await page.evaluate(([h, i, steps]) => window.scrollTo(0, (h - 900) * (i / steps)), [height, i, steps]);
    if (i === 8 || i === 16) {
      const card = page.locator('[data-spotlight]').nth(i === 8 ? 0 : 1);
      const cb = await card.boundingBox().catch(() => null);
      if (cb) await page.mouse.move(cb.x + cb.width / 2, cb.y + cb.height / 2, { steps: 6 });
    }
    await wait(160);
  }
  await wait(500);
  await context.close();
  const webms = (await readdir(videoDir)).filter((f) => f.endsWith('.webm'));
  await toMp4(path.join(videoDir, webms[0]), path.join(OUT, 'desk-scroll.mp4'));
}

// Mobile scroll video
{
  const videoDir = path.join(OUT, '_vid_mob');
  await rm(videoDir, { recursive: true, force: true });
  await mkdir(videoDir, { recursive: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    recordVideo: { dir: videoDir, size: { width: 390, height: 844 } },
  });
  const page = await context.newPage();
  await page.addInitScript(() => sessionStorage.setItem('sgs-preloader-done', '1'));
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await wait(500);
  const height = await page.evaluate(() => document.body.scrollHeight);
  const steps = 36;
  for (let i = 1; i <= steps; i++) {
    await page.evaluate(([h, i, steps]) => window.scrollTo(0, (h - 844) * (i / steps)), [height, i, steps]);
    await wait(170);
  }
  await wait(400);
  await context.close();
  const webms = (await readdir(videoDir)).filter((f) => f.endsWith('.webm'));
  await toMp4(path.join(videoDir, webms[0]), path.join(OUT, 'mob-scroll.mp4'));
}

await browser.close();
await writeFile(path.join(OUT, 'console-errors.txt'), consoleErrors.join('\n') || 'none');
console.log('consoleErrors', consoleErrors.length ? consoleErrors : 'none');
console.log('v3 QA shots/videos done');
