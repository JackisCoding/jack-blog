/**
 * 标题栏「Jack」彩蛋：5s 内 5 次触发玻璃碎裂，页面随碎片波浪崩解，结束后时空回溯恢复
 */
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var CLICK_WINDOW_MS = 5000;
  var CLICKS_TO_SHATTER = 5;
  var REWIND_MS = 2400;
  var SETTLE_FRAMES = 50;

  var clickTimes = [];
  var shattering = false;
  var shardCanvas = null;
  var shardAnimId = 0;
  var shards = [];
  var pageSnapshot = null;
  var pendingSnapshot = undefined;
  var fallStarted = false;
  var viewW = 0;
  var viewH = 0;
  var phase = "idle";
  var rewindOverlay = null;
  var rewindStart = 0;
  var rewindFrom = [];
  var crackOrigin = null;
  var glassPaneEl = null;

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    var brand = document.querySelector(".site-header nav > div > a.text-lg");
    if (!brand) return;

    brand.classList.add("jack-brand-egg");
    brand.setAttribute("data-jack-text", brand.textContent.trim());
    brand.addEventListener("click", onBrandClick);
    preloadHtml2Canvas();
  }

  function preloadHtml2Canvas() {
    if (window.html2canvas) return;
    var script = document.createElement("script");
    script.src = "js/vendor/html2canvas.min.js";
    script.async = true;
    document.head.appendChild(script);
  }

  function onBrandClick(e) {
    e.preventDefault();
    if (shattering) return;

    pulseBrand(e.currentTarget);
    registerClick();
  }

  function pulseBrand(brand) {
    brand.classList.remove("jack-brand-hit");
    void brand.offsetWidth;
    brand.classList.add("jack-brand-hit");
    setTimeout(function () {
      brand.classList.remove("jack-brand-hit");
    }, 420);
  }

  function registerClick() {
    var now = Date.now();
    clickTimes.push(now);
    clickTimes = clickTimes.filter(function (t) {
      return now - t <= CLICK_WINDOW_MS;
    });

    if (clickTimes.length >= CLICKS_TO_SHATTER) {
      clickTimes = [];
      var brand = document.querySelector(".jack-brand-egg");
      if (brand) triggerShatter(brand);
    }
  }

  function triggerShatter(brand) {
    shattering = true;
    fallStarted = false;
    pendingSnapshot = undefined;
    pageSnapshot = null;
    phase = "cracking";
    crackOrigin = brand.getBoundingClientRect();
    crackOrigin = {
      x: crackOrigin.left + crackOrigin.width / 2,
      y: crackOrigin.top + crackOrigin.height / 2,
    };

    document.documentElement.classList.add("jack-egg-active");
    document.body.classList.add("jack-egg-shaking");

    glassPaneEl = document.createElement("div");
    glassPaneEl.className = "jack-glass-pane";
    glassPaneEl.setAttribute("aria-hidden", "true");
    document.body.appendChild(glassPaneEl);

    capturePageSnapshot(function (snapshot) {
      pendingSnapshot = snapshot || null;
      tryBeginFall();
    });

    runCrackSequence(crackOrigin, {
      onStage3: tryBeginFall,
      onComplete: function () {
        document.body.classList.remove("jack-egg-shaking");
        if (glassPaneEl) {
          glassPaneEl.remove();
          glassPaneEl = null;
        }
        tryBeginFall(true);
      },
    });
  }

  function tryBeginFall(force) {
    if (fallStarted) return;
    if (pendingSnapshot === undefined) {
      if (force) {
        setTimeout(function () {
          tryBeginFall(true);
        }, 32);
      }
      return;
    }

    fallStarted = true;
    pageSnapshot = pendingSnapshot;
    phase = "falling";

    document.body.classList.add("jack-egg-content-hidden");
    startGlassFall(crackOrigin);
  }

  function shouldIgnoreCapture(node) {
    if (!node || !node.classList) return false;
    return (
      node.classList.contains("jack-crack-overlay") ||
      node.classList.contains("jack-glass-pane") ||
      node.classList.contains("jack-glass-shards") ||
      node.classList.contains("jack-rewind-overlay") ||
      node.classList.contains("fx-cursor-dot") ||
      node.classList.contains("fx-cursor-ring")
    );
  }

  function capturePageSnapshot(callback) {
    viewW = window.innerWidth;
    viewH = window.innerHeight;
    var scrollX = window.scrollX;
    var scrollY = window.scrollY;

    function runCapture() {
      window
        .html2canvas(document.body, {
          backgroundColor: null,
          scale: Math.min(window.devicePixelRatio || 1, 2),
          width: viewW,
          height: viewH,
          x: scrollX,
          y: scrollY,
          scrollX: -scrollX,
          scrollY: -scrollY,
          windowWidth: viewW,
          windowHeight: viewH,
          useCORS: true,
          allowTaint: true,
          logging: false,
          ignoreElements: shouldIgnoreCapture,
          onclone: function (clonedDoc) {
            clonedDoc.querySelectorAll(
              ".jack-crack-overlay, .jack-glass-pane, .jack-glass-shards, .jack-rewind-overlay"
            ).forEach(function (el) {
              el.remove();
            });
          },
        })
        .then(callback)
        .catch(function () {
          callback(null);
        });
    }

    if (window.html2canvas) {
      runCapture();
      return;
    }

    var script = document.createElement("script");
    script.src = "js/vendor/html2canvas.min.js";
    script.onload = runCapture;
    script.onerror = function () {
      callback(null);
    };
    document.head.appendChild(script);
  }

  function runCrackSequence(origin, hooks) {
    var overlay = document.createElement("div");
    overlay.className = "jack-crack-overlay";
    overlay.setAttribute("aria-hidden", "true");

    var canvas = document.createElement("canvas");
    overlay.appendChild(canvas);
    document.body.appendChild(overlay);

    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = window.innerWidth;
    var h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var cracks = buildCracks(origin.x, origin.y, w, h);
    var stage = 0;
    var stageStart = performance.now();
    var stageDuration = 420;
    var stage3Fired = false;

    function frame(now) {
      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
      ctx.shadowColor = "rgba(190, 59, 64, 0.6)";
      ctx.shadowBlur = 8;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      var elapsed = now - stageStart;
      if (elapsed >= stageDuration && stage < 3) {
        stage++;
        stageStart = now;
        elapsed = 0;
        if (stage === 3 && !stage3Fired) {
          stage3Fired = true;
          if (hooks.onStage3) hooks.onStage3();
        }
      }

      var progress = Math.min(elapsed / stageDuration, 1);

      for (var s = 1; s <= stage; s++) {
        drawCrackStage(ctx, cracks, s, s < stage ? 1 : progress);
      }

      if (stage < 3 || progress < 1) {
        requestAnimationFrame(frame);
      } else {
        overlay.remove();
        setTimeout(function () {
          if (hooks.onComplete) hooks.onComplete();
        }, 60);
      }
    }

    requestAnimationFrame(frame);
  }

  function buildCracks(ox, oy, w, h) {
    var cracks = [];
    var maxLen = Math.hypot(w, h);

    function add(x1, y1, x2, y2, st) {
      cracks.push({ x1: x1, y1: y1, x2: x2, y2: y2, stage: st });
    }

    function ray(angle, len, st) {
      add(ox, oy, ox + Math.cos(angle) * len, oy + Math.sin(angle) * len, st);
      return {
        mx: ox + Math.cos(angle) * len * 0.55,
        my: oy + Math.sin(angle) * len * 0.55,
        angle: angle,
      };
    }

    var rays = [];
    var count = 11;
    for (var i = 0; i < count; i++) {
      var ang = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.35;
      rays.push(ray(ang, maxLen * (0.08 + Math.random() * 0.1), 1));
    }

    rays.forEach(function (r) {
      var branch = r.angle + (Math.random() > 0.5 ? 1 : -1) * (0.35 + Math.random() * 0.45);
      add(r.mx, r.my, r.mx + Math.cos(branch) * maxLen * 0.14, r.my + Math.sin(branch) * maxLen * 0.14, 2);
    });

    for (var j = 0; j < rays.length; j++) {
      var r2 = rays[j];
      var tipX = ox + Math.cos(r2.angle) * maxLen * 0.22;
      var tipY = oy + Math.sin(r2.angle) * maxLen * 0.22;
      add(r2.mx, r2.my, tipX, tipY, 2);
    }

    for (var k = 0; k < 16; k++) {
      var base = rays[k % rays.length];
      var a3 = base.angle + (Math.random() - 0.5) * 0.5;
      var fromX = ox + Math.cos(base.angle) * maxLen * (0.12 + Math.random() * 0.18);
      var fromY = oy + Math.sin(base.angle) * maxLen * (0.12 + Math.random() * 0.18);
      add(fromX, fromY, ox + Math.cos(a3) * maxLen * 0.95, oy + Math.sin(a3) * maxLen * 0.95, 3);
    }

    for (var m = 0; m < 8; m++) {
      var edge = (m / 8) * Math.PI * 2;
      add(ox, oy, ox + Math.cos(edge) * maxLen, oy + Math.sin(edge) * maxLen, 3);
    }

    return cracks;
  }

  function drawCrackStage(ctx, cracks, stage, progress) {
    var list = cracks.filter(function (c) {
      return c.stage === stage;
    });
    ctx.lineWidth = stage === 1 ? 1.4 : stage === 2 ? 1.8 : 2.2;

    list.forEach(function (c) {
      var x2 = c.x1 + (c.x2 - c.x1) * progress;
      var y2 = c.y1 + (c.y2 - c.y1) * progress;
      ctx.beginPath();
      ctx.moveTo(c.x1, c.y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });
  }

  /* ===== 玻璃碎片：快照绑定、波浪激活、重力、回溯 ===== */
  function startGlassFall(origin) {
    if (shardCanvas) {
      shardCanvas.remove();
      cancelAnimationFrame(shardAnimId);
    }

    var canvas = document.createElement("canvas");
    canvas.className = "jack-glass-shards";
    canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);
    shardCanvas = canvas;

    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = viewW || window.innerWidth;
    var h = viewH || window.innerHeight;

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      viewW = w;
      viewH = h;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    shards = buildGlassShards(w, h, origin);

    var groundY = h - 6;
    var GRAVITY = 0.62;
    var settledFrames = 0;

    function step(now) {
      if (phase === "rewinding") {
        stepRewind(ctx, w, h, now);
        return;
      }

      groundY = h - 6;
      ctx.clearRect(0, 0, w, h);

      if (!pageSnapshot) {
        ctx.fillStyle =
          getComputedStyle(document.documentElement).getPropertyValue("--color-bg").trim() || "#f5f0eb";
        ctx.fillRect(0, 0, w, h);
      }

      var active = 0;

      for (var i = 0; i < shards.length; i++) {
        var s = shards[i];

        if (!s.awakened) {
          s.fallDelay -= 1;
          if (s.fallDelay <= 0) {
            s.awakened = true;
          }
        }

        if (s.awakened && !s.resting) {
          active++;
          s.vy += GRAVITY;
          s.vx *= 0.998;
          s.x += s.vx;
          s.y += s.vy;
          s.angle += s.va;
          s.va *= 0.985;
          resolveGround(s, groundY);
        }
      }

      for (var a = 0; a < shards.length; a++) {
        for (var b = a + 1; b < shards.length; b++) {
          if (shards[a].awakened && shards[b].awakened) {
            resolvePair(shards[a], shards[b]);
          }
        }
      }

      for (var d = 0; d < shards.length; d++) {
        drawGlassShard(ctx, shards[d], w, h);
      }

      if (active === 0 && shards.every(function (s) {
        return s.awakened;
      })) {
        settledFrames++;
      } else {
        settledFrames = 0;
      }

      if (settledFrames > SETTLE_FRAMES) {
        startRewind(now);
        return;
      }

      shardAnimId = requestAnimationFrame(step);
    }

    shardAnimId = requestAnimationFrame(step);

    window.addEventListener("resize", function onResize() {
      resize();
    });
  }

  function buildGlassShards(w, h, origin) {
    var list = [];
    var mobile = window.matchMedia("(max-width: 767px)").matches;
    var cell = mobile ? 62 : 48;
    var cols = Math.max(mobile ? 10 : 14, Math.floor(w / cell));
    var rows = Math.max(mobile ? 9 : 12, Math.floor(h / cell));
    var cw = w / cols;
    var ch = h / rows;
    var maxDist = Math.hypot(w, h);

    function jitter(x, y) {
      return {
        x: Math.max(0, Math.min(w, x + (Math.random() - 0.5) * cw * 0.5)),
        y: Math.max(0, Math.min(h, y + (Math.random() - 0.5) * ch * 0.5)),
      };
    }

    function addTri(p1, p2, p3) {
      var cx = (p1.x + p2.x + p3.x) / 3;
      var cy = (p1.y + p2.y + p3.y) / 3;
      var verts = [
        { x: p1.x - cx, y: p1.y - cy },
        { x: p2.x - cx, y: p2.y - cy },
        { x: p3.x - cx, y: p3.y - cy },
      ];
      var radius = 0;
      for (var i = 0; i < verts.length; i++) {
        radius = Math.max(radius, Math.hypot(verts[i].x, verts[i].y));
      }

      var dx = cx - origin.x;
      var dy = cy - origin.y;
      var dist = Math.hypot(dx, dy) || 1;
      var power = 1.6 + Math.min(7, dist * 0.016);
      var nx = dx / dist;
      var ny = dy / dist;
      var waveDelay = Math.floor((dist / maxDist) * 38 + Math.random() * 6);

      list.push({
        verts: verts,
        x: cx,
        y: cy,
        homeX: cx,
        homeY: cy,
        homeAngle: 0,
        vx: nx * power + (Math.random() - 0.5) * 2.4,
        vy: ny * power * 0.5 - 2.2 - Math.random() * 1.6,
        angle: 0,
        va: (Math.random() - 0.5) * 0.24,
        radius: radius + 2,
        mass: radius,
        resting: false,
        awakened: false,
        fallDelay: waveDelay,
        tint: Math.random(),
      });
    }

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var x0 = c * cw;
        var y0 = r * ch;
        var x1 = x0 + cw;
        var y1 = y0 + ch;
        var p00 = jitter(x0, y0);
        var p10 = jitter(x1, y0);
        var p01 = jitter(x0, y1);
        var p11 = jitter(x1, y1);
        var mid = jitter(x0 + cw * 0.5, y0 + ch * 0.5);

        if (Math.random() > 0.5) {
          addTri(p00, p10, p11);
          addTri(p00, p11, p01);
        } else {
          addTri(p00, p10, mid);
          addTri(p10, p11, mid);
          addTri(p11, p01, mid);
          addTri(p01, p00, mid);
        }
      }
    }

    return list;
  }

  function startRewind(now) {
    phase = "rewinding";
    rewindStart = now || performance.now();
    rewindFrom = shards.map(function (s) {
      return { x: s.x, y: s.y, angle: s.angle };
    });

    if (shardCanvas) {
      shardCanvas.classList.add("jack-glass-rewind");
    }

    rewindOverlay = document.createElement("div");
    rewindOverlay.className = "jack-rewind-overlay";
    rewindOverlay.setAttribute("aria-hidden", "true");
    rewindOverlay.innerHTML =
      '<div class="jack-rewind-vortex"></div>' +
      '<div class="jack-rewind-scan"></div>' +
      '<p class="jack-rewind-label">⟲ 时空回溯</p>';
    document.body.appendChild(rewindOverlay);

    shardAnimId = requestAnimationFrame(function frame(t) {
      stepRewind(shardCanvas.getContext("2d"), viewW, viewH, t);
    });
  }

  function stepRewind(ctx, w, h, now) {
    var t = Math.min(1, (now - rewindStart) / REWIND_MS);
    var ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    ctx.clearRect(0, 0, w, h);

    for (var i = 0; i < shards.length; i++) {
      var s = shards[i];
      var from = rewindFrom[i];
      s.x = from.x + (s.homeX - from.x) * ease;
      s.y = from.y + (s.homeY - from.y) * ease;
      s.angle = from.angle + (s.homeAngle - from.angle) * ease;
      drawGlassShard(ctx, s, w, h, 1 - t * 0.15);
    }

    if (t >= 1) {
      finishRewind();
      return;
    }

    shardAnimId = requestAnimationFrame(function frame(next) {
      stepRewind(ctx, w, h, next);
    });
  }

  function finishRewind() {
    cancelAnimationFrame(shardAnimId);

    if (shardCanvas) {
      shardCanvas.remove();
      shardCanvas = null;
    }
    if (rewindOverlay) {
      rewindOverlay.remove();
      rewindOverlay = null;
    }

    document.body.classList.remove("jack-egg-content-hidden", "jack-egg-shaking");
    document.documentElement.classList.remove("jack-egg-active");
    document.documentElement.classList.add("jack-egg-restored");

    setTimeout(function () {
      document.documentElement.classList.remove("jack-egg-restored");
    }, 600);

    shards = [];
    pageSnapshot = null;
    pendingSnapshot = undefined;
    fallStarted = false;
    phase = "idle";
    shattering = false;
  }

  function worldVerts(s) {
    var cos = Math.cos(s.angle);
    var sin = Math.sin(s.angle);
    var out = [];
    for (var i = 0; i < s.verts.length; i++) {
      var lx = s.verts[i].x;
      var ly = s.verts[i].y;
      out.push({ x: s.x + lx * cos - ly * sin, y: s.y + lx * sin + ly * cos });
    }
    return out;
  }

  function boundsOf(s) {
    var wv = worldVerts(s);
    var minX = wv[0].x;
    var maxX = wv[0].x;
    var minY = wv[0].y;
    var maxY = wv[0].y;
    for (var i = 1; i < wv.length; i++) {
      minX = Math.min(minX, wv[i].x);
      maxX = Math.max(maxX, wv[i].x);
      minY = Math.min(minY, wv[i].y);
      maxY = Math.max(maxY, wv[i].y);
    }
    return { minX: minX, maxX: maxX, minY: minY, maxY: maxY };
  }

  function resolveGround(s, groundY) {
    var b = boundsOf(s);
    if (b.maxY <= groundY) {
      if (s.resting) return;
      if (Math.abs(s.vy) < 0.4 && Math.abs(s.vx) < 0.12 && Math.abs(s.va) < 0.01) {
        s.vy = 0;
        s.vx = 0;
        s.va = 0;
        s.resting = true;
      }
      return;
    }

    s.y -= b.maxY - groundY;
    s.vy *= -0.16;
    s.vx *= 0.7;
    s.va *= 0.5;

    if (Math.abs(s.vy) < 0.55) {
      s.vy = 0;
      if (Math.abs(s.vx) < 0.18) {
        s.vx = 0;
        s.va = 0;
        s.resting = true;
      }
    } else {
      s.resting = false;
    }
  }

  function resolvePair(a, b) {
    var dx = b.x - a.x;
    var dy = b.y - a.y;
    var dist = Math.hypot(dx, dy) || 0.001;
    var minDist = a.radius + b.radius - 1;

    if (dist >= minDist) return;

    var nx = dx / dist;
    var ny = dy / dist;
    var overlap = minDist - dist;
    var total = a.mass + b.mass;
    a.x -= (nx * overlap * b.mass) / total;
    a.y -= (ny * overlap * b.mass) / total;
    b.x += (nx * overlap * a.mass) / total;
    b.y += (ny * overlap * a.mass) / total;

    if (a.resting && b.resting) return;

    var dvx = a.vx - b.vx;
    var dvy = a.vy - b.vy;
    var vn = dvx * nx + dvy * ny;
    if (vn <= 0) return;

    var restitution = 0.12;
    var impulse = (-(1 + restitution) * vn) / (1 / a.mass + 1 / b.mass);
    a.vx -= (impulse / a.mass) * nx;
    a.vy -= (impulse / a.mass) * ny;
    b.vx += (impulse / b.mass) * nx;
    b.vy += (impulse / b.mass) * ny;

    a.resting = false;
    b.resting = false;
  }

  function drawGlassShard(ctx, s, w, h, glassAlpha) {
    var dark = document.documentElement.getAttribute("data-theme") === "dark";
    var wv = worldVerts(s);
    var overlayA = glassAlpha != null ? glassAlpha : 1;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(wv[0].x, wv[0].y);
    for (var i = 1; i < wv.length; i++) {
      ctx.lineTo(wv[i].x, wv[i].y);
    }
    ctx.closePath();
    ctx.clip();

    if (pageSnapshot) {
      ctx.drawImage(pageSnapshot, 0, 0, pageSnapshot.width, pageSnapshot.height, 0, 0, w, h);
    } else {
      var fill = dark
        ? "rgba(255, 255, 255, " + (0.06 + s.tint * 0.08) + ")"
        : "rgba(255, 255, 255, " + (0.18 + s.tint * 0.12) + ")";
      ctx.fillStyle = fill;
      ctx.fill();
    }

    ctx.fillStyle = dark
      ? "rgba(255,255,255," + 0.06 * overlayA + ")"
      : "rgba(255,255,255," + 0.1 * overlayA + ")";
    ctx.fillRect(0, 0, w, h);

    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(wv[0].x, wv[0].y);
    for (var j = 1; j < wv.length; j++) {
      ctx.lineTo(wv[j].x, wv[j].y);
    }
    ctx.closePath();

    ctx.strokeStyle = dark ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.82)";
    ctx.lineWidth = 1.15;
    ctx.stroke();

    ctx.strokeStyle = "rgba(190, 59, 64, 0.22)";
    ctx.lineWidth = 0.6;
    ctx.stroke();

    ctx.restore();
  }
})();
