/*
 * Hero 3D scene: a rotating node-globe, two orbit rings carrying the business chips,
 * and rising forge sparks — drawn with real 3D maths on a 2D canvas (no libraries).
 * Reacts to the mouse and to scrolling, follows the dark / light theme, and pauses
 * when off-screen or when the visitor prefers reduced motion.
 */
(function () {
  'use strict';

  var canvas = document.getElementById('globe');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var hero = canvas.parentElement;
  var chips = Array.prototype.slice.call(document.querySelectorAll('.orbit-chip'));
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var W = 0, H = 0, dpr = 1, cx = 0, cy = 0, R = 100;
  var fg = '244,244,245';
  var em = '255,107,26';
  var light = false;

  /* Geometry: Fibonacci sphere + nearest-neighbour edges */
  var N = 150;
  var pts = [];
  var GA = Math.PI * (3 - Math.sqrt(5));
  for (var i = 0; i < N; i++) {
    var y = 1 - (i / (N - 1)) * 2;
    var r = Math.sqrt(1 - y * y);
    var th = GA * i;
    pts.push({ x: Math.cos(th) * r, y: y, z: Math.sin(th) * r, ember: i % 13 === 0 });
  }
  var edges = [];
  for (var a = 0; a < N; a++) {
    for (var b = a + 1; b < N; b++) {
      var dx = pts[a].x - pts[b].x, dy = pts[a].y - pts[b].y, dz = pts[a].z - pts[b].z;
      if (dx * dx + dy * dy + dz * dz < 0.2) edges.push([a, b]);
    }
  }
  var proj = pts.map(function () { return { x: 0, y: 0, z: 0, s: 1 }; });

  /* Sparks */
  var sparks = [];
  for (var k = 0; k < 38; k++) sparks.push(newSpark(true));
  function newSpark(scatter) {
    return {
      x: (Math.random() - 0.5) * 1.6,
      y: scatter ? Math.random() * 1.4 : 0,
      vy: 0.12 + Math.random() * 0.28,
      vx: (Math.random() - 0.5) * 0.06,
      life: 0,
      max: 2.2 + Math.random() * 2.6,
      size: 0.8 + Math.random() * 1.8,
    };
  }

  function readColors() {
    var cs = getComputedStyle(document.documentElement);
    fg = cs.getPropertyValue('--fg-rgb').trim() || fg;
    em = cs.getPropertyValue('--ember-rgb').trim() || em;
    light = document.documentElement.dataset.theme === 'light';
  }

  function layout() {
    var rect = hero.getBoundingClientRect();
    W = Math.max(1, Math.round(rect.width));
    H = Math.max(1, Math.round(rect.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (W < 820) {
      cx = W * 0.5;
      cy = H * 0.76;
      R = Math.min(W * 0.27, H * 0.16);
    } else {
      cx = W * 0.665;
      cy = H * 0.5;
      R = Math.min(W * 0.17, H * 0.33);
    }
  }

  /* State */
  var yaw = 0, pitch = 0.38;
  var mx = 0, my = 0, tx = 0, ty = 0;
  var F = 3.4; // camera distance (unit-sphere radii)
  var last = 0;
  var visible = true;
  var raf = 0;
  var t0 = performance.now();

  window.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;
    tx = e.clientX / window.innerWidth - 0.5;
    ty = e.clientY / window.innerHeight - 0.5;
  }, { passive: true });

  function rot(p, yw, pt) {
    var cyw = Math.cos(yw), syw = Math.sin(yw), cpt = Math.cos(pt), spt = Math.sin(pt);
    var x1 = p.x * cyw + p.z * syw;
    var z1 = -p.x * syw + p.z * cyw;
    var y2 = p.y * cpt - z1 * spt;
    var z2 = p.y * spt + z1 * cpt;
    return { x: x1, y: y2, z: z2 };
  }

  function ringPoint(theta, rad, tiltX, tiltZ) {
    var x = Math.cos(theta) * rad, yy = 0, z = Math.sin(theta) * rad;
    var cxr = Math.cos(tiltX), sxr = Math.sin(tiltX);
    var y1 = yy * cxr - z * sxr;
    var z1 = yy * sxr + z * cxr;
    var czr = Math.cos(tiltZ), szr = Math.sin(tiltZ);
    var x2 = x * czr - y1 * szr;
    var y2 = x * szr + y1 * czr;
    return { x: x2, y: y2, z: z1 };
  }

  function toScreen(p) {
    var s = F / (F - p.z);
    return { x: cx + p.x * R * s, y: cy + p.y * R * s, z: p.z, s: s };
  }

  function drawRing(rad, tiltX, tiltZ, dashed, strength) {
    var STEPS = 120;
    var prev = null;
    ctx.lineWidth = 1;
    for (var i = 0; i <= STEPS; i++) {
      var p = toScreen(rot(ringPoint((i / STEPS) * Math.PI * 2, rad, tiltX, tiltZ), yaw * 0.25, 0));
      if (prev && (!dashed || i % 3 !== 0)) {
        var depth = (p.z + prev.z) / 2;
        ctx.strokeStyle = 'rgba(' + fg + ',' + (strength * (0.25 + 0.75 * ((depth + rad) / (2 * rad)))).toFixed(3) + ')';
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
      prev = p;
    }
  }

  function draw(now) {
    var dt = Math.min(0.05, (now - (last || now)) / 1000);
    last = now;
    var time = (now - t0) / 1000;

    if (!reduce) {
      mx += (tx - mx) * 0.06;
      my += (ty - my) * 0.06;
      yaw += dt * 0.28;
    }
    var scrollY = window.scrollY || 0;
    var yw = yaw + mx * 1.4 + scrollY * 0.002;
    var pt = 0.38 + my * 0.6;

    ctx.clearRect(0, 0, W, H);

    /* ember glow behind the globe */
    var g = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R * 1.7);
    g.addColorStop(0, 'rgba(' + em + ',' + (light ? 0.16 : 0.22) + ')');
    g.addColorStop(1, 'rgba(' + em + ',0)');
    ctx.fillStyle = g;
    ctx.fillRect(cx - R * 2, cy - R * 2, R * 4, R * 4);

    /* back half of rings */
    drawRing(1.28, 0.5, 0.35, true, 0.34);
    drawRing(1.62, -0.35, -0.28, false, 0.4);

    /* project globe */
    var i;
    for (i = 0; i < N; i++) {
      var q = rot(pts[i], yw, pt);
      var s = F / (F - q.z);
      proj[i].x = cx + q.x * R * s;
      proj[i].y = cy + q.y * R * s;
      proj[i].z = q.z;
      proj[i].s = s;
    }

    /* edges */
    ctx.lineWidth = 1;
    for (i = 0; i < edges.length; i++) {
      var A = proj[edges[i][0]], B = proj[edges[i][1]];
      var d = ((A.z + B.z) / 2 + 1) / 2; // 0 back … 1 front
      var hot = pts[edges[i][0]].ember || pts[edges[i][1]].ember;
      ctx.strokeStyle = hot
        ? 'rgba(' + em + ',' + (0.12 + d * 0.6).toFixed(3) + ')'
        : 'rgba(' + fg + ',' + (0.04 + d * (light ? 0.34 : 0.3)).toFixed(3) + ')';
      ctx.beginPath();
      ctx.moveTo(A.x, A.y);
      ctx.lineTo(B.x, B.y);
      ctx.stroke();
    }

    /* nodes */
    for (i = 0; i < N; i++) {
      var P = proj[i];
      var dd = (P.z + 1) / 2;
      if (pts[i].ember) {
        var pulse = 0.65 + 0.35 * Math.sin(time * 2 + i);
        ctx.fillStyle = 'rgba(' + em + ',' + (0.25 + 0.75 * dd * pulse).toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(P.x, P.y, (1.8 + 2.2 * dd) * P.s * (R / 220 + 0.5), 0, 6.2832);
        ctx.fill();
      } else {
        ctx.fillStyle = 'rgba(' + fg + ',' + (0.08 + 0.7 * dd).toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(P.x, P.y, (0.9 + 1.4 * dd) * P.s, 0, 6.2832);
        ctx.fill();
      }
    }

    /* front half of rings is drawn over the globe by the same call order: draw again, subtle */
    drawRing(1.62, -0.35, -0.28, false, 0.22);

    /* chips ride ring 2 */
    for (i = 0; i < chips.length; i++) {
      var th = time * 0.32 + (i * Math.PI * 2) / chips.length;
      var cp = toScreen(rot(ringPoint(th, 1.62, -0.35, -0.28), yaw * 0.25, 0));
      var depth = (cp.z + 1.62) / 3.24; // 0 back … 1 front
      var sc = 0.72 + 0.4 * depth;
      chips[i].style.transform = 'translate3d(' + cp.x.toFixed(1) + 'px,' + cp.y.toFixed(1) + 'px,0) translate(-50%,-50%) scale(' + sc.toFixed(3) + ')';
      chips[i].style.opacity = (0.25 + 0.75 * depth).toFixed(2);
      chips[i].style.zIndex = depth > 0.5 ? 3 : 0;
    }

    /* sparks */
    if (!reduce) {
      ctx.save();
      if (!light) ctx.globalCompositeOperation = 'lighter';
      for (i = 0; i < sparks.length; i++) {
        var sp = sparks[i];
        sp.life += dt;
        sp.y += sp.vy * dt;
        sp.x += sp.vx * dt + Math.sin(time * 2 + i) * 0.0006;
        if (sp.life > sp.max || sp.y > 1.6) { sparks[i] = newSpark(false); continue; }
        var f = 1 - sp.life / sp.max;
        ctx.fillStyle = 'rgba(' + em + ',' + (f * (light ? 0.7 : 0.9)).toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(cx + sp.x * R, cy + R * 1.05 - sp.y * R * 1.5, sp.size * f + 0.3, 0, 6.2832);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function loop(now) {
    raf = 0;
    if (!visible || document.hidden) return;
    draw(now);
    if (!reduce) raf = requestAnimationFrame(loop);
  }
  function start() { if (!raf) { last = 0; raf = requestAnimationFrame(loop); } }
  function redrawOnce() { requestAnimationFrame(function (n) { draw(n); }); }

  readColors();
  layout();
  start();

  window.addEventListener('themechange', function () { readColors(); if (reduce) redrawOnce(); });
  var rt = 0;
  function onResize() { clearTimeout(rt); rt = setTimeout(function () { layout(); if (reduce) redrawOnce(); }, 80); }
  window.addEventListener('resize', onResize);
  if ('ResizeObserver' in window) new ResizeObserver(onResize).observe(hero);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) start(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (visible) start();
    }, { threshold: 0 }).observe(hero);
  }
})();
