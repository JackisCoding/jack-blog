/**
 * 首页最新文章预览（支持搜索过滤）
 * 依赖：posts.js、search.js
 */

(function () {
  var container = document.getElementById("home-articles");
  if (!container) return;

  var allPosts = [];
  var sectionTitle = document.getElementById("home-articles-title");
  var viewAllLink = document.getElementById("home-view-all");

  Posts.loadAll()
    .then(function (posts) {
      allPosts = posts;
      render(getFilteredPosts(), "");
    })
    .catch(function (err) {
      container.innerHTML =
        '<p class="text-sm text-warm-muted text-center">文章加载失败</p>';
      console.error(err);
    });

  document.addEventListener("article-search", function (e) {
    render(Search.filterPosts(allPosts, e.detail.query), e.detail.query);
  });

  function getFilteredPosts() {
    var q = new URLSearchParams(window.location.search).get("q") || "";
    return Search.filterPosts(allPosts, q.trim().toLowerCase());
  }

  function render(posts, query) {
    var isSearching = Boolean(query);
    var displayPosts = isSearching ? posts : posts.slice(0, 3);

    if (sectionTitle) {
      sectionTitle.textContent = isSearching ? "搜索结果" : "最新文章";
    }
    if (viewAllLink) {
      viewAllLink.style.display = isSearching ? "none" : "";
    }

    if (!displayPosts.length) {
      container.innerHTML = query
        ? '<p class="text-sm text-warm-muted text-center">未找到匹配的文章</p>'
        : '<p class="text-sm text-warm-muted text-center">暂无文章</p>';
      return;
    }

    container.innerHTML = displayPosts.map(renderCard).join("");
  }

  function renderCard(post) {
    var tag =
      post.tags && post.tags.length
        ? '<span class="text-xs font-medium px-2 py-0.5 rounded-full bg-warm-accent/10 text-warm-accent">' +
          Posts.escapeHtml(post.tags[0]) +
          "</span>"
        : "";

    return (
      '<a href="article.html?slug=' +
      encodeURIComponent(post.slug) +
      '" class="article-card block bg-warm-card rounded-2xl p-6 border border-warm-border hover:no-underline">' +
      '<div class="flex items-center gap-3 mb-2">' +
      tag +
      (post.date
        ? '<time class="text-xs text-warm-muted">' +
          Posts.formatDate(post.date) +
          "</time>"
        : "") +
      "</div>" +
      '<h3 class="text-base font-semibold text-warm-dark mb-1">' +
      Posts.escapeHtml(post.title) +
      "</h3>" +
      '<p class="text-sm text-warm-muted line-clamp-2">' +
      Posts.escapeHtml(post.summary) +
      "</p>" +
      "</a>"
    );
  }
})();
