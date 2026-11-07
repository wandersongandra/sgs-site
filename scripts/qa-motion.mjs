/**
 * QA do motion "fio da evidência".
 * Uso: QA_BASE=http://127.0.0.1:43117 node scripts/qa-motion.mjs
 */
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const BASE = process.env.QA_BASE || 'http://127.0.0.1:43117/';
const OUT = path.resolve('qa/motion');
await mkdir(OUT, { recursive: true });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const WA = 'https://wa.me/553186937268?text=Ol%C3%A1!%20Quero%20conhecer%20o%20SGS%20Seguran%C3%A7a.';
const report = { errors: [], overflow: [], checks: {}, axe: {} };

const browser = await chromium.launch({ headless: true });

async function overflow(page, label) {
  const data = await page.evaluate((label) => {
    const iw = window.innerWidth;
    const sw = document.documentElement.scrollWidth;
    return { label, iw, sw, ok: sw <= iw + 1 };
  }, label);
  report.overflow.push(data);
  if (!data.ok) report.errors.push(`overflow ${label}: ${data.sw} > ${data.iw}`);
  return data;
}

{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => report.errors.push('desk ' + e.message));
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await wait(900);
  await page.screenshot({ path: path.join(OUT, 'after-desktop-hero.png') });
  await wait(700);
  await page.screenshot({ path: path.join(OUT, 'after-desktop-hero-frame.png') });
  await overflow(page, 'desk-hero');

  const hero = await page.evaluate(() => {
    const path = document.querySelector('[data-hero-path]');
    const len = Number(path?.dataset.len || 0);
    const offset = path ? getComputedStyle(path).strokeDashoffset : '';
    return {
      len,
      offset,
      h1: document.querySelector('h1')?.innerText.replace(/\s+/g, ' ').trim(),
      pins: document.querySelectorAll('.pin-spacer, .gsap-pin-spacer').length,
      lenis: document.documentElement.classList.contains('lenis'),
      cursor: document.documentElement.classList.contains('cursor-on'),
      pre: getComputedStyle(document.querySelector('.preloader')).visibility,
    };
  });
  report.checks.hero = hero;
  if (!(hero.len > 40)) report.errors.push('hero thread sem comprimento');
  if (hero.pins !== 0) report.errors.push('pinning detectado');
  if (hero.cursor) report.errors.push('cursor artificial ativo');

  const before = await page.evaluate(() => document.querySelector('[data-journey-path]')?.style.strokeDashoffset || '');
  await page.locator('#jornada').scrollIntoViewIfNeeded();
  await wait(400);
  await page.screenshot({ path: path.join(OUT, 'after-desktop-jornada.png') });
  const journeyBox = await page.locator('[data-journey-steps]').boundingBox();
  if (journeyBox) {
    await page.mouse.wheel(0, journeyBox.height * 0.55);
    await wait(500);
  }
  await page.screenshot({ path: path.join(OUT, 'after-desktop-jornada-mid.png') });
  const journey = await page.evaluate((before) => {
    const path = document.querySelector('[data-journey-path]');
    const active = document.querySelector('[data-journey-step].is-active h3')?.textContent?.trim();
    const offset = path?.style.strokeDashoffset || '';
    const len = Number(path?.dataset.len || 0);
    return { before, offset, len, active, changed: before !== offset && offset !== '' };
  }, before);
  report.checks.journey = journey;
  if (!(journey.len > 80)) report.errors.push('fio da jornada sem comprimento');

  await page.locator('#produto').scrollIntoViewIfNeeded();
  await wait(350);
  await page.screenshot({ path: path.join(OUT, 'after-desktop-produto.png') });
  await page.locator('#modulos').scrollIntoViewIfNeeded();
  await wait(250);
  await page.locator('#tab-gestao').click();
  await wait(450);
  const tab = await page.evaluate(() => ({
    selected: document.querySelector('[data-mod-tab][aria-selected="true"]')?.id,
    visible: [...document.querySelectorAll('[data-mod-panel]')].filter((p) => !p.hidden).map((p) => p.id),
  }));
  report.checks.tabClick = tab;
  if (tab.selected !== 'tab-gestao' || tab.visible.join() !== 'panel-gestao') report.errors.push('aba de módulos falhou: ' + JSON.stringify(tab));
  await page.screenshot({ path: path.join(OUT, 'after-desktop-modulos.png') });

  await page.locator('#contato').scrollIntoViewIfNeeded();
  await wait(300);
  await page.screenshot({ path: path.join(OUT, 'after-desktop-contato.png') });

  const links = await page.evaluate(() => {
    const wa = [...document.querySelectorAll('a[href*="wa.me"]')].map((a) => a.getAttribute('href'));
    const ids = [...document.querySelectorAll('[id]')].map((n) => n.id);
    const broken = [...document.querySelectorAll('a[href^="#"]')]
      .map((a) => a.getAttribute('href'))
      .filter((href) => href.length > 1 && !ids.includes(href.slice(1)));
    return { wa: [...new Set(wa)], robots: document.querySelector('meta[name=robots]')?.content, broken };
  });
  report.checks.links = links;
  if (links.wa.some((href) => href !== WA)) report.errors.push('WhatsApp alterado: ' + links.wa.join(' | '));
  if (links.broken.length) report.errors.push('âncoras quebradas ' + links.broken.join(','));
  if (links.robots !== 'noindex, nofollow') report.errors.push('robots ' + links.robots);

  await page.focus('[data-mod-tab]');
  await page.keyboard.press('ArrowRight');
  await wait(200);
  report.checks.tabKey = await page.evaluate(() => document.querySelector('[data-mod-tab][aria-selected="true"]')?.id);
  await page.locator('[data-nav-link][href="#faq"]').click();
  await wait(700);
  const focusId = await page.evaluate(() => document.activeElement?.id || document.activeElement?.tagName);
  report.checks.anchorFocus = focusId;
  if (focusId !== 'faq') report.errors.push('foco da âncora não foi para #faq (' + focusId + ')');
  await ctx.close();
}

{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => report.errors.push('mob ' + e.message));
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await wait(700);
  report.checks.mobileLenis = await page.evaluate(() => document.documentElement.classList.contains('lenis'));
  if (report.checks.mobileLenis) report.errors.push('Lenis ativo no mobile');
  await page.screenshot({ path: path.join(OUT, 'after-mobile390-hero.png') });
  await overflow(page, 'mob390-hero');
  await page.locator('[data-nav-toggle]').click();
  await wait(250);
  await page.screenshot({ path: path.join(OUT, 'after-mobile390-menu.png') });
  await page.keyboard.press('Escape');
  await wait(200);
  const menu = await page.getAttribute('[data-nav-toggle]', 'aria-expanded');
  report.checks.escape = menu;
  if (menu !== 'false') report.errors.push('Escape não fechou o menu');
  await page.locator('#jornada').scrollIntoViewIfNeeded();
  await wait(400);
  await page.screenshot({ path: path.join(OUT, 'after-mobile390-jornada.png') });
  await overflow(page, 'mob390-jornada');
  const frames = await page.evaluate(() => [...document.querySelectorAll('.journey-frame')].map((f) => getComputedStyle(f).display !== 'none' && getComputedStyle(f).visibility !== 'hidden'));
  report.checks.mobileFramesVisible = frames;
  if (frames.some((v) => !v)) report.errors.push('frame da jornada oculto no mobile');
  await ctx.close();
}

{
  const ctx = await browser.newContext({ viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await wait(400);
  for (const id of ['topo', 'produto', 'jornada', 'contato']) {
    if (id !== 'topo') await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await overflow(page, `mob360-${id}`);
  }
  await page.screenshot({ path: path.join(OUT, 'after-mobile360-hero.png') });
  await ctx.close();
}

{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await wait(500);
  const state = await page.evaluate(() => ({
    reduce: document.documentElement.classList.contains('reduce-motion'),
    lenis: document.documentElement.classList.contains('lenis'),
    cursor: document.documentElement.classList.contains('cursor-on'),
    frames: [...document.querySelectorAll('.journey-frame')].every((f) => getComputedStyle(f).opacity === '1' && getComputedStyle(f).visibility === 'visible'),
    words: [...document.querySelectorAll('[data-word]')].every((w) => getComputedStyle(w).color === 'rgb(13, 52, 87)'),
    h1: document.querySelector('h1')?.innerText.replace(/\s+/g, ' ').trim(),
    scrub: document.querySelector('[data-word-scrub]')?.classList.contains('is-scrubbing') === true,
  }));
  report.checks.reduced = state;
  if (!state.reduce || state.lenis || state.cursor || !state.frames || !state.words || state.scrub) {
    report.errors.push('reduced-motion incompleto ' + JSON.stringify(state));
  }
  await page.screenshot({ path: path.join(OUT, 'after-desktop-reduce-hero.png') });
  await page.locator('#jornada').scrollIntoViewIfNeeded();
  await wait(300);
  await page.screenshot({ path: path.join(OUT, 'after-desktop-reduce-jornada.png') });
  await ctx.close();
}

{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await wait(400);
  await page.screenshot({ path: path.join(OUT, 'after-mobile390-reduce-hero.png') });
  await page.locator('#jornada').scrollIntoViewIfNeeded();
  await wait(300);
  await page.screenshot({ path: path.join(OUT, 'after-mobile390-reduce-jornada.png') });
  await ctx.close();
}

{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  const nojs = await page.evaluate(() => ({
    h1: document.querySelector('h1')?.innerText.replace(/\s+/g, ' ').trim(),
    pre: getComputedStyle(document.querySelector('.preloader')).display,
    hiddenReveal: [...document.querySelectorAll('.reveal')].filter((e) => getComputedStyle(e).opacity !== '1').length,
    steps: document.querySelectorAll('[data-journey-step] h3').length,
  }));
  report.checks.nojs = nojs;
  if (nojs.pre !== 'none' || nojs.hiddenReveal !== 0 || nojs.steps !== 4) report.errors.push('no-js ' + JSON.stringify(nojs));
  await page.screenshot({ path: path.join(OUT, 'after-desktop-nojs.png') });
  await ctx.close();
}

{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  for (let y = 0; y < 12000; y += 450) {
    await page.evaluate((y) => scrollTo(0, y), y);
    await wait(30);
  }
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  report.axe.desktop = axe.violations.map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length }));
  if (axe.violations.length) report.errors.push('axe ' + axe.violations.map((v) => v.id).join(','));
  await ctx.close();
}

await browser.close();
await writeFile(path.join(OUT, 'qa-motion.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ errors: report.errors, checks: report.checks, axe: report.axe, overflow: report.overflow.every((o) => o.ok) }, null, 2));
if (report.errors.length) process.exitCode = 1;
