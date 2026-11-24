/*
 * Pull cord — the dark / light switch.
 * Drag the knob (or any part of the chain) down and let go. A quick tap, Enter or Space
 * pulls it for you. A damped spring returns the knob; sideways it swings like a pendulum.
 * Everything is written straight to the DOM from one rAF loop that sleeps when the cord rests.
 */
(function () {
  'use strict';

  var stage = document.getElementById('cord');
  var btn = document.getElementById('cord-btn');
  var strip = document.getElementById('cord-strip');
  var cordPath = document.getElementById('cord-beads');
  var corePath = document.getElementById('cord-core');
  var knob = document.getElementById('cord-knob');
  var glow = document.getElementById('cord-glow');
  var releaseEl = document.getElementById('cord-release');
  var hint = document.getElementById('cord-hint');
  var hintText = document.getElementById('cord-hint-text');
  if (!stage || !btn || !strip || !cordPath || !corePath || !knob || !window.Forge) return;

  var W = 96;
  var AX = W / 2;
  var MAX_PULL = 140;
  var THRESHOLD = 44;
  var FLICK_SPEED = 450;
  var FLICK_MIN = 18;
  var reduced = window.Forge.reduce;

  var s = {
    rest: 118,
    pos: { x: AX, y: -80 },
    vel: { x: 0, y: 0 },
    dragging: false,
    pointer: { x: AX, y: 0 },
    pointerVel: 0,
    lastMoveAt: 0,
    grabOffset: 0,
    armed: false,
    raf: 0,
    last: 0,
    downAt: 0,
    downPos: { x: 0, y: 0 },
    moved: 0,
    auto: 0,
  };

  var pulled = false;
  try { pulled = localStorage.getItem('forge-cord-pulled') === 'yes'; } catch (e) { /* ignore */ }
  if (pulled && hint) hint.style.display = 'none';

  function setRest() {
    var scrolled = window.scrollY > window.innerHeight * 0.5;
    var mobile = window.innerWidth < 768;
    s.rest = scrolled ? (mobile ? 40 : 46) : mobile ? 66 : 118;
    if (hint) hint.style.opacity = scrolled ? '0' : '1';
  }

  function pointerTarget(rect) {
    var pull = s.pointer.y - rect.top - s.grabOffset - s.rest;
    var band = pull > 0 ? MAX_PULL * (1 - Math.exp(-pull / MAX_PULL)) : pull * 0.3;
    return {
      tx: AX + Math.max(-40, Math.min(40, (s.pointer.x - rect.left - AX) * 0.5)),
      ty: s.rest + band,
      raw: pull,
    };
  }

  function render() {
    var x = s.pos.x, y = s.pos.y;
    var dx = x - AX;
    var cxp = AX + dx * 0.5 - s.vel.x * 0.035;
    var d = 'M ' + AX + ' 0 Q ' + cxp.toFixed(2) + ' ' + (y * 0.5).toFixed(2) + ' ' + x.toFixed(2) + ' ' + y.toFixed(2);
    cordPath.setAttribute('d', d);
    corePath.setAttribute('d', d);
    var stretch = Math.max(0, y - s.rest) / MAX_PULL;
    cordPath.setAttribute('stroke-dasharray', '0 ' + (6.4 + stretch * 2.6).toFixed(2));
    var angle = (-Math.atan2(dx, Math.max(1, y)) * 180) / Math.PI;
    knob.setAttribute('transform', 'translate(' + x.toFixed(2) + ' ' + y.toFixed(2) + ') rotate(' + angle.toFixed(2) + ') scale(' + (s.dragging ? 1.1 : 1) + ')');
    btn.style.transform = 'translate(' + (x - 36).toFixed(1) + 'px,' + (y - 14).toFixed(1) + 'px)';
    strip.style.height = Math.max(0, y - 6) + 'px';
    var prog = Math.min(1, Math.max(0, (y - s.rest) / THRESHOLD));
    if (glow) {
      glow.setAttribute('cx', x);
      glow.setAttribute('cy', y + 24);
      glow.setAttribute('r', 14 + prog * 12);
      glow.style.opacity = prog >= 1 ? 1 : prog * 0.35;
    }
    if (releaseEl) {
      releaseEl.style.transform = 'translate(' + (x - 18).toFixed(1) + 'px,' + (y + 52).toFixed(1) + 'px)';
      releaseEl.style.opacity = s.dragging && prog >= 1 ? '1' : '0';
    }
    if (hint) hint.style.transform = 'translate(0,' + (y - s.rest).toFixed(1) + 'px)';
  }

  function step(now) {
    var dt = Math.min(0.032, (now - (s.last || now)) / 1000) || 0.016;
    s.last = now;
    var rect = stage.getBoundingClientRect();

    if (s.dragging) {
      var tg = pointerTarget(rect);
      var nx = s.pos.x + (tg.tx - s.pos.x) * 0.55;
      var ny = s.pos.y + (tg.ty - s.pos.y) * 0.8;
      s.vel = { x: (nx - s.pos.x) / dt, y: (ny - s.pos.y) / dt };
      s.pos = { x: nx, y: ny };
      var armed = tg.ty - s.rest > THRESHOLD;
      if (armed !== s.armed) {
        s.armed = armed;
        if (armed && navigator.vibrate) navigator.vibrate(8);
      }
    } else if (s.auto > now) {
      var ty = s.rest + THRESHOLD + 26;
      s.pos.y += (ty - s.pos.y) * 0.35;
      s.vel = { x: 0, y: 0 };
    } else {
      var ay = -230 * (s.pos.y - s.rest) - 12 * s.vel.y + (s.pos.y < s.rest - 20 ? 900 : 0);
      var ax = -70 * (s.pos.x - AX) - 4.2 * s.vel.x;
      s.vel.y += ay * dt;
      s.vel.x += ax * dt;
      s.pos.y += s.vel.y * dt;
      s.pos.x += s.vel.x * dt;
    }

    render();

    var settled =
      !s.dragging && s.auto <= now &&
      Math.abs(s.pos.y - s.rest) < 0.05 && Math.abs(s.pos.x - AX) < 0.05 &&
      Math.abs(s.vel.x) < 0.5 && Math.abs(s.vel.y) < 0.5;
    if (settled) {
      s.pos = { x: AX, y: s.rest };
      render();
      s.raf = 0;
      s.last = 0;
      return;
    }
    s.raf = requestAnimationFrame(step);
  }

  function wake() { if (!s.raf) s.raf = requestAnimationFrame(step); }

  function fire() {
    var rect = stage.getBoundingClientRect();
    if (navigator.vibrate) navigator.vibrate(14);
    window.Forge.toggleTheme({ x: rect.left + s.pos.x, y: rect.top + s.pos.y + 20 });
    if (!pulled) {
      pulled = true;
      if (hint) hint.style.display = 'none';
      try { localStorage.setItem('forge-cord-pulled', 'yes'); } catch (e) { /* ignore */ }
    }
  }

  function autoPull() {
    if (s.auto > performance.now()) return;
    s.auto = performance.now() + 200;
    wake();
    setTimeout(function () {
      fire();
      s.vel.y = -280;
      wake();
    }, 180);
  }

  function onDown(e) {
    if (e.button !== 0) return;
    e.preventDefault();
    var rect = stage.getBoundingClientRect();
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    s.dragging = true;
    s.armed = false;
    s.pointer = { x: e.clientX, y: e.clientY };
    s.pointerVel = 0;
    s.lastMoveAt = performance.now();
    s.grabOffset = Math.min(e.clientY - rect.top - s.pos.y, 40);
    s.downAt = performance.now();
    s.downPos = { x: e.clientX, y: e.clientY };
    s.moved = 0;
    wake();
  }

  function onMove(e) {
    if (!s.dragging) return;
    var now = performance.now();
    var dtm = Math.max(8, now - s.lastMoveAt) / 1000;
    s.pointerVel = s.pointerVel * 0.4 + ((e.clientY - s.pointer.y) / dtm) * 0.6;
    s.lastMoveAt = now;
    s.pointer = { x: e.clientX, y: e.clientY };
    s.moved = Math.max(s.moved, Math.hypot(e.clientX - s.downPos.x, e.clientY - s.downPos.y));
  }

  function onRelease(e) {
    if (!s.dragging) return;
    s.dragging = false;
    try {
      if (e.currentTarget.hasPointerCapture && e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (err) { /* ignore */ }
    s.pointer = { x: e.clientX, y: e.clientY };
    var quickTap = s.moved < 6 && performance.now() - s.downAt < 400;
    var rect = stage.getBoundingClientRect();
    var tg = pointerTarget(rect);
    var recent = performance.now() - s.lastMoveAt < 120;
    var flick = recent && s.pointerVel > FLICK_SPEED && tg.raw > FLICK_MIN;
    if (quickTap) {
      autoPull();
    } else if (tg.ty - s.rest > THRESHOLD || flick) {
      s.pos.y = Math.max(s.pos.y, tg.ty);
      fire();
    }
    s.armed = false;
    wake();
  }

  [btn, strip].forEach(function (el) {
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onRelease);
    el.addEventListener('pointercancel', onRelease);
    el.addEventListener('lostpointercapture', onRelease);
  });

  // Keyboard activation only (mouse / touch are handled by the pointer events above).
  btn.addEventListener('click', function (e) { if (e.detail === 0) autoPull(); });

  function syncLabel() {
    var light = window.Forge.getTheme() === 'light';
    var next = light ? 'dark' : 'light';
    btn.setAttribute('aria-checked', String(light));
    btn.setAttribute('aria-label', 'Light switch. Pull the cord to switch to ' + next + ' mode.');
    btn.setAttribute('title', 'Pull for ' + next + ' mode');
    if (hintText) hintText.textContent = 'Pull for ' + next;
  }
  window.addEventListener('themechange', syncLabel);
  syncLabel();

  setRest();
  if (reduced) s.pos = { x: AX, y: s.rest };
  render();

  // Drop the cord in after the loader lifts.
  setTimeout(wake, reduced ? 0 : 1900);

  // Occasional idle nudge so the cord feels alive.
  setInterval(function () {
    if (reduced || s.dragging || document.hidden) return;
    s.vel.x += (Math.random() > 0.5 ? 1 : -1) * (18 + Math.random() * 14);
    wake();
  }, 7000);

  var lastY = window.scrollY;
  window.addEventListener('scroll', function () {
    var dy = window.scrollY - lastY;
    lastY = window.scrollY;
    var prev = s.rest;
    setRest();
    if (prev !== s.rest) wake();
    if (reduced || s.dragging) return;
    s.vel.x += Math.max(-40, Math.min(40, dy * 0.6));
    wake();
  }, { passive: true });
  window.addEventListener('resize', function () { setRest(); wake(); });
})();
