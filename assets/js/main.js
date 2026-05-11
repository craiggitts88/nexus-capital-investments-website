/* ═══════════════════════════════════════════════════════════════
   NEXUS CAPITAL & INVESTMENTS — main.js
   Particle canvas · Dropdown nav · 3D tilt · Scroll reveal · Counters
═══════════════════════════════════════════════════════════════ */

/* ── 1. PARTICLE CANVAS + BACKGROUND EFFECTS ── */
/* Grid, pulse rings, and particles all drawn here — the canvas is the only
   layer guaranteed to render over all page stacking contexts on every page. */
(function () {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const isAlgoPage = document.body.classList.contains('algo-page');
  const COLOR = isAlgoPage ? '0, 204, 255' : '201, 168, 76';

  let W, H, particles = [];
  const COUNT = 65;
  const MAX_DIST = 130;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  /* ── Grid ── */
  let gridTime = 0;
  const GRID_STEP = 80;

  function drawGrid(dt) {
    gridTime += dt * 6; // 6 px/s diagonal drift
    const off = ((gridTime % GRID_STEP) + GRID_STEP) % GRID_STEP;
    ctx.lineWidth = 1;
    // Horizontal lines
    ctx.strokeStyle = `rgba(${COLOR}, 0.13)`;
    ctx.beginPath();
    for (let y = off - GRID_STEP; y < H + GRID_STEP; y += GRID_STEP) {
      ctx.moveTo(0,  Math.round(y));
      ctx.lineTo(W,  Math.round(y));
    }
    ctx.stroke();
    // Vertical lines (slightly fainter)
    ctx.strokeStyle = `rgba(${COLOR}, 0.09)`;
    ctx.beginPath();
    for (let x = off - GRID_STEP; x < W + GRID_STEP; x += GRID_STEP) {
      ctx.moveTo(Math.round(x), 0);
      ctx.lineTo(Math.round(x), H);
    }
    ctx.stroke();
  }

  /* ── Corner pulse rings ── */
  const RING_PERIOD = 8000; // ms per full cycle

  function drawRings(ts) {
    const maxR = Math.hypot(W, H) * 0.55;
    const cx = W, cy = 0; // top-right corner
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
      const phase = ((ts + i * (RING_PERIOD / 3)) % RING_PERIOD) / RING_PERIOD;
      const r     = maxR * phase;
      const alpha = phase < 0.18
        ? (phase / 0.18) * 0.55
        : ((1 - phase) / 0.82) * 0.55;
      if (alpha < 0.02) continue;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${COLOR}, ${alpha})`;
      ctx.stroke();
    }
  }

  /* ── Particles ── */
  class Particle {
    constructor() { this.init(); }
    init() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.25;
      this.vy = (Math.random() - 0.5) * 0.25;
      this.r  = Math.random() * 1.6 + 0.4;
      this.a  = Math.random() * 0.22 + 0.04;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${COLOR}, ${this.a})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < COUNT; i++) particles.push(new Particle());

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < MAX_DIST) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${COLOR}, ${0.07 * (1 - d / MAX_DIST)})`;
          ctx.lineWidth   = 0.6;
          ctx.stroke();
        }
      }
    }
  }

  /* ── Main loop ── */
  let lastTs = 0;
  function loop(ts) {
    const dt = Math.min((ts - lastTs) / 1000, 0.05);
    lastTs = ts;

    ctx.clearRect(0, 0, W, H);

    // Background layers (drawn first, behind particles)
    drawGrid(dt);
    drawRings(ts);

    // Particles on top
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();


/* ── 2. NAVBAR — scroll state + mobile burger ── */
(function () {
  const nav    = document.getElementById('navbar');
  const burger = document.getElementById('nav-burger');
  const links  = document.getElementById('nav-links');

  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  if (burger && links) {
    burger.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open);
    });

    links.querySelectorAll('a.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        links.classList.remove('open');
        burger.classList.remove('open');
      });
    });
  }
})();


/* ── 3. PRODUCTS DROPDOWN ── */
(function () {
  const dropdowns = document.querySelectorAll('.nav-dropdown');

  dropdowns.forEach(dropdown => {
    const btn  = dropdown.querySelector('.nav-dropdown-btn');
    const menu = dropdown.querySelector('.nav-dropdown-menu');
    if (!btn || !menu) return;

    let leaveTimer;

    // Toggle on click (works on desktop + mobile)
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      clearTimeout(leaveTimer);
      const isOpen = dropdown.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen);
    });

    // Hover open on desktop — clear any pending close on re-enter
    dropdown.addEventListener('mouseenter', () => {
      if (window.innerWidth > 700) {
        clearTimeout(leaveTimer);
        dropdown.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
    // Delay close so cursor can travel into the menu without it vanishing
    dropdown.addEventListener('mouseleave', () => {
      if (window.innerWidth > 700) {
        leaveTimer = setTimeout(() => {
          dropdown.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
        }, 180);
      }
    });

    // Keep open if mouse enters the menu itself
    menu.addEventListener('mouseenter', () => { clearTimeout(leaveTimer); });
    menu.addEventListener('mouseleave', () => {
      if (window.innerWidth > 700) {
        leaveTimer = setTimeout(() => {
          dropdown.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
        }, 180);
      }
    });
  });

  // Close all dropdowns when clicking outside
  document.addEventListener('click', () => {
    dropdowns.forEach(d => {
      d.classList.remove('open');
      const btn = d.querySelector('.nav-dropdown-btn');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  });
})();


/* ── 4. SMOOTH SCROLL for anchor links ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});


/* ── 5. 3D CARD TILT (mouse-tracking) ── */
(function () {
  const cards = document.querySelectorAll('[data-tilt]');
  const MAX_TILT = 12;

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top)  / rect.height;
      const tX = (y - 0.5) * -MAX_TILT;
      const tY = (x - 0.5) *  MAX_TILT;
      card.style.transform = `perspective(900px) rotateX(${tX}deg) rotateY(${tY}deg) translateZ(12px)`;
      const shine = card.querySelector('.feat-card-shine');
      if (shine) {
        shine.style.setProperty('--mx', `${x * 100}%`);
        shine.style.setProperty('--my', `${y * 100}%`);
      }
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)';
    });
  });
})();


/* ── 6. SCROLL REVEAL ── */
(function () {
  const els = document.querySelectorAll('[data-reveal]');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('revealed'), i * 200);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  els.forEach(el => obs.observe(el));
})();


/* ── 7. FEATURE CARD ENTRANCE ANIMATION ── */
(function () {
  const cards = document.querySelectorAll('.feat-card, .method-card, .product-card, .algo-product-card');
  cards.forEach(card => {
    card.style.opacity   = '0';
    card.style.transform = 'translateY(36px)';
    card.style.transition = 'opacity 0.65s ease, transform 0.65s ease, border-color 0.35s, box-shadow 0.35s';
  });
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity   = '1';
          entry.target.style.transform = 'translateY(0)';
        }, i * 130);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  cards.forEach(card => obs.observe(card));
})();


/* ── 8. STAT COUNTER ANIMATION ── */
(function () {
  const counters = document.querySelectorAll('[data-count]');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      const dur    = 1600;
      const step   = target / (dur / 16);
      let current  = 0;
      const tick = () => {
        current = Math.min(current + step, target);
        el.textContent = Math.floor(current) + suffix;
        if (current < target) requestAnimationFrame(tick);
        else el.textContent = target + suffix;
      };
      requestAnimationFrame(tick);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => obs.observe(c));
})();


/* ── 9. SPLASH SCREEN DISMISSAL ── */
(function () {
  const splash = document.getElementById('splash');
  if (!splash) return;
  setTimeout(() => {
    splash.classList.add('hidden');
    setTimeout(() => { splash.style.display = 'none'; }, 950);
  }, 3200);
})();


/* ── 10. SCREENSHOT CAROUSEL ── */
(function () {
  const track    = document.querySelector('.carousel-track');
  const slides   = document.querySelectorAll('.carousel-slide');
  const dots     = document.querySelectorAll('.carousel-dot');
  const prevBtn  = document.querySelector('.carousel-prev');
  const nextBtn  = document.querySelector('.carousel-next');
  const viewport = document.querySelector('.carousel-viewport');
  if (!track || !slides.length) return;

  let current = 0;
  let autoTimer;

  function goTo(n) {
    current = ((n % slides.length) + slides.length) % slides.length;
    track.style.transform = `translateX(${-current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }
  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 4500);
  }

  prevBtn?.addEventListener('click', () => { goTo(current - 1); startAuto(); });
  nextBtn?.addEventListener('click', () => { goTo(current + 1); startAuto(); });
  dots.forEach((d, i) => d.addEventListener('click', () => { goTo(i); startAuto(); }));

  document.addEventListener('keydown', e => {
    const section = document.querySelector('.screenshots-section');
    if (!section) return;
    const { top, bottom } = section.getBoundingClientRect();
    if (top < window.innerHeight && bottom > 0) {
      if (e.key === 'ArrowLeft')  { goTo(current - 1); startAuto(); }
      if (e.key === 'ArrowRight') { goTo(current + 1); startAuto(); }
    }
  });

  let touchStartX = 0;
  viewport?.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
  viewport?.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(dx) > 40) { goTo(current + (dx < 0 ? 1 : -1)); startAuto(); }
  }, { passive: true });

  startAuto();
})();


/* ── 11. HERO MOCKUP — parallax on mouse move ── */
(function () {
  const scene = document.querySelector('.mockup-scene, .nci-mockup-scene');
  if (!scene) return;
  let cx = window.innerWidth / 2, cy = window.innerHeight / 2;
  window.addEventListener('mousemove', e => {
    const dy = (e.clientY - cy) / cy;
    const dx = (e.clientX - cx) / cx;
    scene.style.transform = `translate(${dx * -5}px, ${dy * -5}px)`;
  }, { passive: true });
  window.addEventListener('resize', () => {
    cx = window.innerWidth / 2;
    cy = window.innerHeight / 2;
  });
})();


/* ── 12. NOTIFY FORM (Coming Soon page) ── */
(function () {
  const form = document.getElementById('notify-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = form.querySelector('.notify-input');
    const btn   = form.querySelector('.notify-btn');
    if (input && btn) {
      btn.textContent = 'Registered!';
      btn.style.background = '#00e88a';
      btn.style.color = '#040a12';
      input.value = '';
      setTimeout(() => {
        btn.textContent = 'Notify Me';
        btn.style.background = '';
        btn.style.color = '';
      }, 3000);
    }
  });
})();
