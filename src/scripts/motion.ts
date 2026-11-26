function prefersReduced() {
  return (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.classList.contains('reduce-motion')
  );
}

function initNav() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  const onScrollHeader = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  };
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  const toggle = document.querySelector<HTMLButtonElement>('[data-nav-toggle]');
  const links = document.querySelector<HTMLElement>('[data-nav-links]');
  const setOpen = (open: boolean) => {
    links?.classList.toggle('is-open', open);
    toggle?.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle?.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  };
  toggle?.addEventListener('click', () => setOpen(!links?.classList.contains('is-open')));
  links?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && links?.classList.contains('is-open')) {
      setOpen(false);
      toggle?.focus();
    }
  });
  window.addEventListener('resize', () => {
    if (window.matchMedia('(min-width: 721px)').matches) setOpen(false);
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
      tab.tabIndex = on ? 0 : -1;
      if (on) moveIndicator(tab);
    });
    panels.forEach((panel) => {
      const on = panel.dataset.modPanel === id;
      panel.hidden = !on;
      panel.classList.toggle('is-active', on);
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
    tab.addEventListener('click', () => activate(tab.dataset.modTab || ''));
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
      activate(next.dataset.modTab || '');
    });
  });
}

function initReveal(reduce: boolean) {
  const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  els.forEach((el) => el.classList.add('is-pending'));
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        entry.target.classList.remove('is-pending');
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
  );
  els.forEach((el) => io.observe(el));
}

function initParallax(reduce: boolean) {
  const el = document.querySelector<HTMLElement>('[data-parallax]');
  if (!el || reduce) return;
  const max = 24;
  let ticking = false;
  const update = () => {
    ticking = false;
    const y = window.scrollY;
    const t = Math.max(-max, Math.min(max, y * 0.08));
    el.style.transform = `translate3d(0, ${t}px, 0)`;
  };
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };
  update();
  window.addEventListener('scroll', onScroll, { passive: true });
}

export function initMotion() {
  const reduce = prefersReduced();
  initNav();
  initModulesTabs();
  initReveal(reduce);
  initParallax(reduce);
  document.documentElement.classList.add('motion-ready');
}
