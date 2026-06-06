/**
 * 全站科技感动效：光标、网格光晕、代码雨、故障字、滚动视差
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
    initMemeBg();
  }

  /* 各页背景热梗 meme 小图 */
  var MEME_LAYOUTS = {
    index: [
      { src: "assets/memes/doge.jpg", left: "3%", top: "12%", size: 72, rotate: -14, float: "a", delay: 0 },
      { src: "assets/memes/stonks.svg", left: "88%", top: "8%", size: 64, rotate: 10, float: "b", delay: 1.1 },
      { src: "assets/memes/hachimi.svg", left: "82%", top: "52%", size: 58, rotate: 6, float: "c", delay: 0.5 },
      { src: "assets/memes/brainrot.svg", left: "2%", top: "58%", size: 56, rotate: -8, float: "b", delay: 1.8 },
      { src: "assets/memes/yyds.svg", left: "72%", top: "78%", size: 54, rotate: -5, float: "a", delay: 2.3 },
      { src: "assets/memes/nanbeng.svg", left: "8%", top: "78%", size: 52, rotate: 12, float: "c", delay: 0.9 },
      { src: "assets/memes/dian.svg", left: "45%", top: "6%", size: 50, rotate: -6, float: "b", delay: 1.5 },
      { src: "assets/memes/coffee.svg", left: "38%", top: "82%", size: 48, rotate: 8, float: "a", delay: 2.6 },
    ],
    about: [
      { src: "assets/memes/harold.svg", left: "4%", top: "18%", size: 66, rotate: -6, float: "c", delay: 0.3 },
      { src: "assets/memes/city.svg", left: "86%", top: "10%", size: 62, rotate: 12, float: "a", delay: 0.9 },
      { src: "assets/memes/zundujiadu.svg", left: "80%", top: "62%", size: 60, rotate: -10, float: "b", delay: 1.5 },
      { src: "assets/memes/this-is-fine.svg", left: "3%", top: "68%", size: 54, rotate: 8, float: "a", delay: 2.1 },
      { src: "assets/memes/emo.svg", left: "68%", top: "82%", size: 52, rotate: -4, float: "c", delay: 1.2 },
      { src: "assets/memes/hachimi.svg", left: "42%", top: "8%", size: 50, rotate: 5, float: "b", delay: 2.4 },
      { src: "assets/memes/mouse.svg", left: "18%", top: "42%", size: 48, rotate: -11, float: "a", delay: 0.7 },
      { src: "assets/memes/dian.svg", left: "52%", top: "75%", size: 46, rotate: 7, float: "c", delay: 1.8 },
    ],
    articles: [
      { src: "assets/memes/cat-table.svg", left: "3%", top: "14%", size: 68, rotate: -11, float: "b", delay: 0.2 },
      { src: "assets/memes/mouse.svg", left: "88%", top: "10%", size: 62, rotate: 9, float: "c", delay: 1 },
      { src: "assets/memes/distracted.svg", left: "84%", top: "58%", size: 58, rotate: -7, float: "a", delay: 1.6 },
      { src: "assets/memes/hachimi.svg", left: "2%", top: "65%", size: 56, rotate: 5, float: "b", delay: 0.7 },
      { src: "assets/memes/stonks.svg", left: "70%", top: "80%", size: 52, rotate: 10, float: "c", delay: 2.2 },
      { src: "assets/memes/nanbeng.svg", left: "12%", top: "38%", size: 50, rotate: -8, float: "a", delay: 1.3 },
      { src: "assets/memes/yyds.svg", left: "44%", top: "6%", size: 48, rotate: 6, float: "b", delay: 2.5 },
      { src: "assets/memes/coffee.svg", left: "40%", top: "78%", size: 46, rotate: -5, float: "c", delay: 0.5 },
    ],
    contact: [
      { src: "assets/memes/this-is-fine.svg", left: "5%", top: "16%", size: 64, rotate: -9, float: "a", delay: 0.4 },
      { src: "assets/memes/doge.jpg", left: "86%", top: "12%", size: 68, rotate: 11, float: "c", delay: 1.2 },
      { src: "assets/memes/harold.svg", left: "82%", top: "62%", size: 58, rotate: -5, float: "b", delay: 0.8 },
      { src: "assets/memes/city.svg", left: "3%", top: "65%", size: 60, rotate: 7, float: "a", delay: 1.9 },
      { src: "assets/memes/brainrot.svg", left: "68%", top: "78%", size: 52, rotate: -6, float: "c", delay: 2.1 },
      { src: "assets/memes/zundujiadu.svg", left: "38%", top: "8%", size: 50, rotate: 8, float: "b", delay: 1.6 },
      { src: "assets/memes/emo.svg", left: "22%", top: "40%", size: 48, rotate: -10, float: "a", delay: 0.3 },
      { src: "assets/memes/dian.svg", left: "48%", top: "76%", size: 46, rotate: 4, float: "c", delay: 2.4 },
    ],
    article: [
      { src: "assets/memes/mouse.svg", left: "4%", top: "20%", size: 60, rotate: -8, float: "c", delay: 0.6 },
      { src: "assets/memes/stonks.svg", left: "89%", top: "14%", size: 58, rotate: 10, float: "a", delay: 1.3 },
      { src: "assets/memes/zundujiadu.svg", left: "85%", top: "66%", size: 54, rotate: -6, float: "b", delay: 0.2 },
      { src: "assets/memes/brainrot.svg", left: "3%", top: "70%", size: 52, rotate: 4, float: "c", delay: 1.7 },
      { src: "assets/memes/nanbeng.svg", left: "72%", top: "82%", size: 50, rotate: -7, float: "a", delay: 2.3 },
      { src: "assets/memes/hachimi.svg", left: "40%", top: "6%", size: 48, rotate: 5, float: "b", delay: 1.1 },
      { src: "assets/memes/coffee.svg", left: "16%", top: "44%", size: 46, rotate: 9, float: "c", delay: 2.6 },
      { src: "assets/memes/yyds.svg", left: "46%", top: "80%", size: 44, rotate: -4, float: "a", delay: 0.9 },
    ],
  };

  function getMemePageKey() {
    var path = window.location.pathname.toLowerCase();
    if (path.indexOf("about") !== -1) return "about";
    if (path.indexOf("articles.html") !== -1 || /\/articles\/?$/.test(path)) return "articles";
    if (path.indexOf("contact") !== -1) return "contact";
    if (path.indexOf("article.html") !== -1 || path.indexOf("/posts/") !== -1) return "article";
    return "index";
  }

  function initMemeBg() {
    var mobile = window.matchMedia("(max-width: 767px)").matches;
    var pageKey = getMemePageKey();
    var layout = MEME_LAYOUTS[pageKey] || MEME_LAYOUTS.index;
    var items = mobile ? layout.slice(0, 4) : layout;

    var wrap = document.createElement("div");
    wrap.className = "fx-meme-bg";
    wrap.setAttribute("aria-hidden", "true");

    items.forEach(function (item) {
      var img = document.createElement("img");
      img.className = "fx-meme fx-meme--float-" + item.float;
      img.src = item.src;
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";
      img.draggable = false;
      var size = mobile ? Math.round(item.size * 0.82) : item.size;
      img.style.left = item.left;
      img.style.top = item.top;
      img.style.width = size + "px";
      img.style.height = size + "px";
      img.style.setProperty("--meme-rot", item.rotate + "deg");
      img.style.setProperty("--meme-delay", item.delay + "s");
      wrap.appendChild(img);
    });

    document.body.prepend(wrap);
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
        "a, button, input, textarea, select, label, .btn-primary, .btn-outline-light, .theme-toggle, .tag-filter, .social-link, .article-card"
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

  return { init: init, applyGlitch: applyGlitch };
})();

document.addEventListener("DOMContentLoaded", function () {
  Fx.init();
});
