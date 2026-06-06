/**
 * 深色 / 浅色主题切换，偏好存入 localStorage
 */
var Theme = (function () {
  var STORAGE_KEY = "blog-theme";

  function getPreferred() {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function apply(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }

  function toggle() {
    var current = document.documentElement.getAttribute("data-theme") || "light";
    var next = current === "dark" ? "light" : "dark";

    document.documentElement.classList.add("theme-animate");
    apply(next);

    window.setTimeout(function () {
      document.documentElement.classList.remove("theme-animate");
    }, 400);
  }

  function init() {
    apply(getPreferred());

    var btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.addEventListener("click", toggle);
    }
  }

  return { init: init, toggle: toggle, apply: apply };
})();
