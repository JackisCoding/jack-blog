/**
 * 全站公共脚本：导航高亮、移动端菜单、主题与搜索初始化
 */

(function () {
  var currentPage = window.location.pathname.split("/").pop() || "index.html";

  document.querySelectorAll(".nav-link").forEach(function (link) {
    var href = link.getAttribute("href");
    if (href === currentPage || (currentPage === "" && href === "index.html")) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });

  var menuBtn = document.getElementById("menu-btn");
  var mobileMenu = document.getElementById("mobile-menu");

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", function () {
      var isOpen = mobileMenu.classList.contains("open-menu");
      mobileMenu.classList.toggle("hidden-menu", isOpen);
      mobileMenu.classList.toggle("open-menu", !isOpen);
      menuBtn.setAttribute("aria-expanded", String(!isOpen));
      syncHeaderOffset();
    });

    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobileMenu.classList.add("hidden-menu");
        mobileMenu.classList.remove("open-menu");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  var yearEl = document.getElementById("current-year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  syncHeaderOffset();
  window.addEventListener("resize", syncHeaderOffset);
  window.addEventListener("orientationchange", syncHeaderOffset);

  Theme.init();
  Search.init();

  function syncHeaderOffset() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    document.documentElement.style.setProperty(
      "--site-header-h",
      header.offsetHeight + "px"
    );
  }
})();
