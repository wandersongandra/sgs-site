import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

function motionPaused() {
  return document.querySelector<HTMLInputElement>('#pausar-movimento')?.checked === true;
}

const heroSyncs: Array<() => void> = [];

function prefersReduced() {
  return (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.classList.contains('reduce-motion')
  );
}

function hasFinePointer() {
  return window.matchMedia('(pointer: fine)').matches;
}

function isCoarseOrNarrow() {
  return (
    window.matchMedia('(max-width: 899px)').matches ||
    window.matchMedia('(pointer: coarse)').matches
  );
}

function focusTarget(el: HTMLElement) {
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
  el.focus({ preventScroll: true });
}

function initNav() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  const onScrollHeader = () => {
    if (!header) return;
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 8);
    if (hero) header.classList.toggle('is-solid', y > hero.offsetHeight - 80);
  };
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  const toggle = document.querySelector<HTMLButtonElement>('[data-nav-toggle]');
  const links = document.querySelector<HTMLElement>('[data-nav-links]');
  const setOpen = (open: boolean) => {
    links?.classList.toggle('is-open', open);
    toggle?.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle?.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.classList.toggle('nav-open', open);
  };
  toggle?.addEventListener('click', () => setOpen(!links?.classList.contains('is-open')));
  links?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && links?.classList.contains('is-open')) {
      setOpen(false);
      toggle?.focus();
    }
  });

  const desktopNav = window.matchMedia('(min-width: 721px)');
  const closeMenuOnDesktop = () => {
    if (desktopNav.matches) setOpen(false);
  };
  desktopNav.addEventListener('change', closeMenuOnDesktop);
  window.addEventListener('resize', closeMenuOnDesktop, { passive: true });
}

function initNavCurrent() {
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-nav-link]'));
  if (!links.length) return;
  const sections = links
    .map((a) => document.getElementById((a.getAttribute('href') || '').slice(1)))
    .filter((el): el is HTMLElement => !!el);

  const setCurrent = (id: string) => {
    links.forEach((a) => {
      const on = a.getAttribute('href') === `#${id}`;
      a.classList.toggle('is-current', on);
      if (on) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const hit = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (hit?.target.id) setCurrent(hit.target.id);
    },
    { rootMargin: '-42% 0px -48% 0px', threshold: [0.15, 0.4] },
  );
  sections.forEach((section) => observer.observe(section));
}

function bindAnchors(lenis?: Lenis) {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      if (a.target === '_blank') return;
      const href = a.getAttribute('href') || '';
      if (href.length < 2) return;
      const el = document.querySelector<HTMLElement>(href);
      if (!el) return;
      if (!lenis) {
        window.setTimeout(() => focusTarget(el), 0);
        return;
      }
      e.preventDefault();
      if (location.hash !== href) history.pushState(null, '', href);
      lenis.scrollTo(el, { offset: -80, duration: 0.85 });
      focusTarget(el);
    });
  });
}

function initPassage(reduce: boolean) {
  const bar = document.querySelector<HTMLElement>('[data-passage]');
  if (!bar || reduce) return;
  let last = '';
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = (entry.target as HTMLElement).id;
        if (!id || id === last) return;
        last = id;
        bar.classList.remove('is-run');
        void bar.offsetWidth;
        bar.classList.add('is-run');
      });
    },
    { rootMargin: '-38% 0px -52% 0px', threshold: 0.01 },
  );
  document.querySelectorAll<HTMLElement>('main section[id]').forEach((section) => observer.observe(section));
}

function initModulesTabs(reduce: boolean) {
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

  const playPanel = (panel: HTMLElement) => {
    if (reduce) return;
    const bits = panel.querySelectorAll<HTMLElement>('.mod-mock-row, .mod-card');
    if (!bits.length) return;
    gsap.fromTo(
      bits,
      { autoAlpha: 0, y: 14 },
      { autoAlpha: 1, y: 0, duration: 0.42, stagger: 0.035, ease: 'power2.out', overwrite: 'auto' },
    );
  };

  const activate = (id: string, animate: boolean) => {
    tabs.forEach((tab) => {
      const on = tab.dataset.modTab === id;
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.tabIndex = on ? 0 : -1;
      if (on) moveIndicator(tab);
    });
    panels.forEach((panel) => {
      const on = panel.dataset.modPanel === id;
      if (on) {
        panel.hidden = false;
        requestAnimationFrame(() => panel.classList.add('is-active'));
        if (animate) playPanel(panel);
      } else {
        panel.classList.remove('is-active');
        panel.hidden = true;
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
  tabs.forEach((tab, i) => {
    tab.tabIndex = tab.getAttribute('aria-selected') === 'true' ? 0 : -1;
    tab.addEventListener('click', () => activate(tab.dataset.modTab || '', true));
    tab.addEventListener('keydown', (e) => {
      const map: Record<string, number> = {
        ArrowRight: i + 1,
        ArrowDown: i + 1,
        ArrowLeft: i - 1,
        ArrowUp: i - 1,
        Home: 0,
        End: tabs.length - 1,
      };
      if (!(e.key in map)) return;
      e.preventDefault();
      const next = tabs[(map[e.key] + tabs.length) % tabs.length];
      next.focus();
      activate(next.dataset.modTab || '', true);
    });
  });
}

function finishPreloader(el: HTMLElement) {
  el.classList.add('is-done');
  document.documentElement.classList.add('preloader-done');
  try {
    sessionStorage.setItem('sgs-preloader-done', '1');
  } catch {
    /* ignore */
  }
}

function initPreloader() {
  const el = document.querySelector<HTMLElement>('[data-preloader]');
  if (!el) return;
  finishPreloader(el);
}

function initMagnetic(fine: boolean, reduce: boolean) {
  if (!fine || reduce) return;
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((btn) => {
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) / 28;
      const y = (e.clientY - (r.top + r.height / 2)) / 28;
      gsap.to(btn, { x, y, duration: 0.35, ease: 'power3.out', overwrite: 'auto' });
    });
    btn.addEventListener('pointerleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
    });
  });
}

function initSpotlight(fine: boolean, reduce: boolean) {
  if (!fine || reduce) return;
  document.querySelectorAll<HTMLElement>('[data-spotlight]').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--spot-x', `${((e.clientX - r.left) / r.width) * 100}%`);
      card.style.setProperty('--spot-y', `${((e.clientY - r.top) / r.height) * 100}%`);
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
  const kpi = document.querySelector<HTMLElement>('[data-kpi]');
  if (kpi) kpi.textContent = '92%';
  const path = document.querySelector<SVGPathElement>('[data-hero-path]');
  if (path) path.style.strokeDashoffset = '0';
}

function layoutHeroThread() {
  const stage = document.querySelector<HTMLElement>('[data-hero-stage]');
  const svg = stage?.querySelector<SVGSVGElement>('[data-hero-thread]');
  const path = svg?.querySelector<SVGPathElement>('[data-hero-path]');
  const bead = svg?.querySelector<SVGCircleElement>('[data-hero-bead]');
  const phone = stage?.querySelector<HTMLElement>('[data-phone]');
  const list = stage?.querySelector<HTMLElement>('[data-dash-list]');
  if (!stage || !svg || !path || !bead || !phone || !list) return null;
  const box = stage.getBoundingClientRect();
  if (box.width < 8 || box.height < 8) return null;
  const pr = phone.getBoundingClientRect();
  const lr = list.getBoundingClientRect();
  const x1 = pr.left - box.left + pr.width * 0.22;
  const y1 = pr.top - box.top + 14;
  const x2 = lr.left - box.left + 10;
  const y2 = lr.top - box.top + lr.height * 0.42;
  const bow = Math.min(x1, x2) - 48;
  svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
  const d = `M ${x1.toFixed(1)} ${y1.toFixed(1)} C ${bow.toFixed(1)} ${(y1 - 24).toFixed(1)}, ${bow.toFixed(1)} ${(y2 + 28).toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  path.setAttribute('d', d);
  const len = path.getTotalLength();
  path.style.strokeDasharray = `${len}`;
  path.dataset.len = String(len);
  const point = path.getPointAtLength(0);
  bead.setAttribute('cx', String(point.x));
  bead.setAttribute('cy', String(point.y));
  return { path, bead, len };
}

function initHeroSync(reduce: boolean) {
  const stage = document.querySelector('[data-hero-stage]');
  if (!stage) return;
  const thread = layoutHeroThread();
  window.addEventListener('resize', () => layoutHeroThread(), { passive: true });

  if (reduce) {
    settleHeroReduced();
    return;
  }

  const phoneItems = gsap.utils.toArray<HTMLElement>('[data-phone-item]');
  const dashItems = gsap.utils.toArray<HTMLElement>('[data-dash-item]');
  const bars = gsap.utils.toArray<HTMLElement>('[data-chart] span');
  const chip = document.querySelector<HTMLElement>('[data-sync-chip]');
  const kpi = document.querySelector<HTMLElement>('[data-kpi]');

  gsap.set(bars, { scaleY: 0.28, transformOrigin: 'bottom' });
  if (chip) gsap.set(chip, { autoAlpha: 0, y: 8 });
  if (thread) thread.path.style.strokeDashoffset = String(thread.len);

  const placeBead = (progress: number) => {
    const live = document.querySelector<SVGPathElement>('[data-hero-path]');
    const bead = document.querySelector<SVGCircleElement>('[data-hero-bead]');
    if (!live || !bead) return;
    const len = Number(live.dataset.len || 0);
    if (!len) return;
    const point = live.getPointAtLength(len * progress);
    bead.setAttribute('cx', String(point.x));
    bead.setAttribute('cy', String(point.y));
  };

  const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.6, defaults: { ease: 'power2.out' } });
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
    gsap.set(bars, { scaleY: 0.28 });
    if (chip) gsap.set(chip, { autoAlpha: 0, y: 8 });
    if (kpi) kpi.textContent = '80%';
    const live = document.querySelector<SVGPathElement>('[data-hero-path]');
    if (live?.dataset.len) live.style.strokeDashoffset = live.dataset.len;
    placeBead(0);
  });

  if (thread) {
    tl.to(
      thread.path,
      {
        strokeDashoffset: 0,
        duration: 1.7,
        ease: 'none',
        onUpdate() {
          const live = document.querySelector<SVGPathElement>('[data-hero-path]');
          const len = Number(live?.dataset.len || 1);
          const current = Number(gsap.getProperty(thread.path, 'strokeDashoffset'));
          placeBead(1 - current / len);
        },
      },
      0.15,
    );
  }

  phoneItems.forEach((item, i) => {
    tl.to(item, { duration: 0.01, onStart: () => item.classList.add('is-done') }, i * 0.42 + 0.2);
    const dash = dashItems[i];
    if (!dash) return;
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
      i * 0.42 + 0.42,
    );
  });

  tl.to(bars, { scaleY: 1, duration: 1.05, stagger: 0.05, ease: 'power3.out' }, 0.55);
  if (kpi) {
    const proxy = { value: 80 };
    tl.to(
      proxy,
      {
        value: 92,
        duration: 0.8,
        snap: { value: 1 },
        onUpdate: () => {
          kpi.textContent = `${Math.round(proxy.value)}%`;
        },
      },
      '-=0.55',
    );
  }
  if (chip) tl.to(chip, { autoAlpha: 1, y: 0, duration: 0.4 }, '-=0.3');
  tl.to({}, { duration: 2.2 });

  const syncHero = () => {
    const hold = motionPaused() || document.hidden || !ScrollTrigger.isInViewport(stage);
    if (hold) tl.pause();
    else tl.play();
    if (stage instanceof HTMLElement) stage.dataset.heroHold = hold ? '1' : '0';
  };
  heroSyncs.push(syncHero);
  ScrollTrigger.create({
    trigger: stage,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: syncHero,
  });
  document.addEventListener('visibilitychange', syncHero);
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
    { yPercent: 112 },
    { yPercent: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, delay: 0.05 },
  );
}

function initHeadingMasks(reduce: boolean) {
  if (reduce) return;
  document.querySelectorAll<HTMLElement>('main h2').forEach((h2) => {
    if (h2.hasAttribute('data-word-scrub') || h2.dataset.maskReady === '1') return;
    const parts = h2.innerHTML.split(/<br\s*\/?>/i).map((part) => part.trim()).filter(Boolean);
    if (!parts.length) return;
    h2.replaceChildren();
    const inners: HTMLElement[] = [];
    parts.forEach((part) => {
      const line = document.createElement('span');
      line.className = 'mask-line';
      const inner = document.createElement('span');
      inner.className = 'mask-inner';
      inner.innerHTML = part;
      line.appendChild(inner);
      h2.appendChild(line);
      inners.push(inner);
    });
    h2.dataset.maskReady = '1';
    gsap.fromTo(
      inners,
      { yPercent: 110 },
      {
        yPercent: 0,
        duration: 0.75,
        ease: 'power3.out',
        stagger: 0.05,
        immediateRender: false,
        scrollTrigger: { trigger: h2, start: 'top 90%', once: true },
      },
    );
  });
}

function layoutJourneyThread() {
  const root = document.querySelector<HTMLElement>('[data-journey-steps]');
  const svg = root?.querySelector<SVGSVGElement>('[data-journey-thread]');
  const path = svg?.querySelector<SVGPathElement>('[data-journey-path]');
  const bead = svg?.querySelector<SVGCircleElement>('[data-journey-bead]');
  if (!root || !svg || !path || !bead) return null;
  const marks = Array.from(root.querySelectorAll<HTMLElement>('.journey-step .n'));
  if (marks.length < 2) return null;
  const box = root.getBoundingClientRect();
  if (box.width < 8 || box.height < 8) return null;
  const pts = marks.map((mark) => {
    const r = mark.getBoundingClientRect();
    return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top };
  });
  svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[i - 1];
    const p1 = pts[i];
    const my = (p0.y + p1.y) / 2;
    d += ` C ${p0.x.toFixed(1)} ${my.toFixed(1)}, ${p1.x.toFixed(1)} ${my.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
  }
  path.setAttribute('d', d);
  const len = path.getTotalLength();
  path.style.strokeDasharray = `${len}`;
  path.dataset.len = String(len);
  return { path, bead, len };
}

function initJourney(reduce: boolean) {
  const root = document.querySelector<HTMLElement>('[data-journey-steps]');
  if (!root) return;
  const steps = Array.from(root.querySelectorAll<HTMLElement>('[data-journey-step]'));
  const setActive = (index: number) => {
    steps.forEach((el, i) => {
      const on = i === index;
      el.classList.toggle('is-active', on);
      el.querySelector('[data-journey-frame]')?.classList.toggle('is-active', on);
    });
    document.querySelectorAll<HTMLAnchorElement>('[data-journey-jump]').forEach((a, i) => {
      const on = i === index;
      a.classList.toggle('is-current', on);
      if (on) a.setAttribute('aria-current', 'step');
      else a.removeAttribute('aria-current');
    });
  };

  if (reduce) {
    steps.forEach((el) => {
      el.classList.add('is-active');
      el.querySelector('[data-journey-frame]')?.classList.add('is-active');
    });
    const drawn = layoutJourneyThread();
    if (drawn) drawn.path.style.strokeDashoffset = '0';
    return;
  }

  const narrow = window.matchMedia('(max-width: 899px)').matches;
  if (narrow) {
    setActive(0);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = Number((entry.target as HTMLElement).dataset.journeyStep || '0');
          setActive(index);
        });
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0.15 },
    );
    steps.forEach((step) => observer.observe(step));
    return;
  }

  let metric = layoutJourneyThread();
  const sync = (progress: number) => {
    if (!metric) metric = layoutJourneyThread();
    if (!metric) return;
    const p = Math.min(1, Math.max(0, progress));
    metric.path.style.strokeDashoffset = String(metric.len * (1 - p));
    const point = metric.path.getPointAtLength(Math.max(0.01, metric.len * p));
    metric.bead.setAttribute('cx', String(point.x));
    metric.bead.setAttribute('cy', String(point.y));
    setActive(Math.min(steps.length - 1, Math.floor(p * steps.length * 0.999)));
  };
  sync(0);
  ScrollTrigger.create({
    trigger: root,
    start: 'top 55%',
    end: 'bottom 55%',
    scrub: 0.4,
    onUpdate: (self) => sync(self.progress),
  });
  const relayout = () => {
    metric = layoutJourneyThread();
    ScrollTrigger.refresh();
  };
  window.addEventListener('resize', relayout, { passive: true });
  window.addEventListener('load', relayout, { once: true });
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

  let running: gsap.core.Timeline | null = null;
  const play = () => {
    if (reduce || root.dataset.chatDone === 'true') {
      fillAll();
      return;
    }
    if (motionPaused()) {
      running?.pause();
      return;
    }
    if (running && running.progress() < 1) {
      running.play();
      return;
    }
    bubbles.forEach((b) => {
      b.classList.remove('is-in', 'chat-cursor');
      b.textContent = b.classList.contains('user') ? b.dataset.full || '' : '';
    });
    const tl = gsap.timeline({ onComplete: fillAll });
    running = tl;
    bubbles.forEach((bubble, i) => {
      const full = bubble.dataset.full || '';
      tl.to(
        bubble,
        {
          duration: 0.16,
          onStart: () => {
            bubble.classList.add('is-in');
            if (bubble.classList.contains('user')) bubble.textContent = full;
          },
        },
        i === 0 ? 0 : '+=0.18',
      );
      if (bubble.classList.contains('sophie')) {
        tl.to(
          {},
          {
            duration: Math.min(1.15, Math.max(0.45, full.length * 0.01)),
            onStart: () => bubble.classList.add('chat-cursor'),
            onUpdate() {
              bubble.textContent = full.slice(0, Math.max(1, Math.floor(full.length * this.progress())));
            },
            onComplete: () => {
              bubble.textContent = full;
              bubble.classList.remove('chat-cursor');
            },
          },
        );
      }
    });
  };

  if (reduce) {
    play();
    return;
  }
  ScrollTrigger.create({ trigger: root, start: 'top 82%', once: true, onEnter: play });
  window.addEventListener('sgs-motion-toggle', () => {
    if (root.dataset.chatDone === 'true') return;
    if (!motionPaused() && !ScrollTrigger.isInViewport(root)) return;
    play();
  });
}

function initMotionControl() {
  const input = document.querySelector<HTMLInputElement>('#pausar-movimento');
  input?.addEventListener('change', () => {
    heroSyncs.forEach((fn) => fn());
    window.dispatchEvent(new Event('sgs-motion-toggle'));
  });
  const bands = document.querySelectorAll('[data-marquee-band]');
  if (!bands.length || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.target.classList.toggle('is-offscreen', !entry.isIntersecting));
  });
  bands.forEach((band) => observer.observe(band));
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
    start: 'top 96%',
    once: true,
    onEnter: () => el.classList.add('is-in'),
  });
}

function initSectionTheme(reduce: boolean) {
  if (reduce) return;
  document.querySelectorAll<HTMLElement>('.section-dark, .cta-bleed').forEach((section) => {
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
    root.classList.remove('is-scrubbing');
    return;
  }
  root.classList.add('is-scrubbing');
  ScrollTrigger.create({
    trigger: root,
    start: 'top 78%',
    end: 'bottom 55%',
    scrub: 0.4,
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
    start: 'top 78%',
    once: true,
    onEnter: () => stage.classList.add('is-drawn'),
  });
}

export function initMotion() {
  document.documentElement.classList.add('motion-ready');
  const reduce = prefersReduced();
  const fine = hasFinePointer();

  initNav();
  initMotionControl();
  initNavCurrent();
  initModulesTabs(reduce);
  initPreloader();
  initMagnetic(fine, reduce);
  initSpotlight(fine, reduce);
  initHeroSplit(reduce);
  initHeroSync(reduce);
  initHeadingMasks(reduce);
  initWordScrub(reduce);
  initJourney(reduce);
  initSophieChat(reduce);
  initCheckDraw(reduce);
  initShield(reduce);
  initFooterWordmark(reduce);
  initPassage(reduce);
  if (!reduce) initSectionTheme(false);

  const allowLenis = !reduce && !isCoarseOrNarrow() && fine;
  if (!allowLenis) {
    bindAnchors();
    return;
  }

  const lenis = new Lenis({
    duration: 0.9,
    smoothWheel: true,
    syncTouch: false,
    autoRaf: false,
    anchors: false,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
  bindAnchors(lenis);
}
