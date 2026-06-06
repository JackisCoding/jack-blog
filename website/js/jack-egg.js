/**
 * 标题栏「Jack」彩蛋：点击抖动 + RGB 分离；5s 内 10 次触发玻璃碎裂与全页炸裂
 */
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var CLICK_WINDOW_MS = 5000;
  var CLICKS_TO_SHATTER = 10;
  var clickTimes = [];
  var shattering = false;

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    var brand = document.querySelector(".site-header nav > div > a.text-lg");
    if (!brand) return;

    brand.classList.add("jack-brand-egg");
    brand.setAttribute("data-jack-text", brand.textContent.trim());
    brand.addEventListener("click", onBrandClick);
  }

  function onBrandClick(e) {
    e.preventDefault();
    if (shattering) return;

    var brand = e.currentTarget;
    pulseBrand(brand);
    registerClick(brand);
  }

  function pulseBrand(brand) {
    brand.classList.remove("jack-brand-hit");
    void brand.offsetWidth;
    brand.classList.add("jack-brand-hit");
    setTimeout(function () {
      brand.classList.remove("jack-brand-hit");
    }, 420);
  }

  function registerClick(brand) {
    var now = Date.now();
    clickTimes.push(now);
    clickTimes = clickTimes.filter(function (t) {
      return now - t <= CLICK_WINDOW_MS;
    });

    if (clickTimes.length >= CLICKS_TO_SHATTER) {
      clickTimes = [];
      triggerShatter(brand);
    }
  }

  function triggerShatter(brand) {
    shattering = true;
    document.documentElement.classList.add("jack-egg-active");

    var rect = brand.getBoundingClientRect();
    var origin = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };

    runCrackSequence(origin, function () {
      explodePage(origin);
    });
  }

  /* ===== 玻璃裂痕：三步蔓延 ===== */
  function runCrackSequence(origin, onComplete) {
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
    var stageDuration = 520;

    function frame(now) {
      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.92)";
      ctx.shadowColor = "rgba(190, 59, 64, 0.55)";
      ctx.shadowBlur = 6;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      var elapsed = now - stageStart;
      if (elapsed >= stageDuration && stage < 3) {
        stage++;
        stageStart = now;
        elapsed = 0;
      }

      var progress = Math.min(elapsed / stageDuration, 1);

      for (var s = 1; s <= stage; s++) {
        drawCrackStage(ctx, cracks, s, s < stage ? 1 : progress);
      }

      if (stage < 3 || progress < 1) {
        requestAnimationFrame(frame);
      } else {
        setTimeout(onComplete, 180);
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
    var count = 9;
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

    for (var k = 0; k < 14; k++) {
      var base = rays[k % rays.length];
      var a3 = base.angle + (Math.random() - 0.5) * 0.5;
      var fromX = ox + Math.cos(base.angle) * maxLen * (0.12 + Math.random() * 0.18);
      var fromY = oy + Math.sin(base.angle) * maxLen * (0.12 + Math.random() * 0.18);
      add(fromX, fromY, ox + Math.cos(a3) * maxLen * 0.95, oy + Math.sin(a3) * maxLen * 0.95, 3);
    }

    for (var m = 0; m < 6; m++) {
      var edge = m / 6 * Math.PI * 2;
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

  /* ===== 全页炸裂 ===== */
  function explodePage(origin) {
    document.documentElement.classList.add("jack-egg-shatter");

    var pieces = document.querySelectorAll(
      ".site-header, main, footer, .fx-grid, .fx-glow, .fx-bg-decor, " +
        ".fx-particles, .fx-stickfight, .fx-physics, .fx-code-rain, " +
        ".jack-crack-overlay"
    );

    pieces.forEach(function (el, i) {
      el.classList.add("jack-shatter-piece");
      var dx = (Math.random() - 0.5) * 2.2;
      var dy = (Math.random() - 0.5) * 2.2;
      var dist = Math.hypot(el.getBoundingClientRect().left - origin.x, el.getBoundingClientRect().top - origin.y) || 1;
      var boost = 0.6 + Math.random() * 0.9;
      el.style.setProperty("--jack-dx", String(dx * boost));
      el.style.setProperty("--jack-dy", String(dy * boost));
      el.style.setProperty("--jack-rot", (Math.random() - 0.5) * 140 + "deg");
      el.style.setProperty("--jack-delay", i * 0.018 + "s");
    });

    spawnShardCanvas(origin);

    setTimeout(function () {
      window.location.reload();
    }, 2400);
  }

  function spawnShardCanvas(origin) {
    var canvas = document.createElement("canvas");
    canvas.className = "jack-shatter-burst";
    canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);

    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = window.innerWidth;
    var h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var dark = document.documentElement.getAttribute("data-theme") === "dark";
    var shards = [];
    var colors = dark
      ? ["#292929", "#1A1A1A", "#DC4247", "#404040", "#F5F5F5"]
      : ["#FFFFFF", "#F5F5F5", "#BE3B40", "#E0E0E0", "#606060"];

    for (var i = 0; i < 64; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = 2 + Math.random() * 9;
      shards.push({
        x: origin.x + (Math.random() - 0.5) * 40,
        y: origin.y + (Math.random() - 0.5) * 24,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.35,
        size: 6 + Math.random() * 22,
        color: colors[i % colors.length],
      });
    }

    var start = performance.now();

    function burst(now) {
      ctx.clearRect(0, 0, w, h);
      var t = (now - start) / 1000;

      shards.forEach(function (s) {
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.18;
        s.rot += s.vr;

        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.rot);
        ctx.globalAlpha = Math.max(0, 1 - t * 0.85);
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.moveTo(-s.size * 0.5, 0);
        ctx.lineTo(0, -s.size * 0.35);
        ctx.lineTo(s.size * 0.5, s.size * 0.2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });

      if (t < 2.2) requestAnimationFrame(burst);
    }

    requestAnimationFrame(burst);
  }
})();
