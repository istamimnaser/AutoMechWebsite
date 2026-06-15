// Exposed a global function to be called AFTER components are fetched
window.initWebsite = function() {
  /* ── Mobile Nav ── */
  const burger    = document.getElementById('navBurger');
  const mobileNav = document.getElementById('mobileNav');

  if(burger && mobileNav) {
    burger.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('open');
      burger.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
  }

  // Attached to global for inline onclicks to still work
  window.closeMobileNav = function() {
    if(mobileNav) mobileNav.classList.remove('open');
    if(burger) burger.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ── Scroll Progress Bar ── */
  const progressBar = document.getElementById('scrollProgress');
  window.addEventListener('scroll', () => {
    const scrolled  = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    if(progressBar) progressBar.style.width = (scrolled / maxScroll * 100) + '%';
  }, { passive: true });

  /* ── Scroll Reveal (IntersectionObserver) ── */
  const revealSelectors = ['.reveal', '.reveal-left', '.reveal-scale'];
  const allReveal = document.querySelectorAll(revealSelectors.join(','));

  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const delay = el.dataset.delay || '0s';
      el.style.transitionDelay = delay;
      el.classList.add('revealed');
      revealObs.unobserve(el);
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

  allReveal.forEach(el => revealObs.observe(el));

  // Safety net: force-reveal any elements the observer missed after 800ms
  setTimeout(() => {
    allReveal.forEach(el => {
      if (!el.classList.contains('revealed')) {
        el.style.transitionDelay = '0s';
        el.classList.add('revealed');
      }
    });
  }, 800);

  /* ── Button Ripple ── */
  document.querySelectorAll('.btn, .event-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const rect   = this.getBoundingClientRect();
      const size   = Math.max(rect.width, rect.height) * 2;
      const x      = e.clientX - rect.left - size / 2;
      const y      = e.clientY - rect.top  - size / 2;
      const ripple = document.createElement('span');
      ripple.className = 'ripple-el';
      ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;`;
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  /* ── Slideshow ── */
  (function () {
    const slideshowContainer = document.getElementById('slideshow');
    if(!slideshowContainer) return;

    const slides   = Array.from(document.querySelectorAll('#slideshow .slide'));
    const dotsWrap = document.getElementById('slideDots');
    const counter  = document.getElementById('slideCounter');
    const total    = slides.length;
    let current    = 0;
    let timer;

    if(slides.length === 0) return;

    // build dots
    slides.forEach((_, i) => {
      const d = document.createElement('button');
      d.className = 'slide-dot' + (i === 0 ? ' active' : '');
      d.setAttribute('aria-label', 'Slide ' + (i + 1));
      d.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(d);
    });

    function goTo(n) {
      slides[current].classList.remove('active');
      dotsWrap.children[current].classList.remove('active');
      current = (n + total) % total;
      slides[current].classList.add('active');
      dotsWrap.children[current].classList.add('active');
      if(counter) counter.textContent = (current + 1) + ' / ' + total;
      resetTimer();
    }

    function resetTimer() {
      clearInterval(timer);
      timer = setInterval(() => goTo(current + 1), 4000);
    }

    const prevBtn = document.getElementById('slidePrev');
    const nextBtn = document.getElementById('slideNext');
    if(prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
    if(nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

    // pause on hover
    slideshowContainer.addEventListener('mouseenter', () => clearInterval(timer));
    slideshowContainer.addEventListener('mouseleave', resetTimer);

    // touch swipe
    let touchX = 0;
    slideshowContainer.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
    slideshowContainer.addEventListener('touchend',   e => {
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 40) goTo(dx < 0 ? current + 1 : current - 1);
    });

    resetTimer();
  })();

  /* ── Countdown ── */
  (function () {
    const cdContainer = document.getElementById('countdown');
    if(!cdContainer) return;

    const fest = new Date('2026-07-31T00:00:00').getTime();

    function pad(n) { return String(n).padStart(2, '0'); }

    function tick() {
      const diff = fest - Date.now();
      if (diff <= 0) {
        cdContainer.innerHTML =
          '<span style="font-family:Bebas Neue,sans-serif;font-size:1.6rem;letter-spacing:.06em;background:linear-gradient(135deg,#ff3d50,#e01c2c);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">AutoMech 2.0 is happening NOW!</span>';
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000)  / 60000);
      const s = Math.floor((diff % 60000)    / 1000);
      
      const cdDays = document.getElementById('cd-days');
      const cdHours = document.getElementById('cd-hours');
      const cdMins = document.getElementById('cd-mins');
      const cdSecs = document.getElementById('cd-secs');

      if(cdDays) cdDays.textContent  = pad(d);
      if(cdHours) cdHours.textContent = pad(h);
      if(cdMins) cdMins.textContent  = pad(m);
      if(cdSecs) cdSecs.textContent  = pad(s);
    }

    tick();
    setInterval(tick, 1000);
  })();

  /* ── Hero Canvas Particles ── */
  (function () {
    const canvas = document.getElementById('heroCanvas');
    if(!canvas) return;
    
    const ctx    = canvas.getContext('2d');
    let W, H, particles = [];

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const COLORS = [
      'rgba(255,61,80,',
      'rgba(224,28,44,',
      'rgba(255,255,255,',
    ];

    class Particle {
      constructor() { this.reset(true); }
      reset(init) {
        this.x      = Math.random() * W;
        this.y      = init ? Math.random() * H : H + 10;
        this.r      = Math.random() * 1.8 + .3;
        this.vy     = -(Math.random() * .7 + .25);
        this.vx     = (Math.random() - .5) * .4;
        this.alpha  = Math.random() * .55 + .1;
        this.col    = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.life   = 0;
        this.maxL   = Math.random() * 220 + 100;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life++;
        const progress = this.life / this.maxL;
        this.currentAlpha = this.alpha * Math.sin(Math.PI * progress);
        if (this.y < -10 || this.life >= this.maxL) this.reset(false);
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = this.col + this.currentAlpha + ')';
        ctx.fill();
      }
    }

    const COUNT = window.innerWidth < 768 ? 40 : 80;
    for (let i = 0; i < COUNT; i++) particles.push(new Particle());

    function loop() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => { p.update(); p.draw(); });
      requestAnimationFrame(loop);
    }
    loop();
  })();
};