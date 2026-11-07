import { chromium } from 'playwright';
import { mkdir, rm, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

const BASE = process.env.QA_BASE || 'http://127.0.0.1:4330';
const OUT = '/workspace/sgs-site/qa/v4';
await mkdir(OUT, { recursive: true });

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const shot = async (page, name) => {
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: false });
};

async function settle(page) {
  await page.addInitScript(() => {
    try { sessionStorage.setItem('sgs-preloader-done', '1'); } catch {}
  });
}

async function sectionShots(page, prefix, ids) {
  for (const id of ids) {
    const el = page.locator(`#${id}`);
    if (!(await el.count())) continue;
    await el.scrollIntoViewIfNeeded();
    await wait(id === 'sophie' ? 5200 : 500);
    if (id === 'sophie') {
      await page.waitForFunction(
        () => document.querySelector('[data-sophie-chat]')?.dataset.chatDone === 'true',
        null,
        { timeout: 9000 },
      ).catch(() => {});
    }
    // Move mouse off-screen so cursor never parks mid-section
    await page.mouse.move(-200, -200).catch(() => {});
    await wait(80);
    await shot(page, `${prefix}-${id}`);
  }
}

async function heroHeadlineWidths() {
  const browser = await chromium.launch({ headless: true });
  for (const [w, h, label] of [
    [1280, 800, '1280'],
    [1440, 900, '1440'],
    [1920, 1080, '1920'],
    [390, 844, '390'],
  ]) {
    const context = await browser.newContext({
      viewport: { width: w, height: h },
      deviceScaleFactor: w <= 390 ? 2 : 1,
      isMobile: w <= 390,
      hasTouch: w <= 390,
    });
    const page = await context.newPage();
    await settle(page);
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.evaluate(() => window.scrollTo(0, 0));
    await wait(700);
    await page.mouse.move(-200, -200).catch(() => {});
    await shot(page, `hero-balance-${label}`);
    // Measure orphan-ish last line length via DOM
    const info = await page.evaluate(() => {
      const h1 = document.querySelector('#hero-title');
      if (!h1) return null;
      const lines = [...h1.querySelectorAll('.split-line')];
      if (lines.length) {
        return lines.map((l) => (l.textContent || '').trim());
      }
      return { text: h1.innerText, width: h1.getBoundingClientRect().width };
    });
    await writeFile(path.join(OUT, `hero-lines-${label}.json`), JSON.stringify(info, null, 2));
    await context.close();
  }
  await browser.close();
}

async function toMp4(webmPath, mp4Path) {
  await new Promise((resolve, reject) => {
    const ff = spawn(
      'ffmpeg',
      ['-y', '-i', webmPath, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4Path],
      { stdio: 'inherit' },
    );
    ff.on('exit', (code) => (code === 0 ? resolve() : reject(new Error('ffmpeg fail'))));
  });
}

const browser = await chromium.launch({ headless: true });
const consoleErrors = [];

// Desktop 1440
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  page.on('pageerror', (e) => consoleErrors.push(`desk: ${e.message}`));
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(`desk-console: ${msg.text()}`); });
  await settle(page);
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await wait(500);
  await page.mouse.move(-200, -200);
  await shot(page, 'desk-hero-t0');

  // hero intro frames
  for (const [label, delay] of [['25', 900], ['50', 2000], ['75', 3400]]) {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.evaluate(() => window.scrollTo(0, 0));
    await wait(delay);
    await page.mouse.move(-200, -200);
    await shot(page, `desk-hero-intro-${label}`);
  }

  // word scrub frames
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const prodY = await page.evaluate(() => {
    const el = document.querySelector('#produto');
    return el ? el.getBoundingClientRect().top + window.scrollY : 0;
  });
  for (const [label, frac] of [['25', 0.15], ['50', 0.4], ['75', 0.7]]) {
    await page.evaluate(([y, f]) => window.scrollTo(0, y + f * 700), [prodY, frac]);
    await wait(400);
    await page.mouse.move(-200, -200);
    await shot(page, `desk-wordscrub-${label}`);
  }

  // journey frames (pin length ~3600)
  const journeyY = await page.evaluate(() => {
    const el = document.querySelector('#jornada');
    return el ? el.getBoundingClientRect().top + window.scrollY : 0;
  });
  await page.evaluate((y) => window.scrollTo(0, y + 40), journeyY);
  await wait(500);
  await page.mouse.move(-200, -200);
  await shot(page, 'desk-jornada-start');
  for (const [label, frac] of [['25', 0.25], ['50', 0.5], ['75', 0.75]]) {
    await page.evaluate(([y, f]) => window.scrollTo(0, y + f * 3200), [journeyY, frac]);
    await wait(600);
    await page.mouse.move(-200, -200);
    await shot(page, `desk-jornada-${label}`);
  }

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await sectionShots(page, 'desk', ['topo', 'produto', 'modulos', 'jornada', 'campo', 'sophie', 'seguranca', 'faq', 'contato']);

  // footer wordmark
  await page.locator('footer').scrollIntoViewIfNeeded();
  await wait(700);
  await page.mouse.move(-200, -200);
  await shot(page, 'desk-footer');

  await page.screenshot({ path: path.join(OUT, 'desk-full.png'), fullPage: true });
  await context.close();
}

// Desktop 1280 hero
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await settle(page);
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await wait(600);
  await page.mouse.move(-200, -200);
  await shot(page, 'desk1280-hero');
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
  page.on('pageerror', (e) => consoleErrors.push(`mob: ${e.message}`));
  await settle(page);
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await wait(500);
  await shot(page, 'mobile-hero-t0');
  await sectionShots(page, 'mobile', ['topo', 'produto', 'modulos', 'jornada', 'sophie', 'seguranca', 'contato']);
  await page.click('[data-nav-toggle]');
  await wait(300);
  await shot(page, 'mobile-menu-open');
  await context.close();
}

// Videos
{
  const videoDir = path.join(OUT, '_vid_desk');
  await rm(videoDir, { recursive: true, force: true });
  await mkdir(videoDir, { recursive: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: videoDir, size: { width: 1440, height: 900 } },
  });
  const page = await context.newPage();
  await settle(page);
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await wait(600);
  const stage = page.locator('[data-hero-stage]');
  const box = await stage.boundingBox();
  if (box) {
    for (const [x, y] of [[0.2, 0.3], [0.55, 0.4], [0.8, 0.55]]) {
      await page.mouse.move(box.x + box.width * x, box.y + box.height * y, { steps: 8 });
      await wait(160);
    }
  }
  await page.mouse.move(-200, -200);
  const height = await page.evaluate(() => document.body.scrollHeight);
  const steps = 52;
  for (let i = 1; i <= steps; i++) {
    await page.evaluate(([h, i, steps]) => window.scrollTo(0, (h - 900) * (i / steps)), [height, i, steps]);
    await wait(150);
  }
  await wait(400);
  await context.close();
  const webms = (await readdir(videoDir)).filter((f) => f.endsWith('.webm'));
  await toMp4(path.join(videoDir, webms[0]), path.join(OUT, 'desk-scroll.mp4'));
}

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
  await settle(page);
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await wait(500);
  const height = await page.evaluate(() => document.body.scrollHeight);
  const steps = 40;
  for (let i = 1; i <= steps; i++) {
    await page.evaluate(([h, i, steps]) => window.scrollTo(0, (h - 844) * (i / steps)), [height, i, steps]);
    await wait(160);
  }
  await wait(350);
  await context.close();
  const webms = (await readdir(videoDir)).filter((f) => f.endsWith('.webm'));
  await toMp4(path.join(videoDir, webms[0]), path.join(OUT, 'mob-scroll.mp4'));
}

await browser.close();

await heroHeadlineWidths();

await writeFile(path.join(OUT, 'console-errors.txt'), consoleErrors.join('\n') || 'none');
console.log('consoleErrors', consoleErrors.length ? consoleErrors : 'none');
console.log('v4 QA shots/videos done');
