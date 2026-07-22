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

  /* ── Prize Money Count-Up ── */
  const prizeEls = document.querySelectorAll('.event-prize[data-prize-target]');
  const prizeObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el       = entry.target;
      const target   = parseInt(el.dataset.prizeTarget, 10) || 0;
      const numEl    = el.querySelector('.prize-amount');
      const duration = 1400;
      const start    = performance.now();

      function tick(now) {
        const p     = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3); // ease-out-cubic
        numEl.textContent = Math.round(target * eased).toLocaleString('en-US');
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      prizeObs.unobserve(el);
    });
  }, { threshold: 0.4 });

  prizeEls.forEach(el => prizeObs.observe(el));

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

  /* ── Hero Canvas — Night Road ── */
  (function () {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let W, H, vpX, vpY, maxHW;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // render at full device resolution
      vpX   = W / 2;
      vpY   = H * 0.40;
      maxHW = W * 0.38;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Project a world point (worldX in road-units, z 0=near 1=far) → screen {x,y}
    function proj(wx, z) {
      return {
        x: vpX + wx * maxHW * (1 - z),
        y: vpY + (H - vpY) * (1 - z),
      };
    }

    // ── Deterministic hash — stable window positions each frame ──
    function hash(n) {
      let s = Math.imul((n ^ 0xdeadbeef) >>> 0, 0x45d9f3b);
      s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
      return ((s ^ (s >>> 16)) >>> 0) / 0xffffffff;
    }

    // ── City building data (pre-generated once) ─────────
    const DEPTHS = [0.90, 0.78, 0.66, 0.54, 0.42, 0.30, 0.18];
    const bldgs  = [];
    for (const side of [-1, 1]) {
      DEPTHS.forEach((z, i) => {
        const base    = i * 29 + (side < 0 ? 0 : 700);
        const nTowers = 2 + (hash(base) > 0.6 ? 1 : 0);
        for (let t = 0; t < nTowers; t++) {
          const s = base + t * 53;
          bldgs.push({
            side, z,
            outset:  0.10 + t * 0.15 + hash(s)      * 0.12, // distance outside road edge
            relH:    0.14 + hash(s + 1) * 0.38,
            relW:    0.030 + hash(s + 2) * 0.035,
            winSeed: s + 200,
          });
        }
      });
    }
    bldgs.sort((a, b) => b.z - a.z); // back-to-front, static sort

    function drawBuildings() {
      for (const b of bldgs) {
        const scale = 1 - b.z;
        const edge  = proj(b.side, b.z);
        const bx    = edge.x + b.side * b.outset * maxHW * scale * 2.6;
        const bw    = b.relW * W * scale * 3.6;
        const bh    = b.relH * H * scale * 3.2;
        const by    = edge.y;

        // Dark silhouette
        ctx.fillStyle = 'rgba(5,2,4,0.95)';
        ctx.fillRect(bx - bw / 2, by - bh, bw, bh);


        // Windows (deterministic — won't flicker)
        const winW = Math.max(1, 2.0 * scale);
        const winH = Math.max(1.2, 2.8 * scale);
        const cols = Math.max(1, Math.floor(bw / (winW + 2.5 * scale)));
        const rows = Math.max(1, Math.floor(bh / (winH + 3.5 * scale)));
        let wi = 0;
        outer: for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            if (wi++ > 30) break outer;
            if (hash(b.winSeed + wi * 7) > 0.52) continue;
            const wx = (bx - bw / 2) + (col + 0.5) * (bw / cols);
            const wy = (by - bh)     + (row + 0.5) * (bh / rows);
            const br = 0.25 + hash(b.winSeed + wi * 13) * 0.45;
            ctx.fillStyle = `rgba(255,210,130,${br * Math.min(1, scale * 2.2)})`;
            ctx.fillRect(wx - winW / 2, wy - winH / 2, winW, winH);
          }
        }
      }
    }

    // ── Twinkling stars (sky above horizon) ────────────
    const NSTARS = window.innerWidth < 768 ? 55 : 110;
    const stars = Array.from({ length: NSTARS }, () => ({
      x:  Math.random() * W,
      y:  Math.random() * vpY * 0.96,
      r:  Math.random() * 1.2 + .2,
      a:  Math.random() * .45 + .05,
      da: (Math.random() < .5 ? 1 : -1) * (.002 + Math.random() * .004),
    }));

    function drawStars() {
      for (const s of stars) {
        s.a += s.da;
        if (s.a > .55 || s.a < .03) s.da *= -1;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.a})`;
        ctx.fill();
      }
    }

    // ── Road surface + edges + horizon glow ─────────────
    function drawRoad() {
      const lBot = proj(-1, 0);
      const rBot = proj( 1, 0);

      // Faint asphalt fill
      ctx.beginPath();
      ctx.moveTo(vpX, vpY);
      ctx.lineTo(lBot.x, lBot.y);
      ctx.lineTo(rBot.x, rBot.y);
      ctx.closePath();
      const roadFill = ctx.createLinearGradient(0, vpY, 0, H);
      roadFill.addColorStop(0, 'rgba(255,30,45,0)');
      roadFill.addColorStop(1, 'rgba(60,4,8,0.32)');
      ctx.fillStyle = roadFill;
      ctx.fill();

      // Edge lines fade in from horizon
      for (const side of [-1, 1]) {
        const near = proj(side, 0);
        const grd  = ctx.createLinearGradient(vpX, vpY, near.x, near.y);
        grd.addColorStop(0, 'rgba(255,61,80,0)');
        grd.addColorStop(1, 'rgba(255,61,80,0.5)');
        ctx.beginPath();
        ctx.moveTo(vpX, vpY);
        ctx.lineTo(near.x, near.y);
        ctx.strokeStyle = grd;
        ctx.lineWidth   = 1.8;
        ctx.stroke();
      }

    }

    // ── Solid dark fill for both sides (no gap bleed) ────
    function drawSideBase() {
      const lBot = proj(-1, 0);
      const rBot = proj( 1, 0);

      ctx.fillStyle = 'rgba(4,2,3,1)';

      // Left side — full triangle from VP to bottom-left corner
      ctx.beginPath();
      ctx.moveTo(0,      0);
      ctx.lineTo(vpX,    vpY);
      ctx.lineTo(lBot.x, H);
      ctx.lineTo(0,      H);
      ctx.closePath();
      ctx.fill();

      // Right side — full triangle from VP to bottom-right corner
      ctx.beginPath();
      ctx.moveTo(vpX,    vpY);
      ctx.lineTo(W,      0);
      ctx.lineTo(W,      H);
      ctx.lineTo(rBot.x, H);
      ctx.closePath();
      ctx.fill();
    }

    // ── Moving centre-line dashes ────────────────────────
    const NDASH = 16;
    const dashes = Array.from({ length: NDASH }, (_, i) => ({ z: i / NDASH }));

    function drawDashes() {
      for (const d of dashes) {
        d.z -= 0.004;
        if (d.z < 0) d.z += 1;
        if (d.z > 0.97 || d.z < 0.015) continue;

        const dz   = 0.035;
        const near = proj(0, d.z);
        const far  = proj(0, Math.min(0.97, d.z + dz));
        const w    = Math.max(1.2, 3.5 * (1 - d.z));
        const a    = Math.min(0.55, (1 - d.z) * 1.0);

        ctx.fillStyle = `rgba(255,255,255,${a * 0.5})`;
        ctx.fillRect(near.x - w / 2, far.y, w, near.y - far.y);
      }
    }

    // ── Car light trails ─────────────────────────────────
    const LIGHT_SPREAD = 0.068; // half-gap between L and R light of each car

    function makeCar(initZ) {
      const left = Math.random() < 0.5;
      return {
        z:        initZ ?? (0.92 + Math.random() * 0.08),
        laneX:    left ? -0.30 : 0.30,
        oncoming: !left,   // right lane → oncoming (white/yellow); left lane → going away (red)
        speed:    0.006 + Math.random() * 0.012,
      };
    }

    const NCARS = window.innerWidth < 768 ? 5 : 10;
    const cars  = Array.from({ length: NCARS }, (_, i) => makeCar(i / NCARS));

    function drawCars() {
      for (const c of cars) {
        c.z -= c.speed;
        if (c.z < 0) Object.assign(c, makeCar());

        if (c.z > 0.97 || c.z < 0.01) continue;

        const trailDz = Math.min(0.14, c.speed * 20);
        const zFar    = Math.min(0.97, c.z + trailDz);
        const col     = c.oncoming ? '255,238,200' : '255,52,62';
        const alpha   = Math.min(0.95, (1 - c.z) * 1.7);

        for (const ox of [-LIGHT_SPREAD, LIGHT_SPREAD]) {
          const near = proj(c.laneX + ox, c.z);
          const far  = proj(c.laneX + ox, zFar);

          // Trail streak
          const grd = ctx.createLinearGradient(far.x, far.y, near.x, near.y);
          grd.addColorStop(0, `rgba(${col},0)`);
          grd.addColorStop(1, `rgba(${col},${alpha})`);
          ctx.beginPath();
          ctx.moveTo(far.x,  far.y);
          ctx.lineTo(near.x, near.y);
          ctx.strokeStyle = grd;
          ctx.lineWidth   = Math.max(0.7, 3.8 * (1 - c.z));
          ctx.stroke();

          // Bright point at front of light
          const dotR = Math.max(0.8, 3 * (1 - c.z));
          const dotG = ctx.createRadialGradient(near.x, near.y, 0, near.x, near.y, dotR * 5);
          dotG.addColorStop(0, `rgba(${col},${alpha})`);
          dotG.addColorStop(1, `rgba(${col},0)`);
          ctx.beginPath();
          ctx.arc(near.x, near.y, dotR * 5, 0, Math.PI * 2);
          ctx.fillStyle = dotG;
          ctx.fill();
        }
      }
    }

    function loop() {
      ctx.clearRect(0, 0, W, H);
      drawRoad();
      drawSideBase();   // solid dark cover — eliminates gap bleed on both sides
      drawStars();      // stars over dark sides (sky wraps naturally)
      drawBuildings();  // windows over solid dark base
      drawDashes();     // road markings
      drawCars();       // light trails on top
      requestAnimationFrame(loop);
    }
    loop();
  })();
};