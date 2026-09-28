// Reveal-on-scroll
(function () {
  var els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || !els.length) {
    els.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  els.forEach(function (el) { io.observe(el); });
})();

// Video autoplay fallback: some browser/embed contexts ignore the autoplay
// attribute even when muted, so nudge playback on visibility and on first
// user interaction as a safety net.
(function () {
  var video = document.querySelector('.media video');
  if (!video) return;

  function tryPlay() {
    var p = video.play();
    if (p && p.catch) p.catch(function () {});
  }

  if ('IntersectionObserver' in window) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) tryPlay();
      });
    }, { threshold: 0.25 });
    vio.observe(video);
  } else {
    tryPlay();
  }

  ['click', 'touchstart', 'keydown', 'scroll'].forEach(function (evt) {
    document.addEventListener(evt, tryPlay, { once: true, passive: true });
  });
})();

// Lowpoly triangle-mesh hero background
(function () {
  var canvas = document.getElementById('lowpoly-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var points = [];
  var triangles = [];
  var w, h, dpr;

  var palette = ['#3fd0c9', '#ff8a3d', '#7c5cff', '#ff3d77', '#2a9d97'];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth = canvas.parentElement.offsetWidth;
    h = canvas.clientHeight = canvas.parentElement.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildMesh();
  }

  function buildMesh() {
    points = [];
    var cols = Math.max(5, Math.round(w / 140));
    var rows = Math.max(4, Math.round(h / 140));
    var cellW = w / cols;
    var cellH = h / rows;

    for (var y = 0; y <= rows; y++) {
      for (var x = 0; x <= cols; x++) {
        var jitter = Math.min(cellW, cellH) * 0.35;
        points.push({
          x: x * cellW + (Math.random() - 0.5) * jitter,
          y: y * cellH + (Math.random() - 0.5) * jitter,
          baseX: x * cellW,
          baseY: y * cellH,
          phase: Math.random() * Math.PI * 2
        });
      }
    }

    triangles = [];
    var stride = cols + 1;
    for (var ry = 0; ry < rows; ry++) {
      for (var rx = 0; rx < cols; rx++) {
        var i = ry * stride + rx;
        var a = i, b = i + 1, c = i + stride, d = i + stride + 1;
        var color = palette[Math.floor(Math.random() * palette.length)];
        if (Math.random() > 0.5) {
          triangles.push({ a: a, b: b, c: c, color: color, alpha: 0.03 + Math.random() * 0.05 });
          triangles.push({ a: b, b: d, c: c, color: color, alpha: 0.03 + Math.random() * 0.05 });
        } else {
          triangles.push({ a: a, b: b, c: d, color: color, alpha: 0.03 + Math.random() * 0.05 });
          triangles.push({ a: a, b: d, c: c, color: color, alpha: 0.03 + Math.random() * 0.05 });
        }
      }
    }
  }

  var t = 0;
  function draw() {
    ctx.clearRect(0, 0, w, h);
    if (!reduceMotion) {
      t += 0.006;
      for (var i = 0; i < points.length; i++) {
        var p = points[i];
        p.x = p.baseX + Math.sin(t + p.phase) * 10;
        p.y = p.baseY + Math.cos(t + p.phase * 1.3) * 10;
      }
    }
    for (var j = 0; j < triangles.length; j++) {
      var tr = triangles[j];
      var pa = points[tr.a], pb = points[tr.b], pc = points[tr.c];
      if (!pa || !pb || !pc) continue;
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.lineTo(pc.x, pc.y);
      ctx.closePath();
      ctx.fillStyle = tr.color;
      ctx.globalAlpha = tr.alpha;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (!reduceMotion) requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();
