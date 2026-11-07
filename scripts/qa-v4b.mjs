import { chromium } from 'playwright';
import { mkdir, rm, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

const BASE = process.env.QA_BASE || 'http://127.0.0.1:4330';
const OUT = '/workspace/sgs-site/qa/v4b';
await mkdir(OUT, { recursive: true });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const shot = async (page, name) => {
  await page.mouse.move(-200, -200).catch(() => {});
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: false });
};
const settle = async (page) => {
  await page.addInitScript(() => {
    try { sessionStorage.setItem('sgs-preloader-done', '1'); } catch {}
  });
};
async function toMp4(webm, mp4) {
  await new Promise((resolve, reject) => {
    const ff = spawn('ffmpeg', ['-y', '-i', webm, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4], { stdio: 'inherit' });
    ff.on('exit', (c) => (c === 0 ? resolve() : reject(new Error('ffmpeg'))));
  });
}

const browser = await chromium.launch({ headless: true });
const errs = [];

// Desktop
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errs.push(e.message));
  await settle(page);
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await wait(700);
  await shot(page, 'desk-topo');

  // text metrics for merged words / punctuation
  const typo = await page.evaluate(() => {
    const grab = (sel) => [...document.querySelectorAll(sel)].map((el) => el.textContent.replace(/\s+/g, ' ').trim());
    return {
      journey: grab('[data-journey-step] h3'),
      valueCards: grab('.editorial-point h3'),
      security: grab('.sec-card h3'),
      statement: document.querySelector('#produto-title')?.textContent.replace(/\s+/g, ' ').trim(),
      hero: document.querySelector('#hero-title')?.textContent.replace(/\s+/g, ' ').trim(),
      footer: document.querySelector('.legal-note')?.textContent.replace(/\s+/g, ' ').trim(),
      dashTitles: grab('.dash-item .title'),
    };
  });
  await writeFile(path.join(OUT, 'typo-check.json'), JSON.stringify(typo, null, 2));

  for (const id of ['produto', 'jornada', 'seguranca', 'contato']) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await wait(550);
    await shot(page, `desk-${id}`);
  }
  await page.locator('footer').scrollIntoViewIfNeeded();
  await wait(600);
  await shot(page, 'desk-footer');

  // 1280 security
  await ctx.close();
}
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await settle(page);
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await wait(500);
  await shot(page, 'desk1280-topo');
  await page.locator('#seguranca').scrollIntoViewIfNeeded();
  await wait(700);
  await shot(page, 'desk1280-seguranca');
  await page.locator('#produto').scrollIntoViewIfNeeded();
  await wait(400);
  await shot(page, 'desk1280-produto');
  await ctx.close();
}

// Mobile hamburger + sections
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await settle(page);
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await wait(600);
  await shot(page, 'mobile-topo');
  // hamburger closed state (should show lines)
  await shot(page, 'mobile-hamburger-closed');
  await page.click('[data-nav-toggle]');
  await wait(350);
  await shot(page, 'mobile-menu-open');
  await page.click('[data-nav-toggle]');
  await wait(300);
  await shot(page, 'mobile-menu-closed');
  for (const id of ['produto', 'jornada', 'seguranca', 'contato']) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await wait(450);
    await shot(page, `mobile-${id}`);
  }
  await page.locator('footer').scrollIntoViewIfNeeded();
  await wait(500);
  await shot(page, 'mobile-footer');
  await ctx.close();
}

// Videos
for (const kind of ['desk', 'mob']) {
  const videoDir = path.join(OUT, `_vid_${kind}`);
  await rm(videoDir, { recursive: true, force: true });
  await mkdir(videoDir, { recursive: true });
  const isMob = kind === 'mob';
  const ctx = await browser.newContext({
    viewport: isMob ? { width: 390, height: 844 } : { width: 1440, height: 900 },
    isMobile: isMob,
    hasTouch: isMob,
    recordVideo: { dir: videoDir, size: isMob ? { width: 390, height: 844 } : { width: 1440, height: 900 } },
  });
  const page = await ctx.newPage();
  await settle(page);
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await wait(500);
  await page.mouse.move(-200, -200).catch(() => {});
  const vh = isMob ? 844 : 900;
  const height = await page.evaluate(() => document.body.scrollHeight);
  const steps = isMob ? 36 : 48;
  for (let i = 1; i <= steps; i++) {
    await page.evaluate(([h, i, steps, vh]) => window.scrollTo(0, (h - vh) * (i / steps)), [height, i, steps, vh]);
    await wait(140);
  }
  await wait(300);
  await ctx.close();
  const webms = (await readdir(videoDir)).filter((f) => f.endsWith('.webm'));
  await toMp4(path.join(videoDir, webms[0]), path.join(OUT, isMob ? 'mob-scroll.mp4' : 'desk-scroll.mp4'));
}

await browser.close();
await writeFile(path.join(OUT, 'console-errors.txt'), errs.join('\n') || 'none');
console.log('typo', JSON.parse(await (await import('node:fs/promises')).readFile(path.join(OUT, 'typo-check.json'), 'utf8')));
console.log('errs', errs.length ? errs : 'none');
console.log('v4b QA done');
