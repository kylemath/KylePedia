# Kypedia

A reference library of long-form writing, kept in encyclopedia form: stable
titles, permanent section anchors, sources attached to the claims they support,
and cross-references that hold up as the collection grows.

Static HTML and CSS with a little vanilla JavaScript. No build step, no
dependencies. Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000   # then http://localhost:8000/
```

## Layout

| Path | What it is |
| --- | --- |
| `index.html` | Main page — collections, featured entry, recent updates, tags |
| `browse.html` | Full index; every filter is a URL parameter, so views are linkable |
| `about.html` | What the library is and the conventions it follows |
| `library.js` | **The registry.** Collections, tag vocabulary, one record per entry |
| `render.js` | Fills every `data-kp-render` slot from the registry and validates it |
| `styles.css` | Reading layout: article typography, infobox, contents box, quotations |
| `kypedia.css` | Brand layer and the portal, browse, and metadata components |
| `script.js` | Contents box, scroll tracking, find-on-page, heading permalinks |
| `articles/` | One HTML file per entry |
| `articles/assets/<slug>/` | Images belonging to a single entry |
| `templates/` | The skeleton new entries are copied from |
| `AGENTS.md` | Authoring specification — read before adding content |

## Adding an entry

Two edits, in this order:

1. Copy `templates/article-template.html` to `articles/<slug>.html` and write it.
2. Append a record to `KYPEDIA.entries` in `library.js`.

Then load any page and check the browser console: the renderer validates the
registry on every load and reports missing fields, unknown collections, and tags
outside the controlled vocabulary. Full rules — metadata, section conventions,
citation markup, tag facets, status labels, the pre-flight checklist — are in
[AGENTS.md](AGENTS.md).

Nothing appears anywhere on the site until its registry record exists. That is
deliberate: one source of truth, and no hand-maintained lists to drift.
