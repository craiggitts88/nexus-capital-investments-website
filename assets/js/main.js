/* ═══════════════════════════════════════════════════════════════
   NEXUS CAPITAL & INVESTMENTS — main.js
   Particle canvas · Dropdown nav · 3D tilt · Scroll reveal · Counters
═══════════════════════════════════════════════════════════════ */

/* ── 0. GLOBAL BACKGROUND EFFECTS (hex lattice · light rays · corner rings) ── */
(function () {
  const isAlgo = document.body.classList.contains('algo-page');
  const wrap = document.createElement('div');
  wrap.className = 'site-bg-effects' + (isAlgo ? ' site-bg-effects--algo' : '');
  wrap.innerHTML =
    '<div class="site-bg-hex"></div>' +
    '<div class="site-bg-rays"></div>' +
    '<div class="site-bg-rings">' +
      '<div class="site-bg-ring" style="--d:0s"></div>' +
      '<div class="site-bg-ring" style="--d:2.7s"></div>' +
      '<div class="site-bg-ring" style="--d:5.4s"></div>' +
    '</div>';
  document.body.insertBefore(wrap, document.body.firstChild);
})();


/* ── 1. PARTICLE CANVAS ── */
(function () {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Use gold colour on NCI pages, cyan on algo pages
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

  class Particle {
    constructor() { this.init(); }
    init() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.25;
      this.vy = (Math.random() - 0.5) * 0.25;
      this.r  = Math.random() * 1.6 + 0.4;
      this.a  = Math.random() * 0.4 + 0.06;
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
          ctx.strokeStyle = `rgba(${COLOR}, ${0.1 * (1 - d / MAX_DIST)})`;
          ctx.lineWidth   = 0.6;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(loop);
  }
  loop();
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
