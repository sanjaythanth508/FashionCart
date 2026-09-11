/**
 * FashionCart Master Interactive Animation Controller
 * - 60fps Luxury Custom Cursor (Spring Lerp)
 * - Page Scroll Progress Indicator
 * - Click Ripple Physics Engine
 * - IntersectionObserver Scroll Reveal
 * - Magnetic Button Attraction
 * - Specular 3D Card Tilts
 * - Dynamic Number Counting Engine
 */

(function() {
  'use strict';

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnimationSuite);
  } else {
    initAnimationSuite();
  }

  function initAnimationSuite() {
    initScrollProgress();
    initClickRipples();
    initScrollReveals();
    init3DCardTilts();
    initMagneticButtons();
    initNumberCounters();

    // Clean up any stray cursor elements if present
    const dot = document.getElementById('luxuryCursorDot');
    const ring = document.getElementById('luxuryCursorRing');
    if (dot) dot.remove();
    if (ring) ring.remove();
  }

  // ==================== 1. SCROLL PROGRESS INDICATOR ====================
  function initScrollProgress() {
    let progressBar = document.getElementById('pageScrollProgress');
    if (!progressBar) {
      progressBar = document.createElement('div');
      progressBar.id = 'pageScrollProgress';
      document.body.appendChild(progressBar);
    }

    const updateProgress = () => {
      const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollTotal <= 0) {
        progressBar.style.width = '0%';
        return;
      }
      const scrollCurrent = window.scrollY;
      const progressPercent = Math.min(100, Math.max(0, (scrollCurrent / scrollTotal) * 100));
      progressBar.style.width = `${progressPercent}%`;
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  // ==================== 3. CLICK RIPPLE ENGINE ====================
  function initClickRipples() {
    const rippleSelectors = '.btn-luxury, .btn-glass, .btn-card-cart, .nav-action-btn, .btn-quick-stock, .size-pill, .auth-nav-pill, .btn-outline-light, .btn-outline-danger';

    document.addEventListener('click', (e) => {
      const target = e.target.closest(rippleSelectors);
      if (!target) return;

      const rect = target.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple-wave';

      const diameter = Math.max(rect.width, rect.height);
      const radius = diameter / 2;

      ripple.style.width = ripple.style.height = `${diameter}px`;
      ripple.style.left = `${e.clientX - rect.left - radius}px`;
      ripple.style.top = `${e.clientY - rect.top - radius}px`;

      if (window.getComputedStyle(target).position === 'static') {
        target.style.position = 'relative';
      }
      target.style.overflow = 'hidden';

      target.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 700);
    });
  }

  // ==================== 4. SCROLL REVEAL (INTERSECTION OBSERVER) ====================
  function initScrollReveals() {
    const revealElements = document.querySelectorAll('[data-animate]');
    if (revealElements.length === 0) return;

    if (!('IntersectionObserver' in window)) {
      revealElements.forEach(el => el.classList.add('animated'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const animClass = el.getAttribute('data-animate') || 'fade-up';
          const delay = el.getAttribute('data-delay') || '0';

          el.style.animationDelay = `${delay}ms`;
          el.classList.add(`anim-${animClass}`);
          el.classList.add('animated');

          observer.unobserve(el);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
  }

  // ==================== 5. SPECULAR 3D CARD TILTS ====================
  function init3DCardTilts() {
    const cards = document.querySelectorAll('.tilt-card, .product-card');

    cards.forEach(card => {
      let bounds;

      function rotateToMouse(e) {
        bounds = card.getBoundingClientRect();
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        const leftX = mouseX - bounds.x;
        const topY = mouseY - bounds.y;
        const center = {
          x: leftX - bounds.width / 2,
          y: topY - bounds.height / 2
        };

        const maxRotate = 9;
        const rotateX = -(center.y / (bounds.height / 2)) * maxRotate;
        const rotateY = (center.x / (bounds.width / 2)) * maxRotate;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
      }

      function removeListener() {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      }

      card.addEventListener('mouseenter', () => {
        card.addEventListener('mousemove', rotateToMouse);
      });

      card.addEventListener('mouseleave', () => {
        card.removeEventListener('mousemove', rotateToMouse);
        removeListener();
      });
    });
  }

  // ==================== 6. MAGNETIC BUTTON ATTRACTION ====================
  function initMagneticButtons() {
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

    const magneticBtns = document.querySelectorAll('.btn-magnetic, .btn-luxury, .nav-action-btn');

    magneticBtns.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - (rect.left + rect.width / 2);
        const y = e.clientY - (rect.top + rect.height / 2);
        
        // Subtle magnetic displacement (max 8px)
        const pullX = x * 0.22;
        const pullY = y * 0.22;

        btn.style.transform = `translate(${pullX}px, ${pullY}px) scale(1.03)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  // ==================== 7. DYNAMIC NUMBER COUNTERS ====================
  function initNumberCounters() {
    const counterElements = document.querySelectorAll('[data-count]');
    if (counterElements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseFloat(el.getAttribute('data-count'));
          const prefix = el.getAttribute('data-prefix') || '';
          const suffix = el.getAttribute('data-suffix') || '';
          const duration = 1600; // 1.6s
          const startTime = performance.now();

          function step(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentVal = Math.floor(easeOut * target);

            el.textContent = `${prefix}${currentVal}${suffix}`;

            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              el.textContent = `${prefix}${target}${suffix}`;
            }
          }

          requestAnimationFrame(step);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.2 });

    counterElements.forEach(el => observer.observe(el));
  }

  // Export functions to global window for dynamic content invocation
  window.FashionAnimations = {
    refresh: () => {
      initScrollReveals();
      init3DCardTilts();
      initMagneticButtons();
      initNumberCounters();
      initClickRipples();
    },
    initNumberCounters: () => initNumberCounters(),
    init3DCardTilts: () => init3DCardTilts(),
    initMagneticButtons: () => initMagneticButtons(),
    initScrollReveals: () => initScrollReveals(),
    initClickRipples: () => initClickRipples(),
    triggerConfetti: () => {
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ff4b72', '#9333ea', '#3b82f6', '#10b981', '#f59e0b']
        });
      } else {
        const colors = ['#ff4b72', '#9333ea', '#3b82f6', '#10b981', '#f59e0b'];
        for (let i = 0; i < 50; i++) {
          const piece = document.createElement('div');
          piece.style.position = 'fixed';
          piece.style.zIndex = '999999';
          piece.style.width = `${Math.random() * 8 + 6}px`;
          piece.style.height = `${Math.random() * 10 + 8}px`;
          piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
          piece.style.left = `${Math.random() * 100}vw`;
          piece.style.top = '-20px';
          piece.style.opacity = '1';
          piece.style.transform = `rotate(${Math.random() * 360}deg)`;
          piece.style.transition = `transform ${Math.random() * 2 + 1.5}s ease-out, top ${Math.random() * 2 + 1.5}s ease-out, opacity 2s ease`;
          piece.style.pointerEvents = 'none';
          document.body.appendChild(piece);

          setTimeout(() => {
            piece.style.top = '105vh';
            piece.style.transform = `rotate(${Math.random() * 720}deg) scale(0.6)`;
            piece.style.opacity = '0';
          }, 30);

          setTimeout(() => piece.remove(), 3500);
        }
      }
    }
  };

})();
