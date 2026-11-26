import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

type Fine = boolean;

function prefersReduced() {
  return (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.classList.contains('reduce-motion')
  );
}

function hasFinePointer() {
  return window.matchMedia('(pointer: fine)').matches;
}

function initNav() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  const onScrollHeader = () => {
    if (!header) return;
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 8);
    if (hero) {
      const past = y > hero.offsetHeight - 80;
      header.classList.toggle('is-solid', past);
    }
  };
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  const toggle = document.querySelector<HTMLButtonElement>('[data-nav-toggle]');
  const links = document.querySelector<HTMLElement>('[data-nav-links]');
  toggle?.addEventListener('click', () => {
    const open = links?.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  links?.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      links.classList.remove('is-open');
      toggle?.setAttribute('aria-expanded', 'false');
    });
  });
}

function initModulesTabs() {
  const tabsRoot = document.querySelector<HTMLElement>('[data-mod-tabs]');
  const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-mod-tab]'));
  const panels = Array.from(document.querySelectorAll<HTMLElement>('[data-mod-panel]'));
  const indicator = document.querySelector<HTMLElement>('[data-mod-indicator]');
  if (!tabs.length) return;

  const moveIndicator = (tab: HTMLElement) => {
    if (!indicator || !tabsRoot) return;
    const rootBox = tabsRoot.getBoundingClientRect();
    const box = tab.getBoundingClientRect();
    indicator.style.width = `${box.width}px`;
    indicator.style.transform = `translateX(${box.left - rootBox.left}px)`;
  };

  const activate = (id: string) => {
    tabs.forEach((tab) => {
      const on = tab.dataset.modTab === id;
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      if (on) moveIndicator(tab);
    });
    panels.forEach((panel) => {
      const on = panel.dataset.modPanel === id;
      if (on) {
        panel.hidden = false;
        requestAnimationFrame(() => panel.classList.add('is-active'));
      } else {
        panel.classList.remove('is-active');
        window.setTimeout(() => {
          if (panel.dataset.modPanel !== id) panel.hidden = true;
        }, 280);
      }
    });
  };

  const initial = tabs.find((t) => t.getAttribute('aria-selected') === 'true') || tabs[0];
  if (initial) {
    moveIndicator(initial);
    requestAnimationFrame(() => moveIndicator(initial));
  }
  window.addEventListener('resize', () => {
    const current = tabs.find((t) => t.getAttribute('aria-selected') === 'true');
    if (current) moveIndicator(current);
  });
  tabs.forEach((tab) => tab.addEventListener('click', () => activate(tab.dataset.modTab || '')));
}

function finishPreloader(el: HTMLElement) {
  el.classList.add('is-done');
  document.documentElement.classList.add('preloader-done');
  sessionStorage.setItem('sgs-preloader-done', '1');
}

function initPreloader(reduce: boolean) {
  const el = document.querySelector<HTMLElement>('[data-preloader]');
  if (!el) return;
  if (document.documentElement.classList.contains('preloader-done') || sessionStorage.getItem('sgs-preloader-done') === '1') {
    finishPreloader(el);
    return;
  }
  const skip = () => finishPreloader(el);
  el.querySelector('[data-preloader-skip]')?.addEventListener('click', skip);

  if (reduce) {
    skip();
    return;
  }

  const paths = el.querySelectorAll<SVGPathElement>('[data-draw]');
  paths.forEach((path) => {
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len}`;
    path.style.strokeDashoffset = `${len}`;
  });

  const tl = gsap.timeline({
    defaults: { ease: 'power2.out' },
    onComplete: skip,
  });
  tl.to(paths, { strokeDashoffset: 0, duration: 0.75, stagger: 0.08 }, 0);
  tl.fromTo('.preloader-label', { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.3 }, 0.35);
  tl.to({}, { duration: 0.25 });
}

function initCursor(fine: Fine, reduce: boolean) {
  const root = document.querySelector<HTMLElement>('[data-cursor]');
  const dot = document.querySelector<HTMLElement>('[data-cursor-dot]');
  const ring = document.querySelector<HTMLElement>('[data-cursor-ring]');
  if (!root || !dot || !ring || !fine || reduce) return;

  // Park far off-screen so QA shots never capture a mid-page ring
  const pos = { x: -200, y: -200 };
  const ringPos = { x: -200, y: -200 };
  let armed = false;
  root.classList.add('is-hidden');
  gsap.set([dot, ring], { x: -200, y: -200 });

  window.addEventListener(
    'pointermove',
    (e) => {
      // Ignore synthetic / zeroed events; require a real mouse delta
      if (!armed) {
        if (e.movementX === 0 && e.movementY === 0 && e.clientX === 0 && e.clientY === 0) return;
        armed = true;
        root.classList.add('is-ready');
        root.classList.remove('is-hidden');
      }
      pos.x = e.clientX;
      pos.y = e.clientY;
      root.classList.remove('is-hidden');
      gsap.set(dot, { x: pos.x, y: pos.y });
    },
    { passive: true },
  );
  window.addEventListener('pointerleave', () => root.classList.add('is-hidden'));
  window.addEventListener('blur', () => root.classList.add('is-hidden'));

  gsap.ticker.add(() => {
    if (!armed) return;
    ringPos.x += (pos.x - ringPos.x) * 0.18;
    ringPos.y += (pos.y - ringPos.y) * 0.18;
    gsap.set(ring, { x: ringPos.x, y: ringPos.y });
  });

  const hoverables = 'a, button, summary, [data-magnetic], [data-spotlight], .mod-tab';
  document.querySelectorAll(hoverables).forEach((el) => {
    el.addEventListener('pointerenter', () => root.classList.add('is-hover'));
    el.addEventListener('pointerleave', () => root.classList.remove('is-hover'));
  });
}

function initMagnetic(fine: Fine, reduce: boolean) {
  if (!fine || reduce) return;
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((btn) => {
    const strength = 18;
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      gsap.to(btn, { x: x / strength, y: y / strength, duration: 0.25, ease: 'power3.out' });
    });
    btn.addEventListener('pointerleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.45, ease: 'power3.out' });
    });
  });
}

function initSpotlight(fine: Fine, reduce: boolean) {
  if (!fine || reduce) return;
  document.querySelectorAll<HTMLElement>('[data-spotlight]').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--spot-x', `${((e.clientX - r.left) / r.width) * 100}%`);
      card.style.setProperty('--spot-y', `${((e.clientY - r.top) / r.height) * 100}%`);
    });
  });
}

function initHeroTilt(fine: Fine, reduce: boolean) {
  const root = document.querySelector<HTMLElement>('[data-tilt-root]');
  if (!root || !fine || reduce) return;
  const layers = Array.from(root.querySelectorAll<HTMLElement>('[data-tilt-layer]'));

  root.addEventListener('pointermove', (e) => {
    const r = root.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    layers.forEach((layer) => {
      const depth = Number(layer.dataset.tiltLayer || '0.4');
      layer.style.setProperty('--rx', `${(-py * 8 * depth).toFixed(2)}deg`);
      layer.style.setProperty('--ry', `${(px * 10 * depth).toFixed(2)}deg`);
      layer.style.setProperty('--tx', `${(px * 16 * depth).toFixed(2)}px`);
      layer.style.setProperty('--ty', `${(py * 12 * depth).toFixed(2)}px`);
    });
  });
  root.addEventListener('pointerleave', () => {
    layers.forEach((layer) => {
      layer.style.setProperty('--rx', '0deg');
      layer.style.setProperty('--ry', '0deg');
      layer.style.setProperty('--tx', '0px');
      layer.style.setProperty('--ty', '0px');
    });
  });
}

function settleHeroReduced() {
  document.querySelectorAll<HTMLElement>('[data-phone-item]').forEach((el) => el.classList.add('is-done'));
  document.querySelectorAll<HTMLElement>('[data-dash-item]').forEach((el) => el.classList.add('is-in'));
  document.querySelectorAll<HTMLElement>('[data-dash-item] [data-status]').forEach((el, i) => {
    if (i < 2) {
      el.textContent = 'Concluído';
      el.className = 'status status-ok';
    }
  });
  document.querySelectorAll<HTMLElement>('[data-chart] span').forEach((bar) => {
    bar.style.transform = 'scaleY(1)';
  });
  const chip = document.querySelector<HTMLElement>('[data-sync-chip]');
  if (chip) gsap.set(chip, { autoAlpha: 1, y: 0 });
}

function initHeroSync(reduce: boolean) {
  const stage = document.querySelector('[data-hero-stage]');
  if (!stage) return;
  if (reduce) {
    settleHeroReduced();
    return;
  }

  const phoneItems = gsap.utils.toArray<HTMLElement>('[data-phone-item]');
  const dashItems = gsap.utils.toArray<HTMLElement>('[data-dash-item]');
  const bars = gsap.utils.toArray<HTMLElement>('[data-chart] span');
  const chip = document.querySelector<HTMLElement>('[data-sync-chip]');
  const kpi = document.querySelector<HTMLElement>('[data-kpi]');

  gsap.set(bars, { scaleY: 0 });
  gsap.set(chip, { autoAlpha: 0, y: 8 });

  const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.4, defaults: { ease: 'power2.out' } });
  tl.add(() => {
    phoneItems.forEach((el) => el.classList.remove('is-done'));
    dashItems.forEach((el) => {
      el.classList.remove('is-in');
      const status = el.querySelector<HTMLElement>('[data-status]');
      const idx = Number(el.dataset.dashItem || '0');
      if (status && (idx === 0 || idx === 1)) {
        status.textContent = 'Aguardando';
        status.className = 'status status-sync';
      }
    });
    gsap.set(bars, { scaleY: 0 });
    gsap.set(chip, { autoAlpha: 0, y: 8 });
    if (kpi) kpi.textContent = '92%';
  });

  phoneItems.forEach((item, i) => {
    tl.to(item, { duration: 0.01, onStart: () => item.classList.add('is-done') }, i * 0.45 + 0.2);
    const dash = dashItems[i];
    if (dash) {
      tl.to(
        dash,
        {
          duration: 0.35,
          onStart: () => {
            dash.classList.add('is-in');
            const status = dash.querySelector<HTMLElement>('[data-status]');
            if (!status) return;
            if (i < 2) {
              status.textContent = 'Concluído';
              status.className = 'status status-ok';
            } else if (i === 2) {
              status.textContent = 'Em análise';
              status.className = 'status status-warn';
            } else {
              status.textContent = 'Publicado';
              status.className = 'status status-ok';
            }
          },
        },
        i * 0.45 + 0.45,
      );
    }
  });

  tl.to(bars, { scaleY: 1, duration: 0.7, stagger: 0.08, ease: 'power3.out' }, '-=0.2');
  if (kpi) {
    tl.fromTo(
      kpi,
      { textContent: 80 },
      {
        textContent: 92,
        duration: 0.8,
        snap: { textContent: 1 },
        onUpdate: function () {
          kpi.textContent = `${Math.round(Number(kpi.textContent))}%`;
        },
      },
      '-=0.6',
    );
  }
  tl.to(chip, { autoAlpha: 1, y: 0, duration: 0.4 }, '-=0.35');
  tl.to({}, { duration: 1.8 });
}

function initHeroSplit(reduce: boolean) {
  const title = document.querySelector<HTMLElement>('[data-split-hero]');
  if (!title) return;
  const lines = Array.from(title.querySelectorAll<HTMLElement>('.hero-line'));
  if (!lines.length) return;

  lines.forEach((line) => {
    if (line.querySelector('.line-inner')) return;
    const inner = document.createElement('span');
    inner.className = 'line-inner';
    inner.textContent = line.textContent || '';
    line.textContent = '';
    line.appendChild(inner);
  });

  if (reduce) return;

  gsap.fromTo(
    title.querySelectorAll('.line-inner'),
    { yPercent: 110 },
    {
      yPercent: 0,
      duration: 1,
      ease: 'power3.out',
      stagger: 0.1,
      delay: 0.15,
    },
  );
}

function initJourney(reduce: boolean) {
  const root = document.querySelector<HTMLElement>('[data-journey]');
  if (!root) return;
  const steps = gsap.utils.toArray<HTMLElement>('[data-journey-step]');
  const frames = gsap.utils.toArray<HTMLElement>('[data-journey-frame]');
  const bar = document.querySelector<HTMLElement>('[data-journey-bar]');
  const setActive = (index: number) => {
    steps.forEach((el, i) => el.classList.toggle('is-active', i === index));
    frames.forEach((el, i) => el.classList.toggle('is-active', i === index));
  };

  if (reduce) {
    setActive(0);
    if (bar) bar.style.width = '100%';
    return;
  }

  if (window.matchMedia('(max-width: 720px)').matches) {
    steps.forEach((step, index) => {
      ScrollTrigger.create({
        trigger: step,
        start: 'top 65%',
        onEnter: () => setActive(index),
        onEnterBack: () => setActive(index),
      });
    });
    return;
  }

  ScrollTrigger.create({
    trigger: root,
    start: 'top top+=72',
    end: () => `+=${Math.max(steps.length * 900, 3200)}`,
    pin: true,
    scrub: 0.55,
    anticipatePin: 1,
    onUpdate: (self) => {
      const idx = Math.min(steps.length - 1, Math.floor(self.progress * steps.length));
      setActive(idx);
      if (bar) bar.style.width = `${Math.max(4, self.progress * 100)}%`;
    },
  });
}

function initSophieChat(reduce: boolean) {
  const root = document.querySelector<HTMLElement>('[data-sophie-chat]');
  if (!root) return;
  const bubbles = gsap.utils.toArray<HTMLElement>('[data-chat-bubble]');

  const fillAll = () => {
    bubbles.forEach((b) => {
      b.textContent = b.dataset.full || b.textContent || '';
      b.classList.add('is-in');
      b.classList.remove('chat-cursor');
    });
    root.dataset.chatDone = 'true';
  };

  const play = () => {
    if (reduce) {
      fillAll();
      return;
    }
    bubbles.forEach((b) => {
      b.classList.remove('is-in', 'chat-cursor');
      b.textContent = b.classList.contains('user') ? b.dataset.full || '' : '';
    });
    const tl = gsap.timeline({ onComplete: fillAll });
    bubbles.forEach((bubble, i) => {
      const full = bubble.dataset.full || '';
      tl.to(
        bubble,
        {
          duration: 0.18,
          onStart: () => {
            bubble.classList.add('is-in');
            if (bubble.classList.contains('user')) bubble.textContent = full;
          },
        },
        i === 0 ? 0 : '+=0.2',
      );
      if (bubble.classList.contains('sophie')) {
        tl.to({}, {
          duration: Math.max(0.55, full.length * 0.012),
          onStart: () => bubble.classList.add('chat-cursor'),
          onUpdate: function () {
            const p = this.progress();
            bubble.textContent = full.slice(0, Math.floor(full.length * p));
          },
          onComplete: () => {
            bubble.textContent = full;
            bubble.classList.remove('chat-cursor');
          },
        });
      }
    });
  };

  ScrollTrigger.create({ trigger: root, start: 'top 80%', once: true, onEnter: play });
  if (reduce) play();
}

function initCheckDraw(reduce: boolean) {
  document.querySelectorAll<HTMLElement>('.mark-draw').forEach((mark) => {
    if (reduce) {
      mark.classList.add('is-drawn');
      return;
    }
    ScrollTrigger.create({
      trigger: mark,
      start: 'top 90%',
      once: true,
      onEnter: () => mark.classList.add('is-drawn'),
    });
  });
}

function initFooterWordmark(reduce: boolean) {
  const el = document.querySelector<HTMLElement>('[data-footer-wordmark]');
  if (!el) return;
  if (reduce) {
    el.classList.add('is-in');
    return;
  }
  ScrollTrigger.create({
    trigger: el,
    start: 'top 95%',
    once: true,
    onEnter: () => el.classList.add('is-in'),
  });
}

function initSectionTheme(reduce: boolean) {
  if (reduce) return;
  document.querySelectorAll<HTMLElement>('.section-dark, .cta-bleed, .hero-dark').forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 55%',
      end: 'bottom 45%',
      onEnter: () => document.documentElement.classList.add('theme-deep'),
      onEnterBack: () => document.documentElement.classList.add('theme-deep'),
      onLeave: () => document.documentElement.classList.remove('theme-deep'),
      onLeaveBack: () => document.documentElement.classList.remove('theme-deep'),
    });
  });
}


function initWordScrub(reduce: boolean) {
  const root = document.querySelector<HTMLElement>('[data-word-scrub]');
  if (!root) return;
  const words = gsap.utils.toArray<HTMLElement>('[data-word-scrub] [data-word]');
  if (!words.length) return;

  if (reduce) {
    words.forEach((w) => w.classList.add('is-lit'));
    return;
  }

  ScrollTrigger.create({
    trigger: root,
    start: 'top 75%',
    end: 'bottom 45%',
    scrub: true,
    onUpdate: (self) => {
      const n = Math.round(self.progress * (words.length - 1));
      words.forEach((w, i) => w.classList.toggle('is-lit', i <= n));
    },
  });
}

function initShield(reduce: boolean) {
  const stage = document.querySelector<HTMLElement>('[data-security-stage]');
  if (!stage) return;
  if (reduce) {
    stage.classList.add('is-drawn');
    return;
  }
  ScrollTrigger.create({
    trigger: stage,
    start: 'top 75%',
    once: true,
    onEnter: () => stage.classList.add('is-drawn'),
  });
}

export function initMotion() {
  const reduce = prefersReduced();
  const fine = hasFinePointer();

  initNav();
  initModulesTabs();
  initPreloader(reduce);
  initCursor(fine, reduce);
  initMagnetic(fine, reduce);
  initSpotlight(fine, reduce);
  initHeroTilt(fine, reduce);

  document.querySelectorAll<HTMLElement>('.reveal').forEach((el) => el.classList.add('is-visible'));

  if (reduce) {
    initHeroSync(true);
    initWordScrub(true);
    initJourney(true);
    initSophieChat(true);
    initCheckDraw(true);
    initShield(true);
    initFooterWordmark(true);
    return;
  }

  const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  document.querySelectorAll<HTMLElement>('.reveal').forEach((el) => {
    el.classList.remove('is-visible');
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 28 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
      },
    );
  });

  const stage = document.querySelector('[data-hero-stage]');
  if (stage) {
    gsap.fromTo(stage, { autoAlpha: 0, y: 36 }, { autoAlpha: 1, y: 0, duration: 1.05, ease: 'power3.out', delay: 0.2 });
  }

  initHeroSplit(false);
  initHeroSync(false);
  initWordScrub(false);
  initJourney(false);
  initSophieChat(false);
  initCheckDraw(false);
  initShield(false);
  initFooterWordmark(false);
  initSectionTheme(false);
}
