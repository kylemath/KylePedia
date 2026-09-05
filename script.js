(function () {
  "use strict";

  const tocList = document.getElementById("toc-list");
  const toggleToc = document.getElementById("toggleToc");
  const toc = document.getElementById("toc");
  const searchForm = document.querySelector(".mw-search");
  const searchInput = document.getElementById("searchInput");
  const backToTop = document.getElementById("backToTop");
  const printLink = document.getElementById("printLink");
  const contentRoot = document.querySelector(".mw-body-content");
  const searchFallback = document.getElementById("searchFallback");
  const libraryRoot = document.documentElement.getAttribute("data-kp-root") || "";

  const headings = Array.from(
    document.querySelectorAll(".mw-body-content h2 .mw-headline")
  );

  function buildToc() {
    if (!tocList || headings.length === 0) return;

    const fragment = document.createDocumentFragment();

    headings.forEach((headline, index) => {
      const section = headline.closest("section") || headline.parentElement;
      const id = section && section.id ? section.id : `section-${index + 1}`;
      if (section && !section.id) section.id = id;

      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = `#${id}`;
      a.textContent = `${index + 1} ${headline.textContent.trim()}`;
      a.dataset.target = id;
      li.appendChild(a);
      fragment.appendChild(li);
    });

    tocList.appendChild(fragment);
  }

  function setupTocToggle() {
    if (!toggleToc || !toc) return;

    toggleToc.addEventListener("click", (event) => {
      event.preventDefault();
      const collapsed = toc.classList.toggle("is-collapsed");
      toggleToc.textContent = collapsed ? "show" : "hide";
      toggleToc.setAttribute("aria-expanded", String(!collapsed));
    });
  }

  function setupScrollSpy() {
    if (!tocList || headings.length === 0) return;

    const links = Array.from(tocList.querySelectorAll("a"));
    const sections = headings
      .map((headline) => headline.closest("section"))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          links.forEach((link) => {
            link.classList.toggle("is-active", link.dataset.target === id);
          });
        });
      },
      {
        rootMargin: "-20% 0px -65% 0px",
        threshold: 0,
      }
    );

    sections.forEach((section) => observer.observe(section));
  }

  function clearHighlights() {
    if (!contentRoot) return;
    contentRoot.querySelectorAll("mark.search-hit").forEach((mark) => {
      const parent = mark.parentNode;
      if (!parent) return;
      parent.replaceChild(document.createTextNode(mark.textContent || ""), mark);
      parent.normalize();
    });
  }

  function highlightTerm(term) {
    if (!contentRoot || !term) return 0;

    const walker = document.createTreeWalker(
      contentRoot,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          if (!node.nodeValue || !node.nodeValue.trim()) {
            return NodeFilter.FILTER_REJECT;
          }
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          if (
            parent.closest(
              ".toc, .infobox, .catlinks, .mw-footer, script, style, .reference"
            )
          ) {
            return NodeFilter.FILTER_REJECT;
          }
          if (parent.closest("mark.search-hit")) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        },
      }
    );

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    const pattern = new RegExp(
      term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "gi"
    );
    let count = 0;

    nodes.forEach((textNode) => {
      const text = textNode.nodeValue;
      if (!text || !pattern.test(text)) return;
      pattern.lastIndex = 0;

      const frag = document.createDocumentFragment();
      let lastIndex = 0;
      let match;

      while ((match = pattern.exec(text)) !== null) {
        if (match.index > lastIndex) {
          frag.appendChild(
            document.createTextNode(text.slice(lastIndex, match.index))
          );
        }
        const mark = document.createElement("mark");
        mark.className = "search-hit";
        mark.textContent = match[0];
        frag.appendChild(mark);
        count += 1;
        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < text.length) {
        frag.appendChild(document.createTextNode(text.slice(lastIndex)));
      }

      textNode.parentNode.replaceChild(frag, textNode);
    });

    return count;
  }

  function setupSearch() {
    if (!searchForm || !searchInput) return;
    // Portal pages hand their search box to render.js, which queries the
    // whole library instead of the current page.
    if (searchForm.getAttribute("data-kp-search") === "library") return;

    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const term = searchInput.value.trim();
      clearHighlights();
      if (searchFallback) searchFallback.hidden = true;

      if (!term) return;

      const count = highlightTerm(term);
      const firstHit = document.querySelector("mark.search-hit");

      if (firstHit) {
        firstHit.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      searchInput.setAttribute(
        "title",
        count ? `${count} match${count === 1 ? "" : "es"} on this page` : "No matches on this page"
      );

      if (!count && searchFallback) {
        const url = `${libraryRoot}browse.html?q=${encodeURIComponent(term)}`;
        searchFallback.innerHTML = `No matches on this page — <a href="${url}">search the whole library for “${term}”</a>.`;
        searchFallback.hidden = false;
      }
    });
  }

  // Parallel-text entries carry the original alongside the translation. The
  // control lets a reader collapse to the translation alone without the other
  // language leaving the page source.
  function setupParallelToggle() {
    const blocks = Array.from(document.querySelectorAll(".k-parallel"));
    const mount = document.getElementById("parallelControl");
    if (!blocks.length || !mount) return;

    const original = mount.dataset.kpOriginal;
    const originalLabel = original || "original";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "linkish";
    // The markup ships collapsed, so the entry reads as prose before any
    // script runs; the control opens the parallel columns.
    let hidden = blocks.every((block) => block.classList.contains("is-en-only"));

    const paint = () => {
      button.textContent = hidden
        ? `show the ${originalLabel}`
        : `hide the ${originalLabel}`;
      button.setAttribute("aria-pressed", String(hidden));
      blocks.forEach((block) => block.classList.toggle("is-en-only", hidden));
    };

    button.addEventListener("click", () => {
      hidden = !hidden;
      paint();
    });

    mount.append(
      original
        ? `The original ${original} is set in parallel with this text. You can `
        : "The original is set in parallel with this text. You can "
    );
    mount.appendChild(button);
    mount.append(".");
    paint();
  }

  // Permanent anchors: every section heading gets a control that copies its
  // link, so a paragraph can be cited from outside without hunting for the id.
  function setupHeadingAnchors() {
    if (!contentRoot) return;

    contentRoot.querySelectorAll("h2 .mw-headline").forEach((headline) => {
      const section = headline.closest("section");
      if (!section || !section.id) return;

      const button = document.createElement("button");
      button.type = "button";
      button.className = "k-anchor";
      button.textContent = "¶";
      button.title = "Copy a link to this section";
      button.setAttribute(
        "aria-label",
        `Copy a link to the section “${headline.textContent.trim()}”`
      );

      button.addEventListener("click", () => {
        const url = `${window.location.origin}${window.location.pathname}#${section.id}`;
        const done = () => {
          button.classList.add("is-copied");
          button.textContent = "copied";
          window.setTimeout(() => {
            button.classList.remove("is-copied");
            button.textContent = "¶";
          }, 1200);
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(done, () => {
            window.location.hash = section.id;
          });
        } else {
          window.location.hash = section.id;
        }
      });

      headline.parentElement.appendChild(button);
    });
  }

  function setupUtilities() {
    if (backToTop) {
      backToTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    if (printLink) {
      printLink.addEventListener("click", (event) => {
        event.preventDefault();
        window.print();
      });
    }
  }

  buildToc();
  setupTocToggle();
  setupScrollSpy();
  setupSearch();
  setupParallelToggle();
  setupHeadingAnchors();
  setupUtilities();
})();
