// ============================================
// SCROLL PROGRESS BAR
// ============================================
(function scrollProgress() {
  const bar = document.getElementById('progressBar');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = pct + '%';
  }, { passive: true });
})();

// ============================================
// NAV — scrolled state
// ============================================
(function navScrolled() {
  const nav = document.getElementById('mainNav');
  if (!nav) return;

  const update = () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  };

  window.addEventListener('scroll', update, { passive: true });
  update();
})();

// ============================================
// MOBILE MENU
// ============================================
(function mobileMenu() {
  const burger = document.getElementById('navBurger');
  const menu = document.getElementById('mobileMenu');
  if (!burger || !menu) return;

  burger.addEventListener('click', () => {
    const isOpen = menu.classList.contains('open');
    menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(!isOpen));
  });

  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      menu.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });
})();

// ============================================
// SCROLL REVEAL
// ============================================
(function scrollReveal() {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    items.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  items.forEach(el => observer.observe(el));
})();

// ============================================
// PROJECT ACCORDION
// ============================================
(function projectAccordion() {
  const projects = document.querySelectorAll('.project');

  projects.forEach(project => {
    const head = project.querySelector('.project-head');
    const body = project.querySelector('.project-body');
    const inner = project.querySelector('.project-body-inner');
    if (!head || !body || !inner) return;

    head.addEventListener('click', () => {
      const isOpen = project.getAttribute('data-open') === 'true';

      // close all others
      projects.forEach(p => {
        if (p !== project) {
          p.setAttribute('data-open', 'false');
          const b = p.querySelector('.project-body');
          const btn = p.querySelector('.project-head');
          if (b) b.style.height = '0px';
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
      }
    });
  });

  // Recalc on resize
  window.addEventListener('resize', () => {
    projects.forEach(project => {
      if (project.getAttribute('data-open') === 'true') {
        const body = project.querySelector('.project-body');
        const inner = project.querySelector('.project-body-inner');
        if (body && inner) body.style.height = inner.scrollHeight + 'px';
      }
    });
  }, { passive: true });
})();

// ============================================
// FOOTER YEAR
// ============================================
(function footerYear() {
  const el = document.getElementById('footerYear');
  if (el) el.textContent = new Date().getFullYear();
})();
