// ============================================
// UTILS
// ============================================
const lerp = (a, b, t) => a + (b - a) * t;

// ============================================
// HERO CANVAS — Mirror's Edge grid + particles
// Thin geometric lines that react to mouse,
// with floating nodes and a red accent beam.
// ============================================
(function heroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, mx = 0, my = 0, targetMx = 0, targetMy = 0;
  let nodes = [], beams = [];
  let animId;

  const RED   = 'rgba(230,57,70,';
  const WHITE  = 'rgba(180,180,180,';

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    initNodes();
  }

  function initNodes() {
    nodes = [];
    const cols = Math.ceil(W / 120) + 1;
    const rows = Math.ceil(H / 120) + 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        nodes.push({
          bx: c * 120,        // base x
          by: r * 120,        // base y
          x: c * 120,
          y: r * 120,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18,
          r: Math.random() > 0.85 ? 2.5 : 1.2,
          isRed: Math.random() > 0.93,
          alpha: 0.15 + Math.random() * 0.25,
        });
      }
    }

    // a handful of fast beams (Mirror's Edge runner trails)
    beams = Array.from({ length: 4 }, () => makeBeam());
  }

  function makeBeam() {
    const horiz = Math.random() > 0.5;
    return {
      horiz,
      x: horiz ? -80 : Math.random() * W,
      y: horiz ? Math.random() * H : -80,
      speed: 1.2 + Math.random() * 1.8,
      length: 60 + Math.random() * 100,
      alpha: 0.18 + Math.random() * 0.22,
    };
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // smooth cursor follow
    mx = lerp(mx, targetMx, 0.06);
    my = lerp(my, targetMy, 0.06);

    // update nodes
    nodes.forEach(n => {
      // drift
      n.x += n.vx;
      n.y += n.vy;

      // mouse repulsion (gentle)
      const dx = n.x - mx;
      const dy = n.y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 180) {
        const force = (180 - dist) / 180;
        n.x += (dx / dist) * force * 1.4;
        n.y += (dy / dist) * force * 1.4;
      }

      // drift back toward base gently
      n.x = lerp(n.x, n.bx, 0.008);
      n.y = lerp(n.y, n.by, 0.008);
    });

    // draw edges between close nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d > 180) continue;
        const t = 1 - d / 180;
        const isRed = a.isRed || b.isRed;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = isRed
          ? `${RED}${(t * 0.35).toFixed(3)})`
          : `${WHITE}${(t * 0.12).toFixed(3)})`;
        ctx.lineWidth = isRed ? 1 : 0.5;
        ctx.stroke();
      }
    }

    // draw nodes
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = n.isRed
        ? `${RED}${n.alpha.toFixed(2)})`
        : `${WHITE}${n.alpha.toFixed(2)})`;
      ctx.fill();
    });

    // draw beams
    beams.forEach(b => {
      const grad = b.horiz
        ? ctx.createLinearGradient(b.x, 0, b.x + b.length, 0)
        : ctx.createLinearGradient(0, b.y, 0, b.y + b.length);
      grad.addColorStop(0, `${RED}0)`);
      grad.addColorStop(0.5, `${RED}${b.alpha})`);
      grad.addColorStop(1, `${RED}0)`);

      ctx.beginPath();
      if (b.horiz) {
        ctx.rect(b.x, b.y - 0.75, b.length, 1.5);
      } else {
        ctx.rect(b.x - 0.75, b.y, 1.5, b.length);
      }
      ctx.fillStyle = grad;
      ctx.fill();

      // advance
      if (b.horiz) { b.x += b.speed; if (b.x > W + 200) Object.assign(b, makeBeam(), { horiz: true, x: -200 }); }
      else          { b.y += b.speed; if (b.y > H + 200) Object.assign(b, makeBeam(), { horiz: false, y: -200 }); }
    });

    animId = requestAnimationFrame(draw);
  }

  // kick off
  resize();
  draw();

  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    targetMx = e.clientX - rect.left;
    targetMy = e.clientY - rect.top;
  }, { passive: true });

  // pause when off-screen for perf
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) { if (!animId) draw(); }
    else { cancelAnimationFrame(animId); animId = null; }
  });
  obs.observe(canvas);
})();

// ============================================
// CUSTOM CURSOR
// ============================================
(function customCursor() {
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

  (function tick() {
    dot.style.left  = mx + 'px';
    dot.style.top   = my + 'px';
    rx = lerp(rx, mx, 0.12);
    ry = lerp(ry, my, 0.12);
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(tick);
  })();

  const hoverSel = 'a, button, .project-head, [data-stagger], .contact-link, .magnetic, .magnetic-sm';
  document.addEventListener('mouseover', e => { if (e.target.closest(hoverSel)) document.body.classList.add('cursor-hover'); });
  document.addEventListener('mouseout',  e => { if (e.target.closest(hoverSel)) document.body.classList.remove('cursor-hover'); });
  document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
  document.addEventListener('mouseup',   () => document.body.classList.remove('cursor-click'));
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
      const r  = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width  / 2)) * strength;
      const dy = (e.clientY - (r.top  + r.height / 2)) * strength;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transition = 'transform 0.55s cubic-bezier(0.34,1.56,0.64,1)';
      el.style.transform  = 'translate(0,0)';
      setTimeout(() => { el.style.transition = ''; }, 560);
    });
  }

  document.querySelectorAll('.magnetic').forEach(el => applyMagnetic(el, 0.32));
  document.querySelectorAll('.magnetic-sm').forEach(el => applyMagnetic(el, 0.16));
})();

// ============================================
// SCROLL PROGRESS BAR
// ============================================
(function scrollProgress() {
  const bar = document.getElementById('progressBar');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const dh = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (dh > 0 ? (window.scrollY / dh) * 100 : 0) + '%';
  }, { passive: true });
})();

// ============================================
// NAV — scrolled state + dark-section detection
// ============================================
(function navState() {
  const nav = document.getElementById('mainNav');
  if (!nav) return;
  const darkSections = document.querySelectorAll('.section-dark, .footer');

  function update() {
    nav.classList.toggle('scrolled', window.scrollY > 20);
    const nb = nav.getBoundingClientRect().bottom;
    let onDark = false;
    darkSections.forEach(s => {
      const r = s.getBoundingClientRect();
      if (r.top <= nb && r.bottom >= 0) onDark = true;
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
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  chars.forEach((ch, i) => {
    if (reduced) { ch.style.opacity = '1'; ch.style.transform = 'none'; }
    else ch.style.animationDelay = (0.04 + i * 0.055) + 's';
  });
})();

// ============================================
// SCROLL REVEAL
// ============================================
(function scrollReveal() {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) { items.forEach(el => el.classList.add('visible')); return; }
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  items.forEach(el => obs.observe(el));
})();

// ============================================
// STACK ITEM STAGGER
// ============================================
(function stackStagger() {
  const items = document.querySelectorAll('[data-stagger]');
  if (!items.length) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) { items.forEach(el => el.classList.add('visible')); return; }
  const seen = new Set();
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const siblings = entry.target.parentElement.querySelectorAll('[data-stagger]');
      siblings.forEach((s, i) => setTimeout(() => s.classList.add('visible'), i * 75));
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.15 });
  items.forEach(el => {
    const p = el.parentElement;
    if (!seen.has(p)) { seen.add(p); obs.observe(el); }
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

      // close others
      projects.forEach(p => {
        if (p !== project && p.getAttribute('data-open') === 'true') {
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
        setTimeout(() => {
          const top = project.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top, behavior: 'smooth' });
        }, 120);
      }
    });
  });

  window.addEventListener('resize', () => {
    projects.forEach(p => {
      if (p.getAttribute('data-open') === 'true') {
        const b = p.querySelector('.project-body');
        const i = p.querySelector('.project-body-inner');
        if (b && i) b.style.height = i.scrollHeight + 'px';
      }
    });
  }, { passive: true });
})();

// ============================================
// SMOOTH SCROLL for anchor links
// ============================================
(function smoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href').slice(1);
      const target = id ? document.getElementById(id) : null;
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
