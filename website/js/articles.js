/**
 * 文章列表页与详情页渲染
 * 依赖：posts.js、search.js、marked.js
 */

(function () {
  var listContainer = document.getElementById("article-list");
  var detailContainer = document.getElementById("article-detail");
  var filterContainer = document.getElementById("article-filters");
  var allPosts = [];
  var activeTag = "";

  if (!listContainer && !detailContainer) return;

  if (detailContainer) {
    Posts.loadAll()
      .then(function (posts) {
        renderDetail(posts);
      })
      .catch(handleError);
  } else {
    activeTag = getTagFromUrl();
    Posts.loadAll()
      .then(function (posts) {
        allPosts = posts;
        renderFilters(posts);
        renderList(getFilteredPosts());
      })
      .catch(handleError);

    document.addEventListener("article-search", function (e) {
      renderList(getFilteredPosts(e.detail.query));
    });
  }

  function getTagFromUrl() {
    return new URLSearchParams(window.location.search).get("tag") || "";
  }

  function getFilteredPosts(searchQuery) {
    var q =
      typeof searchQuery === "string"
        ? searchQuery
        : new URLSearchParams(window.location.search).get("q") || "";
    q = q.trim().toLowerCase();
    var posts = Search.filterPosts(allPosts, q);
    if (activeTag) {
      posts = posts.filter(function (post) {
        return (post.tags || []).indexOf(activeTag) !== -1;
      });
    }
    return posts;
  }

  function renderFilters(posts) {
    if (!filterContainer) return;

    var tagCounts = {};
    posts.forEach(function (post) {
      (post.tags || []).forEach(function (tag) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    var tags = Object.keys(tagCounts).sort(function (a, b) {
      if (a === "个人日记") return -1;
      if (b === "个人日记") return 1;
      return tagCounts[b] - tagCounts[a];
    });

    var chips = [
      renderFilterChip("全部", posts.length, !activeTag, "articles.html"),
    ].concat(
      tags.map(function (tag) {
        var href = "articles.html?tag=" + encodeURIComponent(tag);
        return renderFilterChip(tag, tagCounts[tag], activeTag === tag, href);
      })
    );

    filterContainer.innerHTML = chips.join("");
  }

  function renderFilterChip(label, count, isActive, href) {
    var cls = isActive
      ? "tag-filter tag-filter--active"
      : "tag-filter";
    return (
      '<a href="' +
      href +
      '" class="' +
      cls +
      '">' +
      Posts.escapeHtml(label) +
      ' <span class="tag-filter__count">' +
      count +
      "</span></a>"
    );
  }

  function renderList(posts) {
    var searchQuery = "";
    var input = document.querySelector(".search-input");
    if (input) searchQuery = input.value.trim();

    if (!posts.length) {
      var hint = activeTag
        ? "「" + activeTag + "」分类下"
        : searchQuery
          ? "「" + Posts.escapeHtml(searchQuery) + "」"
          : "";
      listContainer.innerHTML = hint
        ? '<p class="text-warm-muted text-center py-12">未找到匹配' +
          hint +
          "的文章</p>"
        : '<p class="text-warm-muted text-center py-12">暂无文章，请在 posts 文件夹中添加 .md 文件。</p>';
      return;
    }

    listContainer.innerHTML = posts.map(renderCard).join("");
  }

  function renderCard(post) {
    return (
      '<article class="article-card bg-warm-card rounded-2xl p-6 md:p-8 border border-warm-border">' +
      '<div class="flex flex-wrap items-center gap-3 mb-3">' +
      Posts.renderTagBadges(post.tags) +
      (post.date
        ? '<time class="text-sm text-warm-muted" datetime="' +
          post.date +
          '">' +
          Posts.formatDate(post.date) +
          "</time>"
        : "") +
      "</div>" +
      '<h2 class="text-xl font-semibold text-warm-dark mb-3">' +
      '<a href="article.html?slug=' +
      encodeURIComponent(post.slug) +
      '" class="hover:text-warm-accent transition-colors">' +
      Posts.escapeHtml(post.title) +
      "</a>" +
      "</h2>" +
      '<p class="text-warm-body leading-relaxed mb-4">' +
      Posts.escapeHtml(post.summary) +
      "</p>" +
      '<a href="article.html?slug=' +
      encodeURIComponent(post.slug) +
      '" class="inline-flex items-center text-sm font-medium text-warm-accent hover:text-warm-accent-dark transition-colors">' +
      "阅读全文" +
      '<svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>' +
      "</a>" +
      "</article>"
    );
  }

  function renderDetail(posts) {
    var params = new URLSearchParams(window.location.search);
    var slug = params.get("slug") || params.get("id");
    var post = posts.find(function (p) {
      return p.slug === slug;
    });

    if (!post) {
      detailContainer.innerHTML =
        '<div class="text-center py-16">' +
        '<p class="text-warm-muted mb-4">找不到这篇文章</p>' +
        '<a href="articles.html" class="text-warm-accent hover:underline">返回文章列表</a>' +
        "</div>";
      document.title = "文章未找到 — Jack";
      return;
    }

    document.title = post.title + " — Jack";

    detailContainer.innerHTML =
      '<header class="mb-8 pb-8 border-b border-warm-border">' +
      '<div class="flex flex-wrap items-center gap-3 mb-4">' +
      Posts.renderTagBadges(post.tags) +
      (post.date
        ? '<time class="text-sm text-warm-muted" datetime="' +
          post.date +
          '">' +
          Posts.formatDate(post.date) +
          "</time>"
        : "") +
      "</div>" +
      '<h1 class="text-2xl md:text-3xl font-bold text-warm-dark leading-snug">' +
      Posts.escapeHtml(post.title) +
      "</h1>" +
      "</header>" +
      '<div class="prose-content">' +
      post.html +
      "</div>" +
      '<div class="mt-12 pt-8 border-t border-warm-border">' +
      '<a href="articles.html" class="inline-flex items-center text-sm font-medium text-warm-accent hover:text-warm-accent-dark transition-colors">' +
      '<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>' +
      "返回文章列表" +
      "</a>" +
      "</div>";
  }

  function handleError(err) {
    var target = listContainer || detailContainer;
    target.innerHTML =
      '<p class="text-warm-muted text-center py-12">文章加载失败，请稍后再试。</p>';
    console.error(err);
  }
})();
