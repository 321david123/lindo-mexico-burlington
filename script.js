/* =====================================================
   Lindo Mexico — interactions
   ===================================================== */
(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = '2026';

  /* ---------- Build reviews ---------- */
  const REVIEWS = [
    { stars: 5, quote: 'I love their food and you get plenty of it. Staff is very friendly. Great prices!', author: 'Local Regular', source: 'Restaurantji' },
    { stars: 5, quote: 'A go-to for many locals — it has been serving the community for over 25 years and never disappoints.', author: 'Longtime Guest', source: 'Google' },
    { stars: 5, quote: 'Fresh, flavorful and generously portioned. The verde salsa and steak enchiladas verdes are the best around.', author: 'Downtown Diner', source: 'Local Review' },
    { stars: 5, quote: 'Warm, down-to-earth spot and the owner often comes out to greet you. Real home-cooked Mexican food.', author: 'First-Timer', source: 'Local Review' },
  ];
  const revWrap = document.getElementById('reviewsWrapper');
  if (revWrap) {
    REVIEWS.forEach((r) => {
      const slide = document.createElement('div');
      slide.className = 'swiper-slide';
      slide.innerHTML = `
        <blockquote class="review">
          <div class="review__stars" aria-label="${r.stars} out of 5 stars">${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</div>
          <p class="review__quote">${r.quote}</p>
          <footer><div class="review__author">${r.author}</div><div class="review__source">${r.source}</div></footer>
        </blockquote>`;
      revWrap.appendChild(slide);
    });
  }

  /* ============================================================
     NAV solidify + overlay
     ============================================================ */
  const nav = document.getElementById('nav');
  if (nav) {
    const onScroll = () => {
      if (window.scrollY > 60) nav.classList.add('is-solid');
      else nav.classList.remove('is-solid');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  const toggle = document.getElementById('navToggle');
  const overlay = document.getElementById('overlayMenu');
  if (toggle && overlay) {
    const closeMenu = () => {
      document.body.classList.remove('menu-open');
      toggle.setAttribute('aria-expanded', 'false');
      overlay.setAttribute('aria-hidden', 'true');
    };
    toggle.addEventListener('click', () => {
      const open = document.body.classList.toggle('menu-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      overlay.setAttribute('aria-hidden', open ? 'false' : 'true');
      if (open) {
        const first = overlay.querySelector('a');
        if (first) first.focus();
      }
    });
    overlay.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {
        closeMenu();
        toggle.focus();
      }
    });
  }

  /* ============================================================
     Lenis smooth scroll
     ============================================================ */
  let lenis = null;
  if (!prefersReduced && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  // anchor links -> lenis or native
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id === '#' || id === '#top') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -70 });
      else target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* ============================================================
     GSAP reveals + parallax
     ============================================================ */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    if (lenis) lenis.on('scroll', ScrollTrigger.update);

    if (!prefersReduced) {
      gsap.to('.hero__img', {
        yPercent: 14, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      });

      gsap.utils.toArray('.sig__img img').forEach((img) => {
        const row = img.closest('.sig__row');
        if (!row) return;
        gsap.fromTo(img, { yPercent: -6 }, {
          yPercent: 6, ease: 'none',
          scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      });
    }
  }

  /* ---------- IntersectionObserver reveals ---------- */
  const revealEls = [];
  document.querySelectorAll('.story__text, .story__media, .sig__copy, .sig__img, .feature, .visit__info, .visit__map, .banner__inner, .head, .sig__head, .features__head, .menu__group')
    .forEach((el) => { el.classList.add('reveal'); revealEls.push(el); });
  document.querySelectorAll('.sig__img').forEach((el) => el.classList.add('reveal-img'));

  if (prefersReduced) {
    revealEls.forEach((el) => el.classList.add('is-in'));
    document.querySelectorAll('.reveal-img').forEach((el) => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('is-in'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => io.observe(el));
    document.querySelectorAll('.reveal-img').forEach((el) => io.observe(el));
  }

  /* ---------- Stat counters ---------- */
  const counters = document.querySelectorAll('.stat__num[data-count]');
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const suffix = el.dataset.suffix || '';
    const fmt = (n) => {
      // Year-style numbers (>= 1900, no suffix) render without grouping/decimals
      if (!suffix && decimals === 0 && target >= 1900) return String(Math.round(n));
      return n.toFixed(decimals) + suffix;
    };
    if (prefersReduced) { el.textContent = fmt(target); return; }
    const dur = 1400; const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if (counters.length) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach((c) => cio.observe(c));
  }

  /* ============================================================
     Swipers
     ============================================================ */
  if (typeof Swiper !== 'undefined') {
    const gallery = document.querySelector('.gallery__swiper');
    if (gallery) {
      new Swiper('.gallery__swiper', {
        slidesPerView: 'auto', spaceBetween: 18, centeredSlides: false, grabCursor: true,
        navigation: { nextEl: '.gallery__swiper .swiper-button-next', prevEl: '.gallery__swiper .swiper-button-prev' },
        pagination: { el: '.gallery__swiper .swiper-pagination', clickable: true },
        breakpoints: { 768: { spaceBetween: 28 } },
      });
    }

    const reviews = document.querySelector('.reviews__swiper');
    if (reviews) {
      new Swiper('.reviews__swiper', {
        slidesPerView: 1, spaceBetween: 40, loop: REVIEWS.length > 1,
        autoplay: prefersReduced ? false : { delay: 5500, disableOnInteraction: false },
        pagination: { el: '.reviews__pag', clickable: true },
      });
    }
  }
})();
