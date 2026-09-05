/* ==========================================================================
   Kypedia — renderer
   --------------------------------------------------------------------------
   Reads window.KYPEDIA (library.js) and fills in every element carrying a
   data-kp-render hook. Pages stay declarative: they mark a slot and the
   renderer decides what goes in it, so adding an entry to the registry
   updates the home page, the browse page, and the tag indexes at once.

   Hooks (data-kp-render="…"):
     site-name | site-tagline | site-blurb | year
     stats              library totals
     featured           the entry flagged featured: true
     collections        card grid of collections      [data-kp-limit]
     nav-collections    sidebar list of collections
     recent             entries by updated date       [data-kp-limit]
     entries            filtered list  [data-kp-collection|tag|status|limit]
     tags               tag cloud      [data-kp-facet] [data-kp-limit]
     facet-legend       facets with their tags, grouped
     status-legend      status definitions
     browse             the full URL-driven browse listing
     article-meta       metadata strip for the current article
     article-tags       collection + tag footer for the current article
     article-related    "related entries" list for the current article

   Relative paths are resolved against data-kp-root on <html> (default "").
   Pages inside articles/ set data-kp-root="../".
   ========================================================================== */

(function () {
  "use strict";

  var DATA = window.KYPEDIA;
  if (!DATA) {
    console.error("[kypedia] library.js did not load; listings will be empty.");
    return;
  }

  var ROOT = document.documentElement.getAttribute("data-kp-root") || "";
  var STATUS_ORDER = Object.keys(DATA.statuses);

  /* ------------------------------------------------------------- helpers -- */

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[ch];
    });
  }

  function href(path) {
    return esc(ROOT + path);
  }

  function collection(id) {
    for (var i = 0; i < DATA.collections.length; i += 1) {
      if (DATA.collections[i].id === id) return DATA.collections[i];
    }
    return null;
  }

  function tagInfo(id) {
    var declared = DATA.tags[id];
    if (declared) return declared;
    return {
      label: id.replace(/-/g, " ").replace(/^./, function (c) {
        return c.toUpperCase();
      }),
      facet: "subject",
      undeclared: true,
    };
  }

  function statusInfo(id) {
    return DATA.statuses[id] || { label: id, blurb: "" };
  }

  function kindLabel(id) {
    return (DATA.kinds[id] && DATA.kinds[id].label) || id || "Entry";
  }

  function sortKey(title) {
    return String(title)
      .toLowerCase()
      .replace(/[“”"'’‘]/g, "")
      .replace(/^(a|an|the)\s+/, "");
  }

  function formatDate(iso) {
    if (!iso) return "";
    var parts = String(iso).split("-");
    var date = new Date(Date.UTC(+parts[0], (+parts[1] || 1) - 1, +parts[2] || 1));
    if (isNaN(date.getTime())) return esc(iso);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  }

  function words(entry) {
    if (!entry.words) return "";
    if (entry.words < 1000) return entry.words + " words";
    return Math.round(entry.words / 100) / 10 + "k words";
  }

  var entries = (DATA.entries || []).slice();

  function byUpdated(a, b) {
    return String(b.updated || "").localeCompare(String(a.updated || ""));
  }

  function byTitle(a, b) {
    return sortKey(a.title) < sortKey(b.title) ? -1 : 1;
  }

  function tagCounts() {
    var counts = {};
    entries.forEach(function (entry) {
      (entry.tags || []).forEach(function (tag) {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return counts;
  }

  function collectionCount(id) {
    return entries.filter(function (entry) {
      return entry.collection === id;
    }).length;
  }

  /* ------------------------------------------------------- validation ---- */
  /* Loud in the console, silent on the page: a mistyped tag or collection is
     an authoring bug, not something a reader should have to see. */

  function validate() {
    var problems = [];
    var seen = {};
    entries.forEach(function (entry) {
      var where = 'entry "' + (entry.slug || entry.title || "?") + '"';
      ["slug", "title", "path", "collection", "kind", "status", "summary", "updated"].forEach(
        function (field) {
          if (!entry[field]) problems.push(where + ": missing " + field);
        }
      );
      if (seen[entry.slug]) problems.push(where + ": duplicate slug");
      seen[entry.slug] = true;
      if (entry.collection && !collection(entry.collection)) {
        problems.push(where + ': unknown collection "' + entry.collection + '"');
      }
      if (entry.status && !DATA.statuses[entry.status]) {
        problems.push(where + ': unknown status "' + entry.status + '"');
      }
      if (entry.kind && !DATA.kinds[entry.kind]) {
        problems.push(where + ': unknown kind "' + entry.kind + '"');
      }
      (entry.tags || []).forEach(function (tag) {
        if (!DATA.tags[tag]) {
          problems.push(where + ': tag "' + tag + '" is not in the vocabulary');
        }
      });
      (entry.related || []).forEach(function (slug) {
        if (!seen[slug] && !entries.some(function (e) { return e.slug === slug; })) {
          problems.push(where + ': related slug "' + slug + '" does not exist');
        }
      });
    });
    Object.keys(DATA.tags).forEach(function (tag) {
      var info = DATA.tags[tag];
      if (!DATA.facets[info.facet]) {
        problems.push('tag "' + tag + '": unknown facet "' + info.facet + '"');
      }
    });
    if (problems.length) {
      console.warn(
        "[kypedia] registry problems (see AGENTS.md):\n - " + problems.join("\n - ")
      );
    }
    return problems;
  }

  /* --------------------------------------------------------- components -- */

  function badge(status) {
    return (
      '<span class="k-badge k-badge-' +
      esc(status) +
      '">' +
      esc(statusInfo(status).label) +
      "</span>"
    );
  }

  function chip(tag, counts, current) {
    var info = tagInfo(tag);
    var count = counts && counts[tag];
    return (
      '<a class="k-chip' +
      (current === tag ? " is-current" : "") +
      '" href="' +
      href("browse.html?tag=" + encodeURIComponent(tag)) +
      '">' +
      esc(info.label) +
      (count ? ' <span class="k-chip-count">' + count + "</span>" : "") +
      "</a>"
    );
  }

  function entryLine(entry, options) {
    var opts = options || {};
    var col = collection(entry.collection);
    var meta = [];
    if (opts.showCollection !== false && col) {
      meta.push(
        '<a href="' +
          href("browse.html?collection=" + encodeURIComponent(col.id)) +
          '">' +
          esc(col.title) +
          "</a>"
      );
    }
    meta.push(esc(kindLabel(entry.kind)));
    if (words(entry)) meta.push(esc(words(entry)));
    if (opts.showDate !== false && entry.updated) {
      meta.push("updated " + formatDate(entry.updated));
    }

    return (
      "<li>" +
      '<a class="k-list-title" href="' +
      href(entry.path) +
      '">' +
      esc(entry.title) +
      "</a> " +
      badge(entry.status) +
      '<span class="k-list-meta">' +
      meta.join(" · ") +
      "</span>" +
      (opts.showSummary === false
        ? ""
        : '<span class="k-list-summary">' + esc(entry.summary) + "</span>") +
      "</li>"
    );
  }

  function entryList(list, options) {
    if (!list.length) {
      return '<p class="k-empty">' + esc((options && options.empty) || "No entries yet.") + "</p>";
    }
    return (
      '<ul class="k-list">' +
      list
        .map(function (entry) {
          return entryLine(entry, options);
        })
        .join("") +
      "</ul>"
    );
  }

  /* ------------------------------------------------------------ renderers -- */

  var renderers = {
    "site-name": function () {
      return esc(DATA.site.name);
    },

    "site-tagline": function () {
      return esc(DATA.site.tagline);
    },

    "site-blurb": function () {
      return esc(DATA.site.blurb);
    },

    year: function () {
      return String(new Date().getFullYear());
    },

    stats: function () {
      var counts = tagCounts();
      var filled = DATA.collections.filter(function (col) {
        return collectionCount(col.id) > 0;
      }).length;
      var totalWords = entries.reduce(function (sum, entry) {
        return sum + (entry.words || 0);
      }, 0);
      var newest = entries.slice().sort(byUpdated)[0];
      var bits = [
        "<span><b>" + entries.length + "</b> " + (entries.length === 1 ? "entry" : "entries") + "</span>",
        "<span><b>" + filled + "</b> of " + DATA.collections.length + " collections in use</span>",
        "<span><b>" + Object.keys(counts).length + "</b> tags in play</span>",
      ];
      if (totalWords) {
        bits.push("<span><b>" + Math.round(totalWords / 1000) + "k</b> words</span>");
      }
      if (newest) {
        bits.push("<span>last updated " + formatDate(newest.updated) + "</span>");
      }
      return bits.join("");
    },

    featured: function () {
      var pick =
        entries.filter(function (entry) {
          return entry.featured;
        })[0] || entries.slice().sort(byUpdated)[0];
      if (!pick) return '<p class="k-empty">Nothing featured yet.</p>';
      var col = collection(pick.collection);
      return (
        '<p class="k-featured-title"><a href="' +
        href(pick.path) +
        '">' +
        esc(pick.title) +
        "</a> " +
        badge(pick.status) +
        "</p>" +
        '<p class="k-featured-excerpt">' +
        esc(pick.summary) +
        "</p>" +
        '<p class="k-featured-foot">' +
        (col ? esc(col.title) + " · " : "") +
        esc(kindLabel(pick.kind)) +
        (words(pick) ? " · " + esc(words(pick)) : "") +
        ' · <a href="' +
        href(pick.path) +
        '">Read the entry</a></p>'
      );
    },

    collections: function (el) {
      var limit = +el.getAttribute("data-kp-limit") || DATA.collections.length;
      return (
        '<div class="k-grid">' +
        DATA.collections
          .slice(0, limit)
          .map(function (col) {
            var count = collectionCount(col.id);
            return (
              '<a class="k-card" href="' +
              href("browse.html?collection=" + encodeURIComponent(col.id)) +
              '">' +
              '<span class="k-card-mark" aria-hidden="true">' +
              esc(col.mark || col.title.charAt(0)) +
              "</span>" +
              '<span class="k-card-body">' +
              '<span class="k-card-title">' +
              esc(col.title) +
              "</span>" +
              '<span class="k-card-blurb">' +
              esc(col.blurb) +
              "</span>" +
              '<span class="k-card-count">' +
              (count
                ? count + (count === 1 ? " entry" : " entries")
                : "open — no entries yet") +
              "</span>" +
              "</span>" +
              "</a>"
            );
          })
          .join("") +
        "</div>"
      );
    },

    "nav-collections": function () {
      return DATA.collections
        .map(function (col) {
          var count = collectionCount(col.id);
          return (
            '<li><a href="' +
            href("browse.html?collection=" + encodeURIComponent(col.id)) +
            '">' +
            esc(col.title) +
            "</a>" +
            (count ? " <small>(" + count + ")</small>" : "") +
            "</li>"
          );
        })
        .join("");
    },

    recent: function (el) {
      var limit = +el.getAttribute("data-kp-limit") || 5;
      return entryList(entries.slice().sort(byUpdated).slice(0, limit), {
        showSummary: el.getAttribute("data-kp-summary") !== "false",
        empty: "Nothing written yet. The first entry goes in articles/.",
      });
    },

    entries: function (el) {
      var wanted = {
        collection: el.getAttribute("data-kp-collection"),
        tag: el.getAttribute("data-kp-tag"),
        status: el.getAttribute("data-kp-status"),
      };
      var limit = +el.getAttribute("data-kp-limit") || Infinity;
      var list = entries.filter(function (entry) {
        if (wanted.collection && entry.collection !== wanted.collection) return false;
        if (wanted.status && entry.status !== wanted.status) return false;
        if (wanted.tag && (entry.tags || []).indexOf(wanted.tag) === -1) return false;
        return true;
      });
      var sorted =
        el.getAttribute("data-kp-sort") === "title"
          ? list.sort(byTitle)
          : list.sort(byUpdated);
      return entryList(sorted.slice(0, limit), {
        showSummary: el.getAttribute("data-kp-summary") !== "false",
        empty: el.getAttribute("data-kp-empty") || "No entries yet.",
      });
    },

    tags: function (el) {
      var counts = tagCounts();
      var facet = el.getAttribute("data-kp-facet");
      var limit = +el.getAttribute("data-kp-limit") || Infinity;
      var used = Object.keys(counts)
        .filter(function (tag) {
          return !facet || tagInfo(tag).facet === facet;
        })
        .sort(function (a, b) {
          return counts[b] - counts[a] || (sortKey(tagInfo(a).label) < sortKey(tagInfo(b).label) ? -1 : 1);
        })
        .slice(0, limit);
      if (!used.length) return '<p class="k-empty">No tags in use yet.</p>';
      return used
        .map(function (tag) {
          return chip(tag, counts);
        })
        .join("");
    },

    "facet-legend": function () {
      var counts = tagCounts();
      return Object.keys(DATA.facets)
        .map(function (id) {
          var facet = DATA.facets[id];
          var tags = Object.keys(DATA.tags)
            .filter(function (tag) {
              return DATA.tags[tag].facet === id;
            })
            .sort(function (a, b) {
              return sortKey(DATA.tags[a].label) < sortKey(DATA.tags[b].label) ? -1 : 1;
            });
          return (
            '<div class="k-facet">' +
            '<span class="k-facet-label">' +
            esc(facet.label) +
            ' <span class="k-facet-hint">' +
            esc(facet.blurb) +
            "</span></span>" +
            (tags.length
              ? tags
                  .map(function (tag) {
                    return chip(tag, counts);
                  })
                  .join("")
              : '<span class="k-empty">none defined</span>') +
            "</div>"
          );
        })
        .join("");
    },

    "status-legend": function () {
      return (
        '<dl class="k-dl">' +
        STATUS_ORDER.map(function (id) {
          var info = DATA.statuses[id];
          return "<dt>" + badge(id) + "</dt><dd>" + esc(info.blurb) + "</dd>";
        }).join("") +
        "</dl>"
      );
    },

    browse: function (el) {
      return browse(el);
    },

    "article-meta": function () {
      var entry = current();
      if (!entry) return "";
      var bits = [
        "<span><b>Status</b> " + badge(entry.status) + "</span>",
        "<span><b>Kind</b> " + esc(kindLabel(entry.kind)) + "</span>",
      ];
      if (words(entry)) bits.push("<span><b>Length</b> " + esc(words(entry)) + "</span>");
      if (entry.created) bits.push("<span><b>Started</b> " + formatDate(entry.created) + "</span>");
      if (entry.updated) bits.push("<span><b>Updated</b> " + formatDate(entry.updated) + "</span>");
      if (entry.source) {
        var label = esc(entry.source.label || "an earlier edition");
        bits.push(
          '<span class="k-provenance"><b>Imported</b> from ' +
            (entry.source.url
              ? '<a href="' +
                esc(entry.source.url) +
                '" target="_blank" rel="noopener noreferrer">' +
                label +
                "</a>"
              : label) +
            (entry.source.imported ? " on " + formatDate(entry.source.imported) : "") +
            "</span>"
        );
      }
      return bits.join("");
    },

    "article-tags": function () {
      var entry = current();
      if (!entry) return "";
      var col = collection(entry.collection);
      var counts = tagCounts();
      var tags = (entry.tags || []).slice().sort(function (a, b) {
        var fa = tagInfo(a).facet;
        var fb = tagInfo(b).facet;
        if (fa !== fb) return Object.keys(DATA.facets).indexOf(fa) - Object.keys(DATA.facets).indexOf(fb);
        return sortKey(tagInfo(a).label) < sortKey(tagInfo(b).label) ? -1 : 1;
      });
      return (
        '<div class="catlinks-label">Collection</div>' +
        "<ul><li>" +
        (col
          ? '<a href="' +
            href("browse.html?collection=" + encodeURIComponent(col.id)) +
            '">' +
            esc(col.title) +
            "</a>"
          : "Unfiled") +
        "</li></ul>" +
        '<div class="k-taglist">' +
        tags
          .map(function (tag) {
            return chip(tag, counts);
          })
          .join("") +
        "</div>"
      );
    },

    "article-related": function (el) {
      var entry = current();
      if (!entry) return "";
      var explicit = (entry.related || [])
        .map(function (slug) {
          return entries.filter(function (candidate) {
            return candidate.slug === slug;
          })[0];
        })
        .filter(Boolean);

      /* Fall back to tag overlap so the section is useful before anything is
         wired up by hand. */
      var list = explicit;
      if (!list.length) {
        var own = entry.tags || [];
        list = entries
          .filter(function (candidate) {
            return candidate.slug !== entry.slug;
          })
          .map(function (candidate) {
            var shared = (candidate.tags || []).filter(function (tag) {
              return own.indexOf(tag) !== -1;
            }).length;
            return { entry: candidate, shared: shared };
          })
          .filter(function (row) {
            return row.shared > 0;
          })
          .sort(function (a, b) {
            return b.shared - a.shared;
          })
          .map(function (row) {
            return row.entry;
          });
      }
      var limit = +el.getAttribute("data-kp-limit") || 6;
      return entryList(list.slice(0, limit), {
        showSummary: false,
        empty: "Nothing else in the library touches this yet.",
      });
    },
  };

  /* --------------------------------------------------- current article --- */

  function currentSlug() {
    var meta = document.querySelector('meta[name="kypedia:slug"]');
    return meta ? meta.getAttribute("content") : null;
  }

  function current() {
    var slug = currentSlug();
    if (!slug) return null;
    var found = entries.filter(function (entry) {
      return entry.slug === slug;
    })[0];
    if (!found) {
      console.warn(
        '[kypedia] this page declares slug "' +
          slug +
          '" but no matching entry exists in library.js.'
      );
    }
    return found || null;
  }

  /* -------------------------------------------------------- browse view -- */

  function params() {
    var search = window.location.search.replace(/^\?/, "");
    var out = { q: "", collection: "", tag: "", status: "", sort: "updated", group: "collection" };
    search.split("&").forEach(function (pair) {
      if (!pair) return;
      var parts = pair.split("=");
      var key = decodeURIComponent(parts[0]);
      var value = decodeURIComponent((parts[1] || "").replace(/\+/g, " "));
      if (key in out) out[key] = value;
    });
    return out;
  }

  function matches(entry, query) {
    if (!query) return true;
    var haystack = [
      entry.title,
      entry.subtitle || "",
      entry.summary,
      (collection(entry.collection) || {}).title || "",
      kindLabel(entry.kind),
      (entry.tags || [])
        .map(function (tag) {
          return tag + " " + tagInfo(tag).label;
        })
        .join(" "),
    ]
      .join(" ")
      .toLowerCase();
    return query
      .toLowerCase()
      .split(/\s+/)
      .every(function (term) {
        return haystack.indexOf(term) !== -1;
      });
  }

  function firstLetter(entry) {
    var ch = sortKey(entry.title).charAt(0).toUpperCase();
    return /[A-Z]/.test(ch) ? ch : "#";
  }

  function browse(el) {
    var state = params();
    var list = entries.filter(function (entry) {
      if (state.collection && entry.collection !== state.collection) return false;
      if (state.status && entry.status !== state.status) return false;
      if (state.tag && (entry.tags || []).indexOf(state.tag) === -1) return false;
      return matches(entry, state.q);
    });

    list.sort(state.sort === "title" ? byTitle : byUpdated);

    var described = [];
    if (state.collection) {
      var col = collection(state.collection);
      described.push("collection " + esc((col && col.title) || state.collection));
    }
    if (state.tag) described.push("tag " + esc(tagInfo(state.tag).label));
    if (state.status) described.push("status " + esc(statusInfo(state.status).label));
    if (state.q) described.push('matching “' + esc(state.q) + "”");

    var html =
      '<p class="k-result-count">' +
      list.length +
      (list.length === 1 ? " entry" : " entries") +
      (described.length ? " in " + described.join(", ") : " in the library") +
      (described.length
        ? ' · <a href="' + href("browse.html") + '">clear filters</a>'
        : "") +
      "</p>";

    if (!list.length) {
      html +=
        '<p class="k-empty">Nothing matches yet. Broaden the filters, or add the ' +
        "entry to library.js if the writing exists but is not registered.</p>";
      return html;
    }

    var groups = {};
    var order = [];
    list.forEach(function (entry) {
      var key =
        state.group === "letter"
          ? firstLetter(entry)
          : (collection(entry.collection) || {}).title || "Unfiled";
      if (!groups[key]) {
        groups[key] = [];
        order.push(key);
      }
      groups[key].push(entry);
    });
    if (state.group === "letter") order.sort();

    html += order
      .map(function (key) {
        var col =
          state.group === "collection"
            ? DATA.collections.filter(function (candidate) {
                return candidate.title === key;
              })[0]
            : null;
        return (
          '<section class="k-group">' +
          '<h2 class="k-group-head">' +
          esc(key) +
          "</h2>" +
          (col ? '<p class="k-group-blurb">' + esc(col.blurb) + "</p>" : "") +
          entryList(groups[key], { showCollection: state.group === "letter" }) +
          "</section>"
        );
      })
      .join("");

    return html;
  }

  function syncControls() {
    var form = document.getElementById("browseControls");
    if (!form) return;
    var state = params();
    Object.keys(state).forEach(function (key) {
      var field = form.elements[key];
      if (field) field.value = state[key];
    });

    /* Populate the selects from the registry so they cannot drift. */
    var collectionSelect = form.elements.collection;
    if (collectionSelect && collectionSelect.options.length <= 1) {
      DATA.collections.forEach(function (col) {
        var option = document.createElement("option");
        option.value = col.id;
        option.textContent = col.title + " (" + collectionCount(col.id) + ")";
        collectionSelect.appendChild(option);
      });
      collectionSelect.value = state.collection;
    }
    var statusSelect = form.elements.status;
    if (statusSelect && statusSelect.options.length <= 1) {
      STATUS_ORDER.forEach(function (id) {
        var option = document.createElement("option");
        option.value = id;
        option.textContent = DATA.statuses[id].label;
        statusSelect.appendChild(option);
      });
      statusSelect.value = state.status;
    }
    var tagField = form.elements.tag;
    if (tagField && state.tag) tagField.value = state.tag;

    form.addEventListener("change", function () {
      form.submit();
    });
  }

  /* Header search on portal pages searches the library rather than the page. */
  function setupPortalSearch() {
    var form = document.querySelector(".mw-search");
    if (!form || form.getAttribute("data-kp-search") !== "library") return;
    var input = form.querySelector("input[type=search]");
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var query = (input && input.value.trim()) || "";
      window.location.href =
        ROOT + "browse.html" + (query ? "?q=" + encodeURIComponent(query) : "");
    });
  }

  /* Any link with id="randomEntry" jumps to a random registered entry. */
  function setupRandom() {
    var link = document.getElementById("randomEntry");
    if (!link || !entries.length) return;
    link.addEventListener("click", function (event) {
      event.preventDefault();
      var pick = entries[Math.floor(Math.random() * entries.length)];
      window.location.href = ROOT + pick.path;
    });
  }

  /* ------------------------------------------------------------- run ----- */

  function run() {
    validate();
    var slots = document.querySelectorAll("[data-kp-render]");
    Array.prototype.forEach.call(slots, function (el) {
      var name = el.getAttribute("data-kp-render");
      var renderer = renderers[name];
      if (!renderer) {
        console.warn('[kypedia] no renderer named "' + name + '".');
        return;
      }
      try {
        var out = renderer(el);
        if (out != null) el.innerHTML = out;
      } catch (error) {
        console.error('[kypedia] renderer "' + name + '" failed:', error);
      }
    });
    syncControls();
    setupPortalSearch();
    setupRandom();
  }

  /* Public surface, handy for one-off pages and for debugging in the console. */
  window.KypediaLib = {
    data: DATA,
    entries: entries,
    root: ROOT,
    collection: collection,
    tagInfo: tagInfo,
    tagCounts: tagCounts,
    current: current,
    validate: validate,
    formatDate: formatDate,
    render: run,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
