import { chromium } from 'playwright';
import { mkdir, rm, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

const BASE = process.env.QA_BASE || 'http://127.0.0.1:4330';
const OUT = '/workspace/sgs-site/qa/v4c';
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

async function checkOverflow(page, label) {
  return page.evaluate((label) => {
    const iw = window.innerWidth;
    const sw = document.documentElement.scrollWidth;
    const offenders = [];
    for (const el of document.querySelectorAll('body *')) {
      if (el.closest('.marquee-track, .marquee-item, .cursor, .cursor-ring, .cursor-dot')) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      if (r.right > iw + 1.5) {
        offenders.push({
          cls: String(el.className || '').slice(0, 80),
          tag: el.tagName.toLowerCase(),
          right: Math.round(r.right * 10) / 10,
          overflow: Math.round((r.right - iw) * 10) / 10,
          text: (el.textContent || '').trim().slice(0, 40),
        });
      }
    }
    offenders.sort((a, b) => b.overflow - a.overflow);
    return {
      label,
      iw,
      sw,
      ok: sw <= iw + 1,
      delta: sw - iw,
      offenders: offenders.slice(0, 12),
    };
  }, label);
}

const browser = await chromium.launch({ headless: true });
const errs = [];
const overflowReports = [];

// Desktop 1440
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errs.push(e.message));
  await settle(page);
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await wait(800);
  await shot(page, 'desk-topo');

  const heroGap = await page.evaluate(() => {
    const h1 = document.querySelector('.display-hero');
    const stage = document.querySelector('.hero-stage');
    const hr = h1.getBoundingClientRect();
    const sr = stage.getBoundingClientRect();
    const chips = [...document.querySelectorAll('.float-chip')].map((c) => {
      const cr = c.getBoundingClientRect();
      const overlaps = !(cr.right < hr.left || cr.left > hr.right || cr.bottom < hr.top || cr.top > hr.bottom);
      return { t: c.textContent.trim(), gap: Math.round(cr.left - hr.right), overlaps };
    });
    return {
      gapToStage: Math.round(sr.left - hr.right),
      chips,
      h1Fs: getComputedStyle(h1).fontSize,
      h1Ws: getComputedStyle(h1).wordSpacing,
      copyMax: getComputedStyle(document.querySelector('.hero-copy')).maxWidth,
    };
  });
  await writeFile(path.join(OUT, 'hero-gap-1440.json'), JSON.stringify(heroGap, null, 2));

  const lineClip = await page.evaluate(() => [...document.querySelectorAll('.display-hero .hero-line')].map((el) => ({
    text: el.textContent.trim(),
    clientW: el.clientWidth,
    scrollW: el.scrollWidth,
    clipped: el.scrollWidth > el.clientWidth + 1,
  })));
  await writeFile(path.join(OUT, 'hero-line-clip-1440.json'), JSON.stringify(lineClip, null, 2));
  if (lineClip.some((l) => l.clipped)) {
    errs.push('HERO LINE CLIPPED 1440: ' + JSON.stringify(lineClip));
  }

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
  await wait(500);
  await shot(page, 'desk-footer');
  await ctx.close();
}

// Desktop 1280 hero + security
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await settle(page);
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await wait(600);
  await shot(page, 'desk1280-topo');
  const heroGap = await page.evaluate(() => {
    const h1 = document.querySelector('.display-hero');
    const stage = document.querySelector('.hero-stage');
    const hr = h1.getBoundingClientRect();
    const sr = stage.getBoundingClientRect();
    const chips = [...document.querySelectorAll('.float-chip')].map((c) => {
      const cr = c.getBoundingClientRect();
      const overlaps = !(cr.right < hr.left || cr.left > hr.right || cr.bottom < hr.top || cr.top > hr.bottom);
      return { t: c.textContent.trim(), gap: Math.round(cr.left - hr.right), overlaps };
    });
    return { gapToStage: Math.round(sr.left - hr.right), chips };
  });
  await writeFile(path.join(OUT, 'hero-gap-1280.json'), JSON.stringify(heroGap, null, 2));
  await page.locator('#seguranca').scrollIntoViewIfNeeded();
  await wait(700);
  await shot(page, 'desk1280-seguranca');
  await page.locator('#produto').scrollIntoViewIfNeeded();
  await wait(400);
  await shot(page, 'desk1280-produto');
  await ctx.close();
}

// Mobile overflow gates + shots at 390 and 360
for (const w of [390, 360]) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: 844 },
    deviceScaleFactor: w === 390 ? 2 : 1,
    isMobile: true,
    hasTouch: true,
  });
  const page = await ctx.newPage();
  await settle(page);
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await wait(700);

  // check at topo and each major section
  const sections = [
    ['topo', null],
    ['produto', '#produto'],
    ['jornada', '#jornada'],
    ['seguranca', '#seguranca'],
    ['contato', '#contato'],
    ['footer', 'footer'],
  ];
  for (const [name, sel] of sections) {
    if (sel) {
      await page.locator(sel).scrollIntoViewIfNeeded();
      await wait(400);
    } else {
      await page.evaluate(() => window.scrollTo(0, 0));
      await wait(300);
    }
    const rep = await checkOverflow(page, `mobile${w}-${name}`);
    overflowReports.push(rep);
    if (!rep.ok) {
      errs.push(`OVERFLOW ${rep.label}: scrollWidth ${rep.sw} > innerWidth ${rep.iw} (Δ${rep.delta}) top=${JSON.stringify(rep.offenders.slice(0, 3))}`);
    }
    await shot(page, `mobile${w === 390 ? '' : '360'}-${name}`.replace('mobile-', 'mobile-').replace('mobile360-', 'mobile360-'));
  }

  if (w === 390) {
    await page.evaluate(() => window.scrollTo(0, 0));
    await wait(300);
    await shot(page, 'mobile-topo');
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
    await wait(400);
    await shot(page, 'mobile-footer');
  }
  await ctx.close();
}

await writeFile(path.join(OUT, 'overflow-check.json'), JSON.stringify(overflowReports, null, 2));

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

const failedOverflow = overflowReports.filter((r) => !r.ok);
console.log('typo', JSON.parse(await (await import('node:fs/promises')).readFile(path.join(OUT, 'typo-check.json'), 'utf8')));
console.log('hero1440', JSON.parse(await (await import('node:fs/promises')).readFile(path.join(OUT, 'hero-gap-1440.json'), 'utf8')));
console.log('hero1280', JSON.parse(await (await import('node:fs/promises')).readFile(path.join(OUT, 'hero-gap-1280.json'), 'utf8')));
console.log('overflow fails', failedOverflow.length ? failedOverflow : 'none');
console.log('errs', errs.length ? errs : 'none');
if (failedOverflow.length) {
  console.error('QA FAIL: mobile horizontal overflow');
  process.exitCode = 1;
}
if (errs.some((e) => String(e).includes('HERO LINE CLIPPED'))) {
  console.error('QA FAIL: desktop hero line clipped');
  process.exitCode = 1;
}
console.log('v4c QA done');
