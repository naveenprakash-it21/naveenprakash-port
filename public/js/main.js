// Mobile navigation menu toggle
const menuButton = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuButton.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.textContent = open ? '✕' : '☰';
});

navLinks.querySelectorAll('a').forEach((a) => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.textContent = '☰';
  });
});

// Dynamic current year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Scroll reveal animations via Intersection Observer
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

// Lightweight particle background only — no sphere, water, ripples, or cursor effects.
(() => {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let width = 0,
    height = 0,
    dpr = 1,
    raf = 0,
    particles = [];
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(85, Math.max(28, Math.round((width * height) / 18000)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 0.7 + Math.random() * 1.6,
      vx: (Math.random() - 0.5) * 0.24,
      vy: (Math.random() - 0.5) * 0.24,
      alpha: 0.18 + Math.random() * 0.42
    }));
    draw();
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (!reduce) {
        p.x += p.vx;
        p.y += p.vy;
      }
      if (p.x < -5) p.x = width + 5;
      if (p.x > width + 5) p.x = -5;
      if (p.y < -5) p.y = height + 5;
      if (p.y > height + 5) p.y = -5;
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j],
          dx = p.x - q.x,
          dy = p.y - q.y,
          dist = Math.hypot(dx, dy);
        if (dist < 112) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(94, 234, 212, ${(1 - dist / 112) * 0.16})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(153, 246, 228, ${p.alpha})`;
      ctx.fill();
    }
    if (!reduce) raf = requestAnimationFrame(draw);
  }

  window.addEventListener(
    'resize',
    () => {
      cancelAnimationFrame(raf);
      resize();
    },
    { passive: true }
  );

  resize();
})();

// Scroll-fold effect: the next project card gently compresses the card above it.
(() => {
  const cards = [...document.querySelectorAll('.project-card')];
  if (cards.length < 2) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let ticking = false;

  function updateStack() {
    ticking = false;
    if (window.innerWidth <= 760 || reduced.matches) {
      cards.forEach((card) => {
        card.style.transform = '';
        card.classList.remove('is-stacking');
      });
      return;
    }
    const stickyTop = 96;
    cards.forEach((card, i) => {
      if (i === cards.length - 1) {
        card.style.transform = '';
        card.classList.remove('is-stacking');
        return;
      }
      const nextTop = cards[i + 1].getBoundingClientRect().top;
      const progress = Math.max(0, Math.min(1, (stickyTop + 150 - nextTop) / 150));
      const scale = 1 - progress * 0.035;
      const lift = progress * -7;
      card.style.transform = `translateY(${lift}px) scale(${scale})`;
      card.classList.toggle('is-stacking', progress > 0.08);
    });
  }

  function requestUpdate() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateStack);
    }
  }

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });
  reduced.addEventListener?.('change', requestUpdate);
  updateStack();
})();

// Submit contact inquiries to the same-origin serverless endpoint.
(() => {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const status = document.getElementById('formStatus');
  const submitButton = form.querySelector('button[type="submit"]');
  const buttonLabel = submitButton.querySelector('.button-label');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.className = 'form-note';
    status.textContent = 'Sending your message securely...';
    submitButton.disabled = true;
    submitButton.setAttribute('aria-busy', 'true');
    buttonLabel.textContent = 'Sending...';

    const fields = new FormData(form);
    const payload = {
      name: fields.get('name'),
      email: fields.get('email'),
      message: fields.get('message'),
      company: fields.get('company')
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      let result;
      try {
        result = await response.json();
      } catch {
        throw new Error(
          'The contact service returned an unexpected response. Please try again later.'
        );
      }

      if (!response.ok) {
        throw new Error(result.error || 'Your message could not be sent. Please try again.');
      }

      form.reset();
      status.className = 'form-note success';
      status.textContent =
        result.autoReplySent === false
          ? 'Your message reached me, but the confirmation email could not be sent.'
          : 'Thanks for reaching out! Your message has been sent, and a confirmation email is on its way.';
    } catch (error) {
      status.className = 'form-note error';
      status.textContent =
        error instanceof Error
          ? error.message
          : 'Your message could not be sent. Please try again.';
    } finally {
      submitButton.disabled = false;
      submitButton.removeAttribute('aria-busy');
      buttonLabel.textContent = 'Send inquiry';
    }
  });
})();
