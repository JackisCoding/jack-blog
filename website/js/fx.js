/**
 * 全站科技感动效：光标、网格光晕、代码雨、故障字、滚动视差、物理彩蛋
 * 尊重 prefers-reduced-motion；触控设备自动降级
 */
var Fx = (function () {
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var touch =
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia("(pointer: coarse)").matches;
  var desktop = window.matchMedia("(min-width: 768px)").matches;

  var mx = 0;
  var my = 0;
  var glowX = 0;
  var glowY = 0;
  var rafId = 0;
  var cursorDot = null;
  var cursorRing = null;
  var glowEl = null;
  var hovering = false;

  function init() {
    if (reduced) return;

    document.documentElement.classList.add("fx-enhanced");
    initGridAndGlow();
    initGlitchText();
    initScrollReveal();
    initParallax();

    if (desktop && !touch) {
      initCursor();
      initPhysics();
    }

    if (document.querySelector(".hero-banner")) {
      initCodeRain();
    }

    observeDynamicCards();
  }

  /* ===== 1. 网格 + 鼠标光晕 ===== */
  function initGridAndGlow() {
    var grid = document.createElement("div");
    grid.className = "fx-grid";
    grid.setAttribute("aria-hidden", "true");

    glowEl = document.createElement("div");
    glowEl.className = "fx-glow";
    glowEl.setAttribute("aria-hidden", "true");

    document.body.prepend(glowEl);
    document.body.prepend(grid);

    if (touch) {
      glowEl.style.opacity = "0.35";
      glowEl.style.left = "50%";
      glowEl.style.top = "30%";
      return;
    }

    document.addEventListener(
      "mousemove",
      function (e) {
        mx = e.clientX;
        my = e.clientY;
        glowX = e.clientX;
        glowY = e.clientY;
        updateCursorPosition();
      },
      { passive: true }
    );
  }

  function updateCursorPosition() {
    if (!cursorDot || !cursorRing) return;
    var scale = hovering ? 1.6 : 1;
    cursorDot.style.left = mx + "px";
    cursorDot.style.top = my + "px";
    cursorRing.style.left = mx + "px";
    cursorRing.style.top = my + "px";
    cursorRing.style.transform =
      "translate(-50%, -50%) scale(" + scale + ")";
    cursorDot.style.transform =
      "translate(-50%, -50%)" + (hovering ? " scale(1.35)" : "");
  }

  /* ===== 2. 个性化光标 ===== */
  function initCursor() {
    document.body.classList.add("fx-cursor-active");

    cursorDot = document.createElement("div");
    cursorDot.className = "fx-cursor-dot";
    cursorRing = document.createElement("div");
    cursorRing.className = "fx-cursor-ring";

    document.body.appendChild(cursorDot);
    document.body.appendChild(cursorRing);

    document.addEventListener("mouseover", onPointerOver, true);
    document.addEventListener("mouseout", onPointerOut, true);
    document.addEventListener("mousedown", onPointerDown, true);

    tick();
  }

  function isInteractive(el) {
    if (!el || el === document.body) return false;
    return Boolean(
      el.closest(
        "a, button, input, textarea, select, label, .btn-primary, .btn-outline-light, .theme-toggle, .tag-filter, .social-link, .article-card, .fx-physics"
      )
    );
  }

  function onPointerOver(e) {
    if (isInteractive(e.target)) {
      hovering = true;
      cursorRing.classList.add("fx-cursor-ring--hover");
      cursorDot.classList.add("fx-cursor-dot--hover");
      updateCursorPosition();
    }
  }

  function onPointerOut(e) {
    if (isInteractive(e.target)) {
      hovering = false;
      cursorRing.classList.remove("fx-cursor-ring--hover");
      cursorDot.classList.remove("fx-cursor-dot--hover");
      updateCursorPosition();
    }
  }

  function onPointerDown(e) {
    if (!cursorRing) return;
    cursorRing.classList.add("fx-cursor-ring--click");
    spawnRipple(e.clientX, e.clientY);
    setTimeout(function () {
      cursorRing.classList.remove("fx-cursor-ring--click");
    }, 400);
  }

  function spawnRipple(x, y) {
    var ripple = document.createElement("div");
    ripple.className = "fx-cursor-ripple";
    ripple.style.left = x + "px";
    ripple.style.top = y + "px";
    document.body.appendChild(ripple);
    ripple.addEventListener("animationend", function () {
      ripple.remove();
    });
  }

  function tick() {
    if (glowEl && !touch) {
      var gx = glowEl._gx || glowX;
      var gy = glowEl._gy || glowY;
      gx += (glowX - gx) * 0.06;
      gy += (glowY - gy) * 0.06;
      glowEl._gx = gx;
      glowEl._gy = gy;
      glowEl.style.left = gx + "px";
      glowEl.style.top = gy + "px";
    }

    rafId = requestAnimationFrame(tick);
  }

  /* ===== 3. 故障艺术字 ===== */
  function initGlitchText() {
    var nodes = document.querySelectorAll(
      ".hero-banner h1, .page-banner h1, .site-header nav > div > a.text-lg"
    );
    nodes.forEach(function (el) {
      el.classList.add("glitch-text");
      if (!el.getAttribute("data-text")) {
        el.setAttribute("data-text", el.textContent.trim());
      }
    });
  }

  function applyGlitch(el) {
    if (!el || el.classList.contains("glitch-text")) return;
    el.classList.add("glitch-text");
    el.setAttribute("data-text", el.textContent.trim());
  }

  /* ===== 4. 滚动显现 + 视差 ===== */
  function initScrollReveal() {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    markRevealables(observer);
  }

  function markRevealables(observer) {
    var sel =
      ".article-card, .tech-gallery__item, .tag-filter, blockquote, .social-link, .bg-warm-card";
    document.querySelectorAll(sel).forEach(function (el) {
      el.classList.add("reveal-on-scroll");
      observer.observe(el);
    });
  }

  function observeDynamicCards() {
    var targets = [
      document.getElementById("home-articles"),
      document.getElementById("article-list"),
      document.getElementById("article-detail"),
    ].filter(Boolean);

    if (!targets.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    var mo = new MutationObserver(function () {
      targets.forEach(function (root) {
        root.querySelectorAll(".article-card:not(.reveal-on-scroll)").forEach(function (el) {
          el.classList.add("reveal-on-scroll");
          observer.observe(el);
        });
        var h1 = root.querySelector("h1:not(.glitch-text)");
        if (h1) applyGlitch(h1);
      });
    });

    targets.forEach(function (root) {
      mo.observe(root, { childList: true, subtree: true });
    });
  }

  function initParallax() {
    var layers = [
      { sel: ".hero-banner__bg", speed: 0.22, scale: 1.02 },
      { sel: ".hero-banner__robot", speed: 0.1 },
      { sel: ".page-banner__bg", speed: 0.18 },
    ];

    var items = [];
    layers.forEach(function (layer) {
      document.querySelectorAll(layer.sel).forEach(function (el) {
        el.classList.add("fx-parallax");
        items.push({ el: el, speed: layer.speed, scale: layer.scale || 1 });
      });
    });

    if (!items.length) return;

    var ticking = false;
    window.addEventListener(
      "scroll",
      function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          var y = window.scrollY;
          items.forEach(function (item) {
            var scale = item.scale && item.scale !== 1 ? " scale(" + item.scale + ")" : "";
            item.el.style.transform =
              "translate3d(0, " + y * item.speed + "px, 0)" + scale;
          });
          ticking = false;
        });
      },
      { passive: true }
    );
  }

  /* ===== 5. Hero 代码雨 ===== */
  function initCodeRain() {
    var hero = document.querySelector(".hero-banner");
    if (!hero) return;

    var canvas = document.createElement("canvas");
    canvas.className = "fx-code-rain";
    canvas.setAttribute("aria-hidden", "true");
    hero.insertBefore(canvas, hero.firstChild);

    var ctx = canvas.getContext("2d");
    var chars =
      "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンABCDEF{}[]<>/\\|";
    var fontSize = 14;
    var columns = 0;
    var drops = [];
    var running = true;

    function resize() {
      var rect = hero.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      columns = Math.ceil(canvas.width / fontSize);
      drops = [];
      for (var i = 0; i < columns; i++) {
        drops[i] = Math.random() * -canvas.height / fontSize;
      }
    }

    function draw() {
      if (!running) return;
      ctx.fillStyle = "rgba(20, 20, 20, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      var accent =
        getComputedStyle(document.documentElement).getPropertyValue("--color-accent").trim() ||
        "#BE3B40";

      ctx.font = fontSize + "px monospace";
      for (var i = 0; i < drops.length; i++) {
        var text = chars.charAt(Math.floor(Math.random() * chars.length));
        var x = i * fontSize;
        var y = drops[i] * fontSize;
        ctx.fillStyle = i % 3 === 0 ? accent : "rgba(255,255,255,0.35)";
        ctx.fillText(text, x, y);
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 0.45 + Math.random() * 0.35;
      }
      requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener("resize", resize);

    var io = new IntersectionObserver(
      function (entries) {
        running = entries[0].isIntersecting;
        if (running) draw();
      },
      { threshold: 0 }
    );
    io.observe(hero);
  }

  /* ===== 6. 重力拖拽彩蛋 ===== */
  function initPhysics() {
    var wrap = document.createElement("div");
    wrap.className = "fx-physics";
    wrap.setAttribute("title", "拖拽小球试试");

    var label = document.createElement("span");
    label.className = "fx-physics__hint";
    label.textContent = "拖拽 · 抛出";

    var canvas = document.createElement("canvas");
    wrap.appendChild(label);
    wrap.appendChild(canvas);
    document.body.appendChild(wrap);

    var ctx = canvas.getContext("2d");
    var W = 300;
    var H = 200;
    canvas.width = W;
    canvas.height = H;

    var bodies = [];
    var drag = null;
    var lastX = 0;
    var lastY = 0;
    var history = [];

    function rand(min, max) {
      return min + Math.random() * (max - min);
    }

    function Body(x, y, r, shape) {
      this.x = x;
      this.y = y;
      this.r = r;
      this.shape = shape;
      this.vx = rand(-1, 1);
      this.vy = rand(-1, 1);
      this.angle = rand(0, Math.PI * 2);
      this.va = rand(-0.02, 0.02);
      this.hue = shape === "hex" ? 0 : shape === "sq" ? 15 : 350;
    }

    bodies.push(new Body(60, 60, 18, "circle"));
    bodies.push(new Body(140, 90, 16, "hex"));
    bodies.push(new Body(220, 50, 14, "sq"));
    bodies.push(new Body(180, 140, 15, "circle"));

    function getPos(e) {
      var rect = canvas.getBoundingClientRect();
      var clientX = e.touches ? e.touches[0].clientX : e.clientX;
      var clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return { x: clientX - rect.left, y: clientY - rect.top };
    }

    function hitTest(x, y) {
      for (var i = bodies.length - 1; i >= 0; i--) {
        var b = bodies[i];
        var dx = x - b.x;
        var dy = y - b.y;
        if (dx * dx + dy * dy <= (b.r + 6) * (b.r + 6)) return b;
      }
      return null;
    }

    function onDown(e) {
      e.preventDefault();
      var p = getPos(e);
      var b = hitTest(p.x, p.y);
      if (!b) return;
      drag = b;
      lastX = p.x;
      lastY = p.y;
      history = [{ x: p.x, y: p.y, t: Date.now() }];
      b.vx = 0;
      b.vy = 0;
    }

    function onMove(e) {
      if (!drag) return;
      var p = getPos(e);
      drag.x = p.x;
      drag.y = p.y;
      history.push({ x: p.x, y: p.y, t: Date.now() });
      if (history.length > 6) history.shift();
      lastX = p.x;
      lastY = p.y;
    }

    function onUp() {
      if (!drag) return;
      var h = history;
      if (h.length >= 2) {
        var a = h[h.length - 2];
        var b = h[h.length - 1];
        var dt = Math.max(b.t - a.t, 1);
        drag.vx = ((b.x - a.x) / dt) * 16;
        drag.vy = ((b.y - a.y) / dt) * 16;
      }
      drag = null;
      history = [];
    }

    canvas.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

    function resolve(a, b) {
      var dx = b.x - a.x;
      var dy = b.y - a.y;
      var dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
      var minDist = a.r + b.r;
      if (dist >= minDist) return;

      var nx = dx / dist;
      var ny = dy / dist;
      var overlap = minDist - dist;
      a.x -= nx * overlap * 0.5;
      a.y -= ny * overlap * 0.5;
      b.x += nx * overlap * 0.5;
      b.y += ny * overlap * 0.5;

      var dvx = a.vx - b.vx;
      var dvy = a.vy - b.vy;
      var vn = dvx * nx + dvy * ny;
      if (vn > 0) return;
      var restitution = 0.82;
      var impulse = (-(1 + restitution) * vn) / 2;
      a.vx -= impulse * nx;
      a.vy -= impulse * ny;
      b.vx += impulse * nx;
      b.vy += impulse * ny;
    }

    function drawBody(b) {
      var accent =
        getComputedStyle(document.documentElement).getPropertyValue("--color-accent").trim() ||
        "#BE3B40";
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.angle);
      ctx.shadowColor = accent;
      ctx.shadowBlur = 12;
      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.85;

      if (b.shape === "circle") {
        ctx.beginPath();
        ctx.arc(0, 0, b.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.35)";
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (b.shape === "sq") {
        ctx.fillRect(-b.r, -b.r, b.r * 2, b.r * 2);
      } else {
        ctx.beginPath();
        for (var i = 0; i < 6; i++) {
          var ang = (Math.PI / 3) * i;
          var px = Math.cos(ang) * b.r;
          var py = Math.sin(ang) * b.r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    function step() {
      ctx.clearRect(0, 0, W, H);

      ctx.strokeStyle = "rgba(190,59,64,0.12)";
      ctx.lineWidth = 1;
      for (var g = 0; g < W; g += 30) {
        ctx.beginPath();
        ctx.moveTo(g, 0);
        ctx.lineTo(g, H);
        ctx.stroke();
      }

      bodies.forEach(function (b) {
        if (b !== drag) {
          b.vy += 0.18;
          b.vx *= 0.995;
          b.vy *= 0.995;
          b.x += b.vx;
          b.y += b.vy;
          b.angle += b.va;

          if (b.x - b.r < 0) {
            b.x = b.r;
            b.vx *= -0.75;
          }
          if (b.x + b.r > W) {
            b.x = W - b.r;
            b.vx *= -0.75;
          }
          if (b.y - b.r < 0) {
            b.y = b.r;
            b.vy *= -0.75;
          }
          if (b.y + b.r > H) {
            b.y = H - b.r;
            b.vy *= -0.68;
            b.vx *= 0.92;
          }
        }
      });

      for (var i = 0; i < bodies.length; i++) {
        for (var j = i + 1; j < bodies.length; j++) {
          resolve(bodies[i], bodies[j]);
        }
      }

      bodies.forEach(drawBody);
      requestAnimationFrame(step);
    }

    step();
  }

  return { init: init, applyGlitch: applyGlitch };
})();

document.addEventListener("DOMContentLoaded", function () {
  Fx.init();
});
