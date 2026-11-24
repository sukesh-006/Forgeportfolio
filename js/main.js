/* Sukesh Forge — page logic. No dependencies. */
(function () {
  'use strict';

  var D = window.FORGE_DATA || {};
  var C = window.FORGE_CONFIG || {};
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }
  function isPlaceholder(v) { return !v || /PASTE|YOUR_/i.test(v); }

  /* ───────────── Theme ───────────── */
  function getTheme() { return root.dataset.theme === 'light' ? 'light' : 'dark'; }

  function applyTheme(t) {
    root.dataset.theme = t;
    var m = $('meta[name="theme-color"]');
    if (m) m.setAttribute('content', t === 'dark' ? '#09090b' : '#faf9f6');
    try { localStorage.setItem('forge-theme', t); } catch (e) { /* storage blocked: still works this visit */ }
    window.dispatchEvent(new Event('themechange'));
  }

  /** Switch theme. With the View Transitions API the new theme grows as a circle from the cord knob. */
  function toggleTheme(origin) {
    var next = getTheme() === 'dark' ? 'light' : 'dark';
    if (!document.startViewTransition || reduce) {
      root.classList.add('theme-fade');
      applyTheme(next);
      setTimeout(function () { root.classList.remove('theme-fade'); }, reduce ? 0 : 650);
      return;
    }
    var x = origin && origin.x != null ? origin.x : window.innerWidth - 40;
    var y = origin && origin.y != null ? origin.y : 0;
    var r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    var t = document.startViewTransition(function () { applyTheme(next); });
    t.ready.then(function () {
      root.animate(
        { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + r + 'px at ' + x + 'px ' + y + 'px)'] },
        { duration: 1100, easing: 'cubic-bezier(0.76, 0, 0.24, 1)', pseudoElement: '::view-transition-new(root)' }
      );
    }).catch(function () { /* transition skipped: theme already applied */ });
  }

  window.Forge = { toggleTheme: toggleTheme, getTheme: getTheme, reduce: reduce };

  /* ───────────── Loader ───────────── */
  function runLoader(done) {
    var el = $('#loader');
    var count = $('#loader-count');
    var bar = $('#loader-bar');
    var yr = $('#loader-year');
    if (yr) yr.textContent = '©' + new Date().getFullYear();
    if (!el || reduce) {
      if (el) el.classList.add('is-gone');
      done();
      return;
    }
    root.style.overflow = 'hidden';
    var finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      el.classList.add('is-out');
      root.style.overflow = '';
      done();
      setTimeout(function () { el.classList.add('is-gone'); }, 1100);
    }
    var start = performance.now();
    var DUR = 1300;
    function tick(now) {
      var t = Math.min(1, (now - start) / DUR);
      var n = Math.round((1 - Math.pow(1 - t, 3)) * 100);
      count.textContent = ('00' + n).slice(-3);
      bar.style.width = n + '%';
      if (t < 1) requestAnimationFrame(tick);
      else setTimeout(finish, 200);
    }
    requestAnimationFrame(tick);
    setTimeout(finish, 3500); // safety: never trap the visitor behind the curtain
  }

  /* ───────────── 3D "browser window" mini-UIs ───────────── */
  function mock(motif) {
    var urls = { hospital: 'medicare.desk/today', hotel: 'staydesk.app/rooms', gym: 'ironpulse.fit/members', boutique: 'boutique.studio/orders', ekip: 'ekip / pipeline' };
    var b = '';
    var i;
    if (motif === 'hospital') {
      b =
        '<div class="m-hosp"><div class="m-side"><b class="on"></b><b></b><b></b><b></b></div><div class="m-main">' +
        '<div class="m-tiles"><div><small>Today</small><strong>24</strong></div><div><small>Doctors</small><strong>6</strong></div><div><small>Waiting</small><strong>3</strong></div></div>' +
        '<ul class="m-rows">' +
        '<li><span>10:30</span><em>General · Dr. A</em><u class="ok">Done</u></li>' +
        '<li><span>11:00</span><em>Dental · Dr. B</em><u class="now">In room</u></li>' +
        '<li><span>11:30</span><em>Child · Dr. C</em><u>Booked</u></li>' +
        '<li><span>12:00</span><em>General · Dr. A</em><u>Booked</u></li>' +
        '</ul></div></div>';
    } else if (motif === 'hotel') {
      var st = ['b', 'b', 'f', 'c', 'f', 'b', 'b', 'f', 'f', 'c', 'b', 'f'];
      var rooms = '';
      for (i = 0; i < st.length; i++) rooms += '<span class="room r-' + st[i] + '">' + (101 + i) + '</span>';
      b =
        '<div class="m-hotel"><div class="m-days"><span>Mon</span><span class="on">Tue</span><span>Wed</span><span>Thu</span><span>Fri</span></div>' +
        '<div class="m-rooms">' + rooms + '</div>' +
        '<div class="m-foot"><small>Free tonight</small><strong>5 rooms</strong><i class="m-btn">Book</i></div></div>';
    } else if (motif === 'gym') {
      var w = [82, 55, 30, 12];
      var d = ['24d', '16d', '9d', '3d'];
      var rows = '';
      for (i = 0; i < w.length; i++) {
        rows += '<div class="m-mem"><i class="av"></i><div><b></b><div class="bar"><span style="width:' + w[i] + '%"></span></div></div><u' + (i === 3 ? ' class="now"' : '') + '>' + d[i] + '</u></div>';
      }
      var bits = '1110111011101010101110101100111010101';
      var qr = '';
      for (i = 0; i < 25; i++) qr += '<s' + (bits.charAt(i) === '1' ? ' class="on"' : '') + '></s>';
      b = '<div class="m-gym"><div class="m-gym__list">' + rows + '</div><div class="m-qr"><div class="m-qr__grid">' + qr + '</div><small>Scan to check in</small></div></div>';
    } else if (motif === 'boutique') {
      b =
        '<div class="m-bout"><div class="m-prods">' +
        '<div><i class="sw s1"></i><small>Silk saree</small><b>₹4,200</b></div>' +
        '<div><i class="sw s2"></i><small>Kurta set</small><b>₹1,850</b></div>' +
        '<div><i class="sw s3"></i><small>Lehenga</small><b>₹9,500</b></div>' +
        '</div><div class="m-steps"><span class="done">Ordered</span><span class="done">Stitching</span><span class="now">Ready</span><span>Delivered</span></div></div>';
    } else if (motif === 'ekip') {
      var xs = [30, 95, 160, 225, 290];
      var path = 'M30 40 L290 40 L290 110 L30 110';
      var nodes = '';
      for (i = 0; i < 5; i++) nodes += '<circle cx="' + xs[i] + '" cy="40" r="9" class="' + (i === 2 ? 'hot' : '') + '"/>';
      for (i = 0; i < 5; i++) nodes += '<circle cx="' + xs[4 - i] + '" cy="110" r="9" class="' + (i === 3 ? 'hot' : '') + '"/>';
      b =
        '<svg class="m-ekip" viewBox="0 0 320 150" preserveAspectRatio="xMidYMid meet">' +
        '<path d="' + path + '" class="l0"/><path d="' + path + '" class="l1"/>' + nodes +
        '<text x="30" y="142">10-NODE AGENT PIPELINE · KUBERNETES</text></svg>';
    }
    return '<div class="win" aria-hidden="true"><div class="win__bar"><i></i><i></i><i></i><span>' + esc(urls[motif] || 'app') + '</span></div><div class="win__body">' + b + '</div></div>';
  }

  /* ───────────── Render sections from data ───────────── */
  function renderServices() {
    var el = $('#services-grid');
    if (!el || !D.services) return;
    el.innerHTML = D.services.map(function (s, i) {
      return (
        '<li class="reveal reveal-3d" style="--d:' + i * 70 + 'ms">' +
        '<article class="card tilt">' +
        '<span class="card__glare" aria-hidden="true"></span>' +
        '<div class="card__top z1"><span class="card__num">0' + (i + 1) + '</span>' +
        '<span class="card__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' + s.icon + '</svg></span></div>' +
        '<h3 class="card__title">' + esc(s.title) + '</h3>' +
        '<p class="card__text">' + esc(s.text) + '</p>' +
        '<ul class="chips">' + s.points.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>' +
        '</article></li>'
      );
    }).join('');
  }

  function renderWork() {
    var el = $('#work-grid');
    if (!el || !D.projects) return;
    el.innerHTML = D.projects.map(function (p, i) {
      return (
        '<li class="reveal reveal-3d" style="--d:' + i * 80 + 'ms">' +
        '<article class="proj">' +
        '<div class="proj__stage"><button type="button" class="proj__shot tilt" data-open="' + esc(p.id) + '" aria-label="Open details: ' + esc(p.title) + '">' +
        '<span class="card__glare" aria-hidden="true"></span>' +
        '<span class="proj__badge">' + esc(p.badge) + '</span>' +
        '<span class="proj__mock z2">' + mock(p.motif) + '</span></button></div>' +
        '<div class="proj__meta"><span>' + esc(p.kind) + '</span><span>0' + (i + 1) + '</span></div>' +
        '<h3 class="proj__title">' + esc(p.title) + '</h3>' +
        '<p class="proj__text">' + esc(p.summary) + '</p>' +
        '<ul class="chips">' + p.stack.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>' +
        '<button type="button" class="link" data-open="' + esc(p.id) + '">See what it does <span aria-hidden="true">→</span></button>' +
        '</article></li>'
      );
    }).join('');

    var more = $('#more-list');
    if (more && D.more) more.innerHTML = D.more.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('');
  }

  function renderRing() {
    var el = $('#ring');
    if (!el || !D.stack) return;
    var n = D.stack.length;
    el.innerHTML = D.stack.map(function (s, i) {
      return '<li style="--a:' + ((360 / n) * i).toFixed(2) + 'deg"><span>' + esc(s) + '</span></li>';
    }).join('');
  }

  function renderSteps() {
    var el = $('#steps');
    if (!el || !D.process) return;
    el.innerHTML = D.process.map(function (s, i) {
      return '<li class="reveal" style="--d:' + i * 90 + 'ms"><span class="steps__n">0' + (i + 1) + '</span><h3>' + esc(s.title) + '</h3><p>' + esc(s.text) + '</p></li>';
    }).join('');
  }

  function renderStats() {
    var el = $('#stats');
    if (!el || !D.stats) return;
    el.innerHTML = D.stats.map(function (s) {
      return '<li><strong>' + esc(s.value) + '</strong><span>' + esc(s.label) + '</span></li>';
    }).join('');
  }

  function renderContact() {
    var sel = $('#business');
    if (sel && D.businessTypes) {
      sel.innerHTML = '<option value="" disabled selected>Choose one</option>' +
        D.businessTypes.map(function (b) { return '<option>' + esc(b) + '</option>'; }).join('');
    }
    var ul = $('#contact-links');
    if (!ul) return;
    var links = [];
    if (C.email) links.push({ label: 'Email', note: C.email, href: 'mailto:' + C.email });
    if (C.whatsapp) links.push({ label: 'WhatsApp', note: 'Chat now', href: 'https://wa.me/' + String(C.whatsapp).replace(/\D/g, ''), ext: true });
    if (C.linkedin) links.push({ label: 'LinkedIn', note: 'Connect', href: C.linkedin, ext: true });
    if (C.github) links.push({ label: 'GitHub', note: 'Code', href: C.github, ext: true });
    ul.innerHTML = links.map(function (l) {
      return '<li><a href="' + esc(l.href) + '"' + (l.ext ? ' target="_blank" rel="noopener noreferrer"' : '') + '><span>' + esc(l.label) + '</span><em>' + esc(l.note) + '</em><b aria-hidden="true">↗</b></a></li>';
    }).join('');
  }

  /* ───────────── Nav ───────────── */
  function initNav() {
    var nav = $('#nav');
    var links = $$('#nav-list a');
    var ids = links.map(function (a) { return a.getAttribute('data-id'); });
    var burger = $('#burger');
    var menu = $('#mobile-menu');
    var raf = 0;

    function compute() {
      raf = 0;
      if (nav) nav.classList.toggle('is-compact', window.scrollY > 60);
      var line = window.innerHeight * 0.45;
      var current = '';
      ids.forEach(function (id) {
        var s = document.getElementById(id);
        if (s && s.getBoundingClientRect().top <= line) current = id;
      });
      links.forEach(function (a) {
        if (a.getAttribute('data-id') === current) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    }
    function onScroll() { if (!raf) raf = requestAnimationFrame(compute); }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    compute();

    function setMenu(open) {
      if (!burger || !menu) return;
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.classList.toggle('is-open', open);
      menu.setAttribute('aria-hidden', String(!open));
      root.style.overflow = open ? 'hidden' : '';
    }
    if (burger) burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
    if (menu) {
      $$('a', menu).forEach(function (a) {
        a.addEventListener('click', function (e) {
          e.preventDefault();
          var id = a.getAttribute('href').slice(1);
          setMenu(false);
          setTimeout(function () { goTo(id); }, 300);
        });
      });
    }
    window.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  }

  function goTo(id) {
    var el = id === 'home' ? document.body : document.getElementById(id);
    if (!el) return;
    if (id === 'home') window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }

  /* ───────────── Reveal on scroll ───────────── */
  function initReveal() {
    var items = $$('.reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ───────────── 3D tilt on cards (mouse only) ───────────── */
  function initTilt() {
    if (reduce) return;
    $$('.tilt').forEach(function (el) {
      var raf = 0, px = 0, py = 0;
      function paint() {
        raf = 0;
        var r = el.getBoundingClientRect();
        var x = (px - r.left) / r.width;
        var y = (py - r.top) / r.height;
        el.style.setProperty('--ry', ((x - 0.5) * 14).toFixed(2) + 'deg');
        el.style.setProperty('--rx', ((0.5 - y) * 12).toFixed(2) + 'deg');
        el.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
        el.style.setProperty('--my', (y * 100).toFixed(1) + '%');
      }
      el.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse') return;
        px = e.clientX; py = e.clientY;
        if (!raf) raf = requestAnimationFrame(paint);
      });
      el.addEventListener('pointerleave', function () {
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ───────────── Hero extras ───────────── */
  function initRotator() {
    var el = $('#rot');
    var words = D.rotating;
    if (!el || !words || words.length < 2 || reduce) return;
    var i = 0;
    setInterval(function () {
      if (document.hidden) return;
      el.classList.add('is-swap');
      setTimeout(function () {
        i = (i + 1) % words.length;
        el.textContent = words[i];
        el.classList.remove('is-swap');
      }, 280);
    }, 2400);
  }

  function initClock() {
    var el = $('#clock');
    if (!el) return;
    var fmt;
    try { fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }); } catch (e) { fmt = null; }
    if (!fmt) { el.textContent = ''; return; }
    function tick() { el.textContent = fmt.format(new Date()) + ' IST'; }
    tick();
    setInterval(tick, 15000);
  }

  function initToTop() {
    var btn = $('#totop');
    var ring = $('#totop-ring');
    var yr = $('#year');
    if (yr) yr.textContent = '© ' + new Date().getFullYear();
    if (!btn) return;
    var C2 = 2 * Math.PI * 30;
    if (ring) ring.style.strokeDasharray = '0 ' + C2;
    function paint() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (ring) ring.style.strokeDasharray = (p * C2).toFixed(1) + ' ' + C2;
    }
    window.addEventListener('scroll', paint, { passive: true });
    paint();
    btn.addEventListener('click', function () { goTo('home'); });
  }

  /* ───────────── Detail modal ───────────── */
  function initModal() {
    var modal = $('#modal');
    var panel = $('#modal-panel');
    var body = $('#modal-body');
    if (!modal || !panel || !body || !D.projects) return;
    var current = -1;
    var lastFocus = null;
    var typeIndex = { hospital: 1, hotel: 2, gym: 3, boutique: 4, ekip: 7 };

    function fill(i) {
      var p = D.projects[i];
      current = i;
      body.innerHTML =
        '<div class="modal__grid">' +
        '<div class="modal__mock">' + mock(p.motif) + '</div>' +
        '<div class="modal__text">' +
        '<p class="kicker">' + esc(p.kind) + ' · ' + esc(p.badge) + '</p>' +
        '<h3 id="modal-title">' + esc(p.title) + '</h3>' +
        '<p class="lead">' + esc(p.summary) + '</p>' +
        '<p class="who"><b>Good for:</b> ' + esc(p.who) + '</p>' +
        '<ul class="ticks">' + p.features.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul>' +
        '<ul class="chips">' + p.stack.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>' +
        '<div class="modal__cta">' +
        '<button type="button" class="btn btn--solid" data-want="' + esc(p.id) + '">' + (p.id === 'ekip' ? 'I want something like this' : 'I want this for my business') + ' <span class="btn__arrow" aria-hidden="true">↗</span></button>' +
        '<button type="button" class="btn btn--ghost" data-next>Next system <span class="btn__arrow" aria-hidden="true">→</span></button>' +
        '</div></div></div>';
      panel.scrollTop = 0;
      if (!modal.hidden) panel.focus({ preventScroll: true }); // the clicked button was just replaced
    }

    function open(id) {
      var i = -1;
      D.projects.forEach(function (p, idx) { if (p.id === id) i = idx; });
      if (i < 0) return;
      lastFocus = document.activeElement;
      fill(i);
      modal.hidden = false;
      root.style.overflow = 'hidden';
      requestAnimationFrame(function () {
        modal.classList.add('is-open');
        panel.focus({ preventScroll: true });
      });
    }

    function close() {
      if (modal.hidden) return;
      modal.classList.remove('is-open');
      root.style.overflow = '';
      setTimeout(function () { modal.hidden = true; }, reduce ? 0 : 450);
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    }

    document.addEventListener('click', function (e) {
      var t = e.target;
      if (!(t instanceof Element)) return;
      var opener = t.closest('[data-open]');
      if (opener) { open(opener.getAttribute('data-open')); return; }
      if (t.closest('[data-close]')) { close(); return; }
      if (t.closest('[data-next]')) { fill((current + 1) % D.projects.length); return; }
      var want = t.closest('[data-want]');
      if (want) {
        var id = want.getAttribute('data-want');
        var p = D.projects.filter(function (x) { return x.id === id; })[0];
        close();
        var sel = $('#business');
        var msg = $('#message');
        if (sel && typeIndex[id] != null && sel.options[typeIndex[id]]) sel.selectedIndex = typeIndex[id];
        if (msg && p && !msg.value) msg.value = "Hi Sukesh, I'm interested in " + p.title + ' (' + p.kind.toLowerCase() + '). ';
        setTimeout(function () {
          goTo('contact');
          setTimeout(function () { if (msg) msg.focus({ preventScroll: true }); }, reduce ? 50 : 700);
        }, 200);
      }
    });

    document.addEventListener('keydown', function (e) {
      if (modal.hidden) return;
      if (e.key === 'Escape') { close(); return; }
      if (e.key !== 'Tab') return;
      var f = $$('a[href], button:not([disabled])', panel);
      if (!f.length) return;
      var first = f[0];
      var last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ───────────── Contact form ───────────── */
  function initForm() {
    var form = $('#form');
    var status = $('#form-status');
    var btn = $('#send');
    if (!form || !status || !btn) return;

    function say(kind, html) {
      status.className = 'form__status is-' + kind;
      status.innerHTML = html;
    }

    function mailtoHref(v) {
      var subject = 'Website enquiry from ' + v.name;
      var body = v.message + '\n\n— ' + v.name + (v.phone ? '\nPhone: ' + v.phone : '') + (v.business ? '\nBusiness: ' + v.business : '') + '\nEmail: ' + v.email;
      return 'mailto:' + (C.email || '') + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = function (n) { return form.elements.namedItem(n); };
      if (f('botcheck') && f('botcheck').checked) return; // bot
      if (!form.reportValidity()) return;

      var v = {
        name: f('name').value.trim(),
        email: f('email').value.trim(),
        phone: f('phone').value.trim(),
        business: f('business').value,
        message: f('message').value.trim(),
      };

      // Not configured yet → open the visitor's mail app so the message can still reach you.
      if (isPlaceholder(C.web3formsKey)) {
        if (typeof console !== 'undefined') console.warn('[Sukesh Forge] Add your Web3Forms key in js/config.js so form messages arrive in your inbox.');
        say('info', 'Opening your email app so you can send this…');
        window.location.href = mailtoHref(v);
        return;
      }

      btn.disabled = true;
      say('info', 'Sending…');
      var payload = {
        access_key: C.web3formsKey,
        subject: 'New enquiry from ' + v.name + ' — ' + (C.brand || 'Sukesh Forge'),
        from_name: (C.brand || 'Sukesh Forge') + ' website',
        name: v.name,
        email: v.email,
        phone: v.phone || '—',
        business: v.business || '—',
        message: v.message,
      };

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (json) { return { ok: res.ok, json: json }; });
        })
        .then(function (r) {
          if (r.ok && r.json && r.json.success) {
            say('ok', 'Thank you! Your message is on its way to me. I will reply to ' + esc(v.email) + ' personally.');
            form.reset();
          } else {
            throw new Error((r.json && r.json.message) || 'Request failed');
          }
        })
        .catch(function () {
          say('err', 'Sorry, that did not go through. <a href="' + esc(mailtoHref(v)) + '">Click here to email me instead</a>.');
        })
        .then(function () { btn.disabled = false; });
    });
  }

  /* ───────────── Boot ───────────── */
  function boot() {
    renderServices();
    renderWork();
    renderRing();
    renderSteps();
    renderStats();
    renderContact();
    initReveal();
    initTilt();
    initNav();
    initRotator();
    initClock();
    initToTop();
    initModal();
    initForm();
    runLoader(function () { root.classList.add('ready'); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
