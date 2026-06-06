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
  var cursorReady = false;

  function init() {
    if (reduced) return;

    document.documentElement.classList.add("fx-enhanced");
    initGridAndGlow();
    initBackgroundDecor();
    initGlitchText();
    initScrollReveal();
    initParallax();

    if (desktop && !touch) {
      initCursor();
    }
    initPhysics();

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
        revealCursor();
        updateCursorPosition();
      },
      { passive: true }
    );
  }

  function revealCursor() {
    if (cursorReady || !cursorDot || !cursorRing) return;
    cursorReady = true;
    cursorDot.classList.add("fx-cursor-visible");
    cursorRing.classList.add("fx-cursor-visible");
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

  /* ===== 背景装饰：极光 / 粒子 / 扫描线 / 几何体 ===== */
  function initBackgroundDecor() {
    var wrap = document.createElement("div");
    wrap.className = "fx-bg-decor";
    wrap.setAttribute("aria-hidden", "true");
    wrap.innerHTML =
      '<div class="fx-aurora">' +
      '<div class="fx-aurora__blob fx-aurora__blob--1"></div>' +
      '<div class="fx-aurora__blob fx-aurora__blob--2"></div>' +
      '<div class="fx-aurora__blob fx-aurora__blob--3"></div>' +
      "</div>" +
      '<div class="fx-scanline"></div>' +
      '<div class="fx-shapes">' +
      '<span class="fx-shape fx-shape--ring"></span>' +
      '<span class="fx-shape fx-shape--hex"></span>' +
      '<span class="fx-shape fx-shape--cross"></span>' +
      '<span class="fx-shape fx-shape--dot"></span>' +
      '<span class="fx-shape fx-shape--tri"></span>' +
      "</div>";

    document.body.prepend(wrap);
    initParticleField();
    initStickFight();
  }

  function getGridCell() {
    return window.matchMedia("(max-width: 767px)").matches ? 32 : 44;
  }

  /* 火柴小人自动对打：高约 2.5 格网格 */
  function initStickFight() {
    var canvas = document.createElement("canvas");
    canvas.className = "fx-stickfight";
    canvas.setAttribute("aria-hidden", "true");
    document.body.prepend(canvas);

    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var seqIndex = 0;
    var seqFrame = 0;
    var running = true;

    var POSES = {
      guard: {
        torsoX: 0,
        armL: { x: -0.26, y: -0.12 },
        armR: { x: 0.26, y: -0.12 },
        legL: { x: -0.17, y: 0.4 },
        legR: { x: 0.14, y: 0.4 },
      },
      jab: {
        torsoX: 0.07,
        armL: { x: -0.22, y: -0.1 },
        armR: { x: 0.58, y: -0.22 },
        legL: { x: -0.19, y: 0.4 },
        legR: { x: 0.11, y: 0.4 },
      },
      hook: {
        torsoX: 0.05,
        armL: { x: -0.2, y: -0.08 },
        armR: { x: 0.42, y: -0.38 },
        legL: { x: -0.2, y: 0.4 },
        legR: { x: 0.1, y: 0.4 },
      },
      kick: {
        torsoX: -0.06,
        armL: { x: -0.3, y: -0.08 },
        armR: { x: 0.22, y: -0.02 },
        legL: { x: -0.14, y: 0.4 },
        legR: { x: 0.52, y: -0.08 },
      },
      hurt: {
        torsoX: -0.1,
        armL: { x: -0.38, y: -0.32 },
        armR: { x: 0.18, y: -0.28 },
        legL: { x: -0.2, y: 0.36 },
        legR: { x: 0.16, y: 0.38 },
      },
      block: {
        torsoX: -0.03,
        armL: { x: -0.18, y: -0.32 },
        armR: { x: 0.18, y: -0.32 },
        legL: { x: -0.17, y: 0.4 },
        legR: { x: 0.14, y: 0.4 },
      },
    };

    var SEQUENCE = [
      { a: "guard", b: "guard", t: 16 },
      { a: "jab", b: "guard", t: 5 },
      { a: "guard", b: "hurt", t: 7 },
      { a: "guard", b: "guard", t: 10 },
      { a: "guard", b: "jab", t: 5 },
      { a: "hurt", b: "guard", t: 7 },
      { a: "guard", b: "hook", t: 6 },
      { a: "hurt", b: "guard", t: 7 },
      { a: "kick", b: "block", t: 7 },
      { a: "guard", b: "guard", t: 8 },
      { a: "guard", b: "kick", t: 7 },
      { a: "block", b: "guard", t: 7 },
      { a: "hook", b: "hurt", t: 6 },
      { a: "guard", b: "guard", t: 12 },
    ];

    function limb(ctx, x0, y0, end, s) {
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x0 + end.x * s, y0 + end.y * s);
      ctx.stroke();
    }

    function drawStickFigure(ctx, baseX, baseY, s, facing, pose, rgb) {
      ctx.save();
      ctx.translate(baseX, baseY);
      ctx.scale(facing, 1);

      var headR = s * 0.1;
      var torsoLen = s * 0.34;
      var neckY = -torsoLen;
      var headY = neckY - headR * 1.15;
      var shY = neckY + torsoLen * 0.12;
      var hipX = pose.torsoX * s;

      ctx.strokeStyle = "rgb(" + rgb + ")";
      ctx.lineWidth = Math.max(1.5, s * 0.042);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.beginPath();
      ctx.arc(0, headY, headR, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, neckY);
      ctx.lineTo(hipX, 0);
      ctx.stroke();

      limb(ctx, 0, shY, pose.armL, s);
      limb(ctx, 0, shY, pose.armR, s);
      limb(ctx, hipX, 0, pose.legL, s);
      limb(ctx, hipX, 0, pose.legR, s);

      ctx.restore();
    }

    function drawImpact(ctx, x, y, s, alpha) {
      if (alpha <= 0) return;
      var rgb = getAccentRgb();
      ctx.strokeStyle = "rgba(" + rgb + ", " + alpha + ")";
      ctx.lineWidth = 1.2;
      var r = s * 0.12;
      for (var i = 0; i < 4; i++) {
        var ang = (Math.PI / 2) * i + seqFrame * 0.4;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(ang) * r * 0.4, y + Math.sin(ang) * r * 0.4);
        ctx.lineTo(x + Math.cos(ang) * r, y + Math.sin(ang) * r);
        ctx.stroke();
      }
    }

    function isHitPose(name) {
      return name === "hurt";
    }

    function step() {
      if (!running) return;

      var cell = getGridCell();
      var figureH = cell * 2.5;
      var arenaW = Math.ceil(cell * 5.2);
      var arenaH = Math.ceil(cell * 3.5);

      canvas.width = Math.ceil(arenaW * dpr);
      canvas.height = Math.ceil(arenaH * dpr);
      canvas.style.width = arenaW + "px";
      canvas.style.height = arenaH + "px";

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, arenaW, arenaH);

      var stepDef = SEQUENCE[seqIndex];
      var poseA = POSES[stepDef.a];
      var poseB = POSES[stepDef.b];
      var rgb = getAccentRgb();
      var rgbB = getAccentRgb();

      var groundY = arenaH - cell * 1.12;
      var ax = cell * 1.15;
      var bx = arenaW - cell * 1.15;
      var midX = arenaW * 0.5;

      drawStickFigure(ctx, ax, groundY, figureH, 1, poseA, rgb);
      drawStickFigure(ctx, bx, groundY, figureH, -1, poseB, rgbB);

      if (seqFrame < 4 && (isHitPose(stepDef.a) || isHitPose(stepDef.b))) {
        var hitX = isHitPose(stepDef.b) ? bx - cell * 0.35 : ax + cell * 0.35;
        drawImpact(ctx, hitX, groundY - figureH * 0.55, figureH, 0.85 - seqFrame * 0.2);
      } else if (
        seqFrame >= 3 &&
        seqFrame <= 5 &&
        (stepDef.a === "jab" || stepDef.a === "hook" || stepDef.a === "kick")
      ) {
        drawImpact(ctx, midX, groundY - figureH * 0.5, figureH, 0.55);
      } else if (
        seqFrame >= 3 &&
        seqFrame <= 5 &&
        (stepDef.b === "jab" || stepDef.b === "hook" || stepDef.b === "kick")
      ) {
        drawImpact(ctx, midX, groundY - figureH * 0.5, figureH, 0.55);
      }

      seqFrame++;
      if (seqFrame >= stepDef.t) {
        seqFrame = 0;
        seqIndex = (seqIndex + 1) % SEQUENCE.length;
      }

      requestAnimationFrame(step);
    }

    step();

    document.addEventListener("visibilitychange", function () {
      running = !document.hidden;
      if (running) step();
    });
  }

  function getAccentRgb() {
    var dark = document.documentElement.getAttribute("data-theme") === "dark";
    return dark ? "220, 66, 71" : "190, 59, 64";
  }

  function initParticleField() {
    var canvas = document.createElement("canvas");
    canvas.className = "fx-particles";
    canvas.setAttribute("aria-hidden", "true");
    document.body.prepend(canvas);

    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var particles = [];
    var count = desktop ? 52 : 28;
    var linkDist = desktop ? 140 : 110;
    var running = true;
    var w = 0;
    var h = 0;

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    }

    function seed() {
      particles = [];
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.55,
          vy: (Math.random() - 0.5) * 0.55,
          r: Math.random() * 1.8 + 0.8,
          pulse: Math.random() * Math.PI * 2,
        });
      }
    }

    function step() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      var rgb = getAccentRgb();

      particles.forEach(function (p) {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.02;

        if (p.x <= 0 || p.x >= w) p.vx *= -1;
        if (p.y <= 0 || p.y >= h) p.vy *= -1;

        if (!touch && cursorReady) {
          var dx = p.x - mx;
          var dy = p.y - my;
          var dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (dist < 160) {
            var force = (160 - dist) / 160 * 0.35;
            p.x += (dx / dist) * force;
            p.y += (dy / dist) * force;
          }
        }
      });

      for (var i = 0; i < particles.length; i++) {
        for (var j = i + 1; j < particles.length; j++) {
          var a = particles[i];
          var b = particles[j];
          var dx = a.x - b.x;
          var dy = a.y - b.y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < linkDist) {
            ctx.strokeStyle = "rgba(" + rgb + ", " + (1 - d / linkDist) * 0.22 + ")";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      particles.forEach(function (p) {
        var glow = 0.45 + Math.sin(p.pulse) * 0.25;
        ctx.fillStyle = "rgba(" + rgb + ", " + glow + ")";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(step);
    }

    resize();
    seed();
    step();
    window.addEventListener("resize", function () {
      resize();
      seed();
    });

    document.addEventListener("visibilitychange", function () {
      running = !document.hidden;
      if (running) step();
    });
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
    if (typeof e.clientX === "number" && typeof e.clientY === "number") {
      mx = e.clientX;
      my = e.clientY;
      revealCursor();
      updateCursorPosition();
    }
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
    label.textContent = touch ? "手指拖拽" : "拖拽 · 抛出";

    var canvas = document.createElement("canvas");
    wrap.appendChild(label);
    wrap.appendChild(canvas);
    document.body.appendChild(wrap);

    var ctx = canvas.getContext("2d");
    var W = 300;
    var H = 200;

    function layoutPhysics() {
      var mobile = window.matchMedia("(max-width: 767px)").matches;
      W = mobile ? 220 : 300;
      H = mobile ? 148 : 200;
      canvas.width = W;
      canvas.height = H;
    }

    layoutPhysics();
    window.addEventListener("resize", layoutPhysics);

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
    canvas.addEventListener("touchstart", onDown, { passive: false });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
    window.addEventListener("touchcancel", onUp);

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
