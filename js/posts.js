/**
 * Markdown 文章加载与解析模块
 * 依赖：marked.js（Markdown 渲染）
 */
var Posts = (function () {
  var POSTS_DIR = "posts/";

  /**
   * 加载 manifest 并获取全部文章（含正文 Markdown）
   */
  function loadAll() {
    return fetch(POSTS_DIR + "manifest.json")
      .then(function (res) {
        if (!res.ok) throw new Error("无法加载文章索引");
        return res.json();
      })
      .then(function (files) {
        return Promise.all(
          files.map(function (file) {
            return loadOne(file);
          })
        );
      })
      .then(function (posts) {
        return posts.sort(function (a, b) {
          return new Date(b.date) - new Date(a.date);
        });
      });
  }

  /**
   * 根据 slug 加载单篇文章
   */
  function loadBySlug(slug) {
    return loadOne(slug + ".md");
  }

  /**
   * 加载并解析单个 .md 文件
   */
  function loadOne(filename) {
    return fetch(POSTS_DIR + filename)
      .then(function (res) {
        if (!res.ok) throw new Error("无法加载文章: " + filename);
        return res.text();
      })
      .then(function (text) {
        return parse(text, filename);
      });
  }

  /**
   * 解析 frontmatter + Markdown 正文
   */
  function parse(text, filename) {
    var slug = filename.replace(/\.md$/, "");
    var match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);

    if (!match) {
      return {
        slug: slug,
        title: slug,
        date: "",
        tags: [],
        summary: "",
        body: text,
        html: renderMarkdown(text),
      };
    }

    var meta = parseFrontmatter(match[1]);
    var body = match[2].trim();

    return {
      slug: slug,
      title: meta.title || slug,
      date: meta.date || "",
      tags: meta.tags || [],
      summary: meta.summary || extractSummary(body),
      body: body,
      html: renderMarkdown(body),
    };
  }

  /**
   * 简易 frontmatter 解析（支持 title / date / tags / summary）
   */
  function parseFrontmatter(raw) {
    var meta = {};
    raw.split("\n").forEach(function (line) {
      var idx = line.indexOf(":");
      if (idx === -1) return;
      var key = line.slice(0, idx).trim();
      var value = line.slice(idx + 1).trim();
      if (key === "tags") {
        meta.tags = value.split(",").map(function (t) {
          return t.trim();
        }).filter(Boolean);
      } else {
        meta[key] = value;
      }
    });
    return meta;
  }

  /**
   * 从正文提取摘要（取首段非空文本，最多 120 字）
   */
  function extractSummary(body) {
    var paragraph = body
      .replace(/^#+\s.+$/gm, "")
      .replace(/^>\s.+$/gm, "")
      .split("\n")
      .map(function (line) {
        return line.trim();
      })
      .filter(Boolean)[0] || "";

    return paragraph.length > 120 ? paragraph.slice(0, 120) + "…" : paragraph;
  }

  /**
   * 使用 marked.js 渲染 Markdown
   */
  function renderMarkdown(md) {
    if (typeof marked === "undefined") {
      console.error("marked.js 未加载");
      return escapeHtml(md);
    }
    return marked.parse(md);
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function formatDate(dateStr) {
    if (!dateStr) return "";
    var date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function renderTagBadges(tags) {
    if (!tags || !tags.length) return "";
    return tags
      .map(function (tag) {
        return (
          '<span class="text-xs font-medium px-2.5 py-1 rounded-full bg-warm-accent/10 text-warm-accent">' +
          escapeHtml(tag) +
          "</span>"
        );
      })
      .join("");
  }

  return {
    loadAll: loadAll,
    loadBySlug: loadBySlug,
    loadOne: loadOne,
    parse: parse,
    formatDate: formatDate,
    escapeHtml: escapeHtml,
    renderTagBadges: renderTagBadges,
  };
})();
