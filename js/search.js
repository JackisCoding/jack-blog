/**
 * 文章搜索：标题 + 摘要，实时过滤
 */
var Search = (function () {
  function filterPosts(posts, query) {
    if (!query) return posts;
    var q = query.toLowerCase();
    return posts.filter(function (post) {
      var title = (post.title || "").toLowerCase();
      var summary = (post.summary || "").toLowerCase();
      return title.indexOf(q) !== -1 || summary.indexOf(q) !== -1;
    });
  }

  function getQueryFromUrl() {
    return new URLSearchParams(window.location.search).get("q") || "";
  }

  function syncInputs(value) {
    document.querySelectorAll(".search-input").forEach(function (input) {
      if (input.value !== value) input.value = value;
    });
  }

  function dispatchSearch(query) {
    document.dispatchEvent(
      new CustomEvent("article-search", { detail: { query: query } })
    );
  }

  function init() {
    var inputs = document.querySelectorAll(".search-input");
    if (!inputs.length) return;

    var initial = getQueryFromUrl();
    if (initial) {
      syncInputs(initial);
      dispatchSearch(initial.trim().toLowerCase());
    }

    inputs.forEach(function (input) {
      input.addEventListener("input", function () {
        var query = input.value.trim().toLowerCase();
        syncInputs(input.value);
        dispatchSearch(query);
      });

      input.addEventListener("keydown", function (e) {
        if (e.key !== "Enter") return;
        var q = input.value.trim();
        var onListPage =
          document.getElementById("article-list") ||
          document.getElementById("home-articles");
        if (!onListPage && q) {
          window.location.href =
            "articles.html?q=" + encodeURIComponent(q);
        }
      });
    });
  }

  return { filterPosts: filterPosts, init: init };
})();
