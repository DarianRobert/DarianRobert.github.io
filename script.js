// ============================================
// UTILS
// ============================================
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

// ============================================
// CUSTOM CURSOR
// ============================================
(function customCursor() {
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;
  if (window.matchMedia('(pointer: coarse)').matches) return; // touch devices

  let mx = window.innerWidth / 2,  my = window.innerHeight / 2;
  let rx = mx, ry = my;
  let rafId;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  function tick() {
    // dot follows exactly
    dot.style.left  = mx + 'px';
    dot.style.top   = my + 'px';

    // ring lerps behind
    rx = lerp(rx, mx, 0.12);
    ry = lerp(ry, my, 0.12);
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';

    rafId = requestAnimationFrame(tick);
  }
  tick();

  // hover state on interactive elements
  const hoverTargets = 'a, button, .project-head, .project-stack li, .contact-link, .magnetic, .magnetic-sm';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverTargets)) document.body.classList.add('cursor-hover');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverTargets)) document.body.classList.remove('cursor-hover');
  });

  // click pulse
  document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
  document.addEventListener('mouseup',   () => document.body.classList.remove('cursor-click'));

  // hide when leaving window
  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
})();

// ============================================
// MAGNETIC BUTTONS
// ============================================
(function magneticButtons() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  function applyMagnetic(el, strength) {
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) * strength;
      const dy = (e.clientY - cy) * strength;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translate(0, 0)';
      el.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
      setTimeout(() => { el.style.transition = ''; }, 500);
    });
  }

  document.querySelectorAll('.magnetic').forEach(el => applyMagnetic(el, 0.3));
  document.querySelectorAll('.magnetic-sm').forEach(el => applyMagnetic(el, 0.15));
})();

// ============================================
// SCROLL PROGRESS BAR
// ============================================
(function scrollProgress() {
  const bar = document.getElementById('progressBar');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const st = window.scrollY;
    const dh = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (dh > 0 ? (st / dh) * 100 : 0) + '%';
  }, { passive: true });
})();

// ============================================
// NAV — scrolled state + dark section detection
// ============================================
(function navState() {
  const nav = document.getElementById('mainNav');
  if (!nav) return;

  // sections that have a dark background
  const darkSections = document.querySelectorAll('.section-dark, .footer');

  function update() {
    const navBottom = nav.getBoundingClientRect().bottom;
    nav.classList.toggle('scrolled', window.scrollY > 20);

    let onDark = false;
    darkSections.forEach(sec => {
      const r = sec.getBoundingClientRect();
      if (r.top <= navBottom && r.bottom >= 0) onDark = true;
    });
    nav.classList.toggle('dark-section', onDark);
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();

// ============================================
// MOBILE MENU
// ============================================
(function mobileMenu() {
  const burger = document.getElementById('navBurger');
  const menu   = document.getElementById('mobileMenu');
  if (!burger || !menu) return;

  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
  });
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      menu.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });
})();

// ============================================
// HERO CHARACTER STAGGER
// ============================================
(function heroChars() {
  const chars = document.querySelectorAll('.hero-name .char');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  chars.forEach((ch, i) => {
    if (prefersReduced) {
      ch.style.opacity = '1';
      ch.style.transform = 'none';
    } else {
      ch.style.animationDelay = (0.04 + i * 0.055) + 's';
    }
  });
})();

// ============================================
// SCROLL REVEAL
// ============================================
(function scrollReveal() {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) { items.forEach(el => el.classList.add('visible')); return; }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  items.forEach(el => observer.observe(el));
})();

// ============================================
// STACK ITEM STAGGER ON REVEAL
// ============================================
(function stackStagger() {
  const items = document.querySelectorAll('[data-stagger]');
  if (!items.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) { items.forEach(el => el.classList.add('visible')); return; }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // find siblings, stagger them
        const siblings = entry.target.parentElement.querySelectorAll('[data-stagger]');
        siblings.forEach((sib, i) => {
          setTimeout(() => sib.classList.add('visible'), i * 70);
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -40px 0px' });

  // observe only first item per list
  const seen = new Set();
  items.forEach(el => {
    const parent = el.parentElement;
    if (!seen.has(parent)) {
      seen.add(parent);
      observer.observe(el);
    }
  });
})();

// ============================================
// PROJECT ACCORDION
// ============================================
(function projectAccordion() {
  const projects = document.querySelectorAll('.project');

  projects.forEach(project => {
    const head  = project.querySelector('.project-head');
    const body  = project.querySelector('.project-body');
    const inner = project.querySelector('.project-body-inner');
    if (!head || !body || !inner) return;

    head.addEventListener('click', () => {
      const isOpen = project.getAttribute('data-open') === 'true';

      // close all others with animation
      projects.forEach(p => {
        if (p !== project && p.getAttribute('data-open') === 'true') {
          p.setAttribute('data-open', 'false');
          const b   = p.querySelector('.project-body');
          const btn = p.querySelector('.project-head');
          if (b)   b.style.height = '0px';
          if (btn) btn.setAttribute('aria-expanded', 'false');
        }
      });

      if (isOpen) {
        project.setAttribute('data-open', 'false');
        head.setAttribute('aria-expanded', 'false');
        body.style.height = '0px';
      } else {
        project.setAttribute('data-open', 'true');
        head.setAttribute('aria-expanded', 'true');
        body.style.height = inner.scrollHeight + 'px';

        // scroll project into view after a short delay
        setTimeout(() => {
          const top = project.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top, behavior: 'smooth' });
        }, 120);
      }
    });
  });

  // recalc on resize
  window.addEventListener('resize', () => {
    projects.forEach(project => {
      if (project.getAttribute('data-open') === 'true') {
        const body  = project.querySelector('.project-body');
        const inner = project.querySelector('.project-body-inner');
        if (body && inner) body.style.height = inner.scrollHeight + 'px';
      }
    });
  }, { passive: true });
})();

// ============================================
// SMOOTH SCROLL for nav anchor links
// ============================================
(function smoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href').slice(1);
      const target = id ? document.getElementById(id) : document.body;
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    });
  });
})();

// ============================================
// FOOTER YEAR
// ============================================
(function footerYear() {
  const el = document.getElementById('footerYear');
  if (el) el.textContent = new Date().getFullYear();
})();
