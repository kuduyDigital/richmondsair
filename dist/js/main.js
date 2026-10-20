// Richmond's Air — homepage interactions (menu, symptom pre-fill, reveal, video, form)
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Mobile menu
  const toggle = $('[data-menu-toggle]');
  const menu = $('[data-menu]');
  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.sr-only').textContent = open ? 'Close menu' : 'Open menu';
    menu.classList.toggle('hidden', !open);
  };
  toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  menu?.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); }
  });

  // Symptom tiles pre-fill the request form
  const issue = $('#f-issue');
  $$('[data-issue]').forEach((btn) => btn.addEventListener('click', () => {
    issue.value = btn.dataset.issue;
    if (window.__lenis) window.__lenis.scrollTo('#request');
    else $('#request').scrollIntoView({ block: 'start' });
    $('#f-name').focus({ preventScroll: true });
  }));

  // Lite reveal
  const items = $$('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add('is-in'));
  }

  // Video dialog
  const dlg = $('[data-video-dialog]');
  const video = dlg?.querySelector('video');
  $('[data-video-open]')?.addEventListener('click', () => { dlg.showModal(); video.play().catch(() => {}); });
  $('[data-video-close]')?.addEventListener('click', () => dlg.close());
  dlg?.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  dlg?.addEventListener('close', () => video.pause());

  // Request form (Web3Forms)
  const form = $('[data-request-form]');
  const status = $('[data-form-status]');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      const bad = $$(':invalid', form).find((el) => el.name);
      status.textContent = 'Please fill in your name, phone, 5-digit ZIP and what you need.';
      bad?.focus();
      return;
    }
    if (form.access_key.value.startsWith('YOUR_')) {
      status.textContent = 'Form not connected yet — please call (713) 732-6426.';
      return;
    }
    const btn = form.querySelector('[type=submit]');
    btn.disabled = true;
    status.textContent = 'Sending…';
    try {
      const res = await fetch(form.action, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      form.reset();
      status.textContent = "Thanks! We've got your request and will call you back shortly.";
    } catch {
      status.textContent = "Sorry, that didn't go through. Please call (713) 732-6426.";
    } finally {
      btn.disabled = false;
    }
  });

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reviews slider: masked word reveal, autoplay with progress, swipe + keys
  const rv = $('[data-rv]');
  if (rv) {
    const slides = $$('.rv-slide', rv);
    const cur = $('[data-rv-current]'), progress = $('[data-rv-progress]');
    const toggleBtn = $('[data-rv-toggle]'), dotsWrap = $('[data-rv-dots]');
    const DUR = 7000, pad = (n) => String(n).padStart(2, '0');
    let i = 0, timer = null, playing = !reduced, hovered = false;

    $('[data-rv-total]').textContent = pad(slides.length);
    slides.forEach((s) => {
      const p = s.querySelector('.rv-quote p');
      let n = 0;
      p.innerHTML = p.textContent.trim().split(/\s+/)
        .map((w) => `<span class="rv-w"><span style="--i:${n++}">${w}</span></span>`).join(' ');
    });
    const dots = slides.map((_, k) => {
      const d = document.createElement('span');
      d.className = 'rv-dot';
      dotsWrap.append(d);
      return d;
    });

    const runProgress = () => {
      progress.classList.remove('is-running');
      void progress.offsetWidth;
      if (playing && !hovered) {
        progress.style.setProperty('--rv-dur', DUR + 'ms');
        progress.classList.add('is-running');
      }
    };
    const schedule = () => {
      clearTimeout(timer);
      runProgress();
      if (playing && !hovered) timer = setTimeout(() => go(i + 1), DUR);
    };
    const go = (n, announce) => {
      const prev = slides[i];
      i = (n + slides.length) % slides.length;
      if (prev !== slides[i]) {
        prev.classList.remove('is-active');
        prev.classList.add('is-leaving');
        setTimeout(() => prev.classList.remove('is-leaving'), 500);
      }
      slides.forEach((s, k) => s.setAttribute('aria-hidden', String(k !== i)));
      slides[i].classList.add('is-active');
      dots.forEach((d, k) => d.classList.toggle('is-active', k === i));
      cur.textContent = pad(i + 1);
      rv.setAttribute('aria-live', announce ? 'polite' : 'off');
      schedule();
    };
    const setPlaying = (on) => {
      playing = on;
      toggleBtn.setAttribute('aria-label', on ? 'Pause automatic rotation' : 'Start automatic rotation');
      $('[data-rv-icon-pause]').classList.toggle('hidden', !on);
      $('[data-rv-icon-play]').classList.toggle('hidden', on);
      schedule();
    };

    $('[data-rv-next]').addEventListener('click', () => go(i + 1, true));
    $('[data-rv-prev]').addEventListener('click', () => go(i - 1, true));
    toggleBtn.addEventListener('click', () => setPlaying(!playing));
    const section = $('#reviews');
    section.addEventListener('mouseenter', () => { hovered = true; schedule(); });
    section.addEventListener('mouseleave', () => { hovered = false; schedule(); });
    section.addEventListener('focusin', () => { hovered = true; schedule(); });
    section.addEventListener('focusout', (e) => { if (!section.contains(e.relatedTarget)) { hovered = false; schedule(); } });
    section.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') go(i + 1, true);
      if (e.key === 'ArrowLeft') go(i - 1, true);
    });
    let x0 = null;
    rv.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
    rv.addEventListener('pointerup', (e) => {
      if (x0 !== null && Math.abs(e.clientX - x0) > 50) go(i + (e.clientX < x0 ? 1 : -1), true);
      x0 = null;
    });
    document.addEventListener('visibilitychange', () => { hovered = document.hidden; schedule(); });
    setPlaying(playing);
    go(0);
  }

  // Smooth scrolling (Lenis) — off for reduced motion; touch keeps native scrolling
  const lenis = (!reduced && window.Lenis) ? new Lenis({ autoRaf: true, lerp: 0.1, anchors: true }) : null;
  window.__lenis = lenis;
  const lockScroll = (on) => {
    document.documentElement.classList.toggle('cp-lock', on);
    if (lenis) on ? lenis.stop() : lenis.start();
  };

  // Popup sequence: coupons on load → ComfortCheck after ~42% scroll
  const coupons = $('[data-coupons]');
  const cc = $('[data-cc]');
  let couponsOpen = false, ccPending = false;

  const showCC = () => {
    if (!cc || !cc.hidden) return;
    if (couponsOpen) { ccPending = true; return; }
    cc.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => cc.classList.add('is-open')));
  };
  const closeCC = () => {
    cc.classList.remove('is-open');
    setTimeout(() => { cc.hidden = true; }, 600);
  };
  if (cc) {
    const onScroll = () => {
      const pct = scrollY / (document.documentElement.scrollHeight - innerHeight);
      if (pct > 0.42) { removeEventListener('scroll', onScroll); showCC(); }
    };
    addEventListener('scroll', onScroll, { passive: true });
    $('[data-cc-close]').addEventListener('click', closeCC);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !cc.hidden && !couponsOpen) closeCC(); });
  }

  if (coupons) {
    const claim = $('[data-cp-claim]');
    let picked = '';
    const countUp = () => $$('[data-count]', coupons).forEach((el) => {
      const end = +el.dataset.count;
      if (reduced) { el.textContent = end; return; }
      const t0 = performance.now(), dur = 900;
      const step = (t) => {
        const k = Math.min(1, (t - t0 - 500) / dur);
        el.textContent = Math.round(end * (k <= 0 ? 0 : 1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
    const close = () => {
      if (!couponsOpen) return;
      coupons.classList.add('is-closing');
      setTimeout(() => {
        coupons.classList.remove('is-closing');
        coupons.close();
        couponsOpen = false;
        lockScroll(false);
        if (ccPending) { ccPending = false; showCC(); }
      }, reduced ? 0 : 300);
    };
    $$('[data-coupon]', coupons).forEach((btn) => {
      btn.setAttribute('aria-pressed', 'false');
      btn.addEventListener('click', () => {
        $$('[data-coupon]', coupons).forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
        picked = btn.dataset.coupon;
        claim.firstChild.textContent = `Claim ${picked} `;
      });
    });
    claim.addEventListener('click', (e) => {
      e.preventDefault();
      if (picked) {
        const msg = $('#f-msg');
        if (!msg.value.includes('Coupon:')) msg.value = `Coupon: ${picked}${msg.value ? '\n' + msg.value : ''}`;
      }
      close();
      setTimeout(() => {
        if (lenis) lenis.scrollTo('#request');
        else $('#request').scrollIntoView({ block: 'start' });
        $('#f-name').focus({ preventScroll: true });
      }, reduced ? 0 : 320);
    });
    $$('[data-cp-close]', coupons).forEach((b) => b.addEventListener('click', close));
    coupons.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
    coupons.addEventListener('click', (e) => { if (e.target === coupons) close(); });
    setTimeout(() => {
      if (typeof coupons.showModal !== 'function') return;
      coupons.showModal();
      couponsOpen = true;
      lockScroll(true);
      countUp();
    }, 900);
  }

  const year = $('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
