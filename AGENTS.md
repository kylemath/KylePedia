# Kypedia — authoring specification

Normative instructions for building and formatting content in this repository.
Read this file before adding or editing an entry. `about.html` is the
reader-facing summary of the same rules; this file is the one to follow.

Kypedia is a **personal reference library in encyclopedia form** — long-form
writing and research, cross-linked, citable, and organised so that a large set
stays navigable. It is not a general encyclopedia and does not aim for
comprehensive coverage of any field. Write for a reader who arrived from a link
and wants to check something.

---

## 1. Repository map

```
index.html                    Main page: collections, featured entry, recent, tags
browse.html                   Full index; all filters are URL parameters
about.html                    Reader-facing explanation of the library
library.js                    THE REGISTRY — site, collections, facets, tags, entries
render.js                     Fills data-kp-render slots from the registry; validates it
styles.css                    Reading layout (article typography, infobox, TOC, verse)
kypedia.css                   Kypedia brand layer + portal/browse/metadata components
script.js                     Per-page behaviour: TOC, scrollspy, find-on-page, permalinks
articles/<slug>.html          One file per entry
articles/assets/<slug>/       Images belonging to one entry, and nothing else
templates/article-template.html  The skeleton every new entry starts from
AGENTS.md                     This file
README.md                     Orientation for a human arriving at the repo
```

Static HTML, no build step, no dependencies, no framework. It must keep working
when opened straight from disk (`file://`), which is why `library.js` is a plain
script assigning a global rather than JSON loaded with `fetch`.

---

## 2. The two-edit rule

Publishing an entry is exactly two file changes. Never one.

1. **The page** — `articles/<slug>.html`, copied from
   `templates/article-template.html`.
2. **The record** — an object appended to `KYPEDIA.entries` in `library.js`.

Nothing appears on the main page, in the browse index, in any tag listing, or in
another entry's "Elsewhere in Kypedia" until the record exists. An article file
without a registry record is invisible; a record without a file is a broken
link. Do both, in the same change.

Do not hand-write listings, tag chips, breadcrumb counts, or "related entries"
into any page. Those are rendered. Hand-written duplicates drift.

---

## 3. Slugs, titles, and file names

- **Slug**: lowercase, ASCII, hyphen-separated, no dates, no numbers unless
  they are part of the subject. `devarim-dvorim-wordplay`, not
  `01_Devarim_Wordplay_final`.
- A slug is **permanent**. It is the entry's address. If a title must change,
  the slug stays; only rename a file if nothing has linked to it yet.
- **Title**: sentence case, no trailing punctuation, no site name.
  "Devarim–dvorim wordplay". Use the term a reader would search for.
- `<title>` in the head is `{{Title}} — Kypedia` (em dash).
- File name is `<slug>.html` inside `articles/`. Flat directory, no
  per-collection subfolders — collections are metadata, not paths.

---

## 4. Required metadata

Every entry declares itself twice: in the page head (so the file is
self-describing) and in the registry (so the site can list it). The two must
agree. When they disagree, the registry wins and the head is the bug.

### 4.1 In the page head

```html
<meta name="kypedia:slug" content="devarim-dvorim-wordplay" />
<meta name="kypedia:title" content="Devarim–dvorim wordplay" />
<meta name="kypedia:collection" content="language" />
<meta name="kypedia:kind" content="article" />
<meta name="kypedia:status" content="stable" />
<meta name="kypedia:created" content="2026-07-27" />
<meta name="kypedia:updated" content="2026-07-28" />
<meta name="kypedia:tags" content="hebrew-language, wordplay, bees" />
```

`kypedia:slug` is load-bearing: `render.js` uses it to find the current entry
and fill the metadata strip, tag footer, and related list. Get it wrong and the
console says so.

Also set `<html lang="en" data-kp-root="../">`. `data-kp-root` is how the
renderer builds links out of the `articles/` directory; root-level pages use
`data-kp-root=""`.

### 4.2 In `library.js`

```js
{
  slug: "devarim-dvorim-wordplay",     // required, unique, matches the file name
  title: "Devarim–dvorim wordplay",    // required
  path: "articles/devarim-dvorim-wordplay.html", // required, from repo root
  collection: "language",              // required, one id from KYPEDIA.collections
  kind: "article",                     // required, one key from KYPEDIA.kinds
  status: "stable",                    // required, one key from KYPEDIA.statuses
  summary: "…",                        // required, 1–3 sentences, plain text
  tags: ["hebrew-language", "wordplay"], // required, all declared in KYPEDIA.tags
  created: "2026-07-27",               // required, ISO date
  updated: "2026-07-28",               // required, ISO date — bump on every edit
  words: 6010,                         // optional but expected; round to ~10
  featured: true,                      // optional, at most one entry
  related: ["other-slug"],             // optional; omit to let tag overlap decide
  subtitle: "…",                       // optional
  source: {                            // optional; imported works only, see §11
    label: "illuminated edition in kylemath/Metzar",
    url: "https://kylemath.github.io/metzar",
    imported: "2026-07-29",
  },
}
```

Field notes:

- **`summary`** is the entry's shop window: it appears on the main page, in
  every listing, and in search matching. Write it as prose, not a label list.
  It should say what the entry establishes, not merely what it is "about".
- **`updated`** drives the recency ordering and the "last updated" figure on
  the main page. Bump it whenever the prose changes, and mirror it into
  `kypedia:updated`.
- **`words`** is the body word count, tags and footnotes included, rounded.
  Recount after substantive edits rather than guessing.
- **`featured`** promotes one entry to the main page. Clear the old one first;
  the renderer takes the first flagged entry.
- **`related`** is for connections that tags cannot infer — a direct
  continuation, a rebuttal, a companion piece. Leave it out and the renderer
  ranks by shared tags, which is usually good enough.
- **`source`** marks an entry that was imported from somewhere else. The
  renderer adds an "Imported from …" line to the metadata strip, so provenance
  is stated on the page rather than only in a commit message.

---

## 5. Collections

An entry belongs to **exactly one** collection: the shelf it would be filed on
in a library. Current ids live in `KYPEDIA.collections`; at time of writing they
are `language`, `history`, `ideas`, `systems`, `nature`, `craft`, `reference`.

- Choose by *primary intent*, not by topic overlap. A piece on the etymology of
  a technical term is `language` if it is about the word and `systems` if it is
  about the technology.
- Adding a collection is legitimate when three or more entries would move to it.
  Add it to `KYPEDIA.collections` with an `id`, `title`, single-character `mark`,
  and a `blurb` of one or two sentences. Then update the entries.
- **Never change a collection `id`** that entries point at; change its `title`
  instead. Ids appear in bookmarkable URLs (`browse.html?collection=language`).

---

## 6. Tags — the controlled vocabulary

Tags are how the library stays navigable past a few dozen entries, so they are
deliberately restricted.

**Rule: an entry may only use tags already declared in `KYPEDIA.tags`.** To use
a new one, declare it first. `render.js` logs a console warning for every
undeclared tag; a page load with warnings is unfinished work.

```js
tags: {
  "hebrew-language": { label: "Hebrew language", facet: "subject" },
  deuteronomy:       { label: "Deuteronomy",     facet: "source" },
  rashi:             { label: "Rashi",           facet: "person" },
  "close-reading":   { label: "Close reading",   facet: "method" },
}
```

### 6.1 Facets

Every tag declares one facet. A tag that fits none of these is not a tag.

| Facet | Answers | Examples |
| --- | --- | --- |
| `subject` | What is this about? | `etymology`, `wordplay`, `mysticism` |
| `source` | What body of material does it work from? | `deuteronomy`, `talmud`, `zohar` |
| `person` | Who is discussed at length? | `moses`, `deborah`, `adam-clarke` |
| `place` | What geography matters to the argument? | — |
| `period` | What span does it cover? | `antiquity` |
| `method` | How was the work done? | `close-reading`, `philology` |

Add a facet only if a whole new dimension of the library appears; facets are
rendered as headings on the main page and `about.html`, so a facet with one tag
looks broken.

### 6.2 Tag hygiene

- Keys are lowercase kebab-case; labels are display case (`Hebrew language`).
- Singular for concepts (`etymology`), plural only where the plural is the name
  of the thing (`bees`).
- No tag that duplicates a collection. Collections are shelves, tags are
  cross-references.
- No tag that duplicates a section heading inside one entry — if it applies to
  exactly one entry and always will, it is a heading, not a tag.
- Aim for **5–15 tags** per entry. Fewer means it will not be found; more means
  none of them mean anything.
- A `person` tag is for someone discussed at length, not merely cited once.
- Retiring a tag means removing it from `KYPEDIA.tags` **and** from every entry.
  Half-removed tags fail validation loudly, which is the point.

---

## 7. Status labels

Entries are published while still in motion. Set `status` honestly.

| Status | Meaning |
| --- | --- |
| `seed` | A title and notes. Not readable as a piece yet. |
| `draft` | Readable start to finish, still moving. Claims may change. |
| `working` | Substantially finished and sourced. Open to additions. |
| `stable` | Settled. Further edits are corrections, not rewrites. |

Promote a status only when the entry has earned it: `working` requires that
every substantive claim carries a footnote; `stable` requires that the section
structure is final, because after that the anchors must not move.

---

## 8. Page structure

Follow `templates/article-template.html`. The order is fixed because readers
rely on it:

1. `.k-breadcrumb` — Kypedia › Collection › Title
2. `h1#firstHeading` — the title, once
3. `.k-article-meta` with `data-kp-render="article-meta"` — rendered, leave empty
4. `.hatnote` — optional, only to redirect a reader who wants a different topic
5. `.mw-article-toolbar` — the Entry/Sources/Tags strip
6. `aside.infobox` — optional; only for stable key/value facts
7. `p.lead` — one or two paragraphs answering the title
8. `div#toc` — leave the `ul#toc-list` empty; `script.js` builds it
9. body `<section>`s
10. `#Scholarly_notes` — where the argument is contested or uncertain
11. `#See_also`
12. `#References` — numbered footnotes
13. `#Further_reading`
14. `#External_links`
15. `#Elsewhere_in_Kypedia` with `data-kp-render="article-related"` — rendered
16. `div.catlinks#Categories` with `data-kp-render="article-tags"` — rendered
17. `footer.mw-footer`

Sections 10–14 are optional in a `seed` or `draft`; 12 is not optional in
anything claiming `working` or above.

### 8.1 Sections and anchors

```html
<section id="Linguistic_background">
  <h2><span class="mw-headline">Linguistic background</span></h2>
  <p>…</p>
</section>
```

- Every body section is a `<section>` with an `id`, containing one `h2` whose
  text is wrapped in `span.mw-headline`. The TOC, the scroll tracker, and the
  heading permalinks all depend on that shape.
- Ids are `Title_Case_With_Underscores`, ASCII only, derived from the heading.
- **Ids are permanent.** Once published, a heading may be reworded but its `id`
  must not change; other entries and outside links point at it. If a section
  genuinely disappears, leave an empty `<section id="Old_Id">` only if something
  is known to link to it — otherwise accept the break and note it in the commit.
- Do not use `h1` in the body, and do not skip to `h3` without an `h2`. Use
  `h3` for subsections only when a section exceeds roughly a thousand words.

### 8.2 Prose

- Write in the register of the existing entries: measured, specific, no
  cheerleading, no rhetorical questions to the reader, no "in this article we
  will".
- Bold the subject on first mention in the lead; after that, bold only terms
  being defined.
- Italics for titles of works, for foreign-language terms, and for words
  discussed as words.
- Foreign script goes in `<span class="he" dir="rtl" lang="he">…</span>` (or the
  matching `lang`), with a transliteration in italics on first use.
- Where a claim is contested, say who contests it. Where a tradition is
  homiletical rather than historical, say so — the existing entry on the
  Devarim pun is the model for this.
- Long quotations use `blockquote.verse`; the three-span form
  (`.verse-he` / `.verse-tr` / `.verse-en` plus `.verse-ref`) is for primary
  text in another language, and the last two spans alone for English.

### 8.3 Citations

```html
…claim in the body.<sup id="cite_ref-7" class="reference"><a href="#cite_note-7">[7]</a></sup>
```

```html
<li id="cite_note-7">
  <span class="mw-cite-backlink"><a href="#cite_ref-7" class="cite-backlink">^</a></span>
  Author, <cite>Work</cite> (Place: Publisher, Year), locator.
</li>
```

- Numbered in order of first appearance; the marker id is `cite_ref-N` and the
  note id is `cite_note-N`. Reusing a note from a second place is fine: repeat
  the `<sup>` without an `id`.
- Cite editions and locators, not search results. Prefer the primary source
  plus the modern treatment that discusses it.
- If a tradition circulates without a fixed textual locus, say that in the note
  rather than inventing a citation. Use `p.cite-caveat` under the list for
  conventions the reader needs.
- **Never fabricate a reference.** An unsourced claim marked as unsourced is
  acceptable; a plausible-looking citation that does not exist is not.

---

## 9. Render hooks

Pages declare a slot; `render.js` fills it. Use these instead of writing
listings by hand.

| `data-kp-render` | Fills with | Attributes |
| --- | --- | --- |
| `site-name`, `site-tagline`, `site-blurb`, `year` | values from `KYPEDIA.site` | — |
| `stats` | library totals for the banner | — |
| `featured` | the entry flagged `featured` | — |
| `collections` | card grid of collections | `data-kp-limit` |
| `nav-collections` | sidebar `<li>` list of collections | — |
| `recent` | entries by `updated` | `data-kp-limit`, `data-kp-summary` |
| `entries` | a filtered list | `data-kp-collection`, `data-kp-tag`, `data-kp-status`, `data-kp-sort`, `data-kp-limit`, `data-kp-empty` |
| `tags` | tag cloud | `data-kp-facet`, `data-kp-limit` |
| `facet-legend` | every declared tag, grouped by facet | — |
| `status-legend` | the status definitions | — |
| `browse` | the URL-driven index on `browse.html` | — |
| `article-meta` | status/kind/length/dates for the current entry | — |
| `article-tags` | collection + tag chips footer | — |
| `article-related` | related entries, explicit or by tag overlap | `data-kp-limit` |

The renderer escapes everything it inserts, so registry text is plain text —
no HTML in `summary` or `blurb`.

### 9.1 Content components

Body components defined in `kypedia.css`. Use these rather than inventing
per-entry markup; a new component belongs here only when two entries need it.

**Parallel text** — for a work written in two languages, or a translation kept
beside its original.

```html
<p class="k-parallel-control" id="parallelControl" data-kp-original="Hebrew"></p>
…
<div class="k-parallel is-en-only">
  <div class="k-parallel-row">
    <div class="k-parallel-en">English paragraph.</div>
    <div class="k-parallel-he" dir="rtl" lang="he">פסקה בעברית.</div>
  </div>
</div>
```

- **Ship it with `is-en-only`.** Collapsed is the default state: the entry then
  reads as ordinary prose, which is how most readers want it, and it needs no
  script to do so. Add `id="parallelControl"` to an empty
  `<p class="k-parallel-control">` before the first block and `script.js`
  inserts the control that opens the columns; `data-kp-original` names the
  language it offers to show, and is used in the control's sentence as well as
  on its button.
- **Name the original's cell for its language.** `k-parallel-he` for Hebrew,
  `k-parallel-ar` for Arabic; each sets the right script font and direction.
  A language without a class yet needs one adding to `kypedia.css` beside the
  others, not an inline style.
- **Markers on the translation only.** Where a row carries footnote markers,
  put them in the `k-parallel-en` cell and leave them out of the original, so
  that each note keeps a single `cite_ref` id and one backlink.
- **Pair at paragraph level, not sentence level.** One row is one paragraph of
  prose in each language. Source works often break their text into a row per
  sentence for a ruled bilingual layout; merge those into real paragraphs on
  both sides, keeping the two languages aligned, or the collapsed view reads as
  a list of fragments rather than prose. Merge by joining with a single space
  and change no words.
- **Never regenerate a block from the source file.** Once merged, the grouping
  is editorial work that exists only in this repository; re-extracting from the
  original silently discards it, and the ungrouped result looks enough like the
  source to pass review. Edit rows in place instead.

**Figures** — `figure.k-figure` floats right at infobox width; add
`k-figure-wide` for a full-column plate. Always give `width`, `height`, and a
substantive `alt`. A caption should explain what the reader is looking at, not
merely name it.

```html
<figure class="k-figure">
  <img src="assets/<slug>/plate.jpg" width="1600" height="906" alt="…" />
  <figcaption>What this shows, and why it is here.</figcaption>
</figure>
```

**Tables** — `table.k-table` with `caption`, `scope` on header cells, and
`class="num"` on numeric columns. A cell may carry a second language in
`span.k-cell-he` or `span.k-cell-ar` rather than duplicating the whole table.

**Letter-value calculations** — `div.k-gematria` holds a caption, a
`k-gematria-letter` per letter (glyph, name, value), `k-gematria-op` operators
marked `aria-hidden="true"`, and a `k-gematria-total`. Recompute every figure
before publishing; see §11.4.

**Colophon** — `div.k-colophon` for the closing signature of an imported work.

**Quotations** — reuse `blockquote.verse` from `styles.css`: `.verse-he`,
`.verse-tr`, `.verse-en`, `.verse-ref`. Supply a transliteration when quoting a
non-Latin script.

### 9.2 Linkable views

Every view on `browse.html` is a URL, so entries can link into the index
directly: `browse.html?tag=midrash`, `browse.html?collection=language`,
`browse.html?status=draft`, `browse.html?q=bees`, `browse.html?group=letter`,
`browse.html?sort=title`. Parameters combine. Prefer linking a filtered index
over listing entries by hand inside prose.

---

## 10. Adding something other than an article

- **Essay, note** — same template, different `kind`. Notes may skip
  `#Further_reading` and `#External_links`.
- **Index, glossary, timeline, source list** — same template and the matching
  `kind`; file in the `reference` collection and keep the section scaffold even
  when the body is mostly a list or table.
- **A new top-level page** (a portal, a series landing page) — copy the head,
  header, and sidebar from `browse.html`, set `data-kp-root=""`, mark the
  content area `class="mw-content k-portal"`, and build the listings from
  `data-kp-render="entries"` slots. Do not introduce a second stylesheet.
- **A multi-part series** — separate entries, one per part, each with the
  others in `related`. Do not put a series into one enormous file.
- **A work that already exists elsewhere** — see §11, which governs imports and
  their assets.

---

## 11. Importing an existing work

Writing arrives from other repositories in three shapes: a standalone HTML page
with its own CSS, a LaTeX paper, or plain prose. **The library has one house
style, and imports are reflowed into it.** The original stays where it is and is
linked as the source edition; it is not embedded, iframed, or copied in with its
own stylesheet.

### 11.1 Procedure

1. **Read the whole source first.** Not a skim — the structure, the asides, the
   tables, the images, and any citations it already carries.
2. **Copy the file** from `templates/article-template.html` as usual, then map
   the source's structure onto the section scaffold of §8. Its own section names
   usually become `h2` headings; keep the author's names for them rather than
   renaming to generic ones.
3. **Fold side matter into the flow.** Pull-quotes, marginal notes, appendices,
   and boxed asides become ordinary sections or paragraphs in reading order.
   Nothing should require a sidebar to make sense.
4. **Extract text mechanically, not by hand.** For anything with vocalised
   Hebrew, diacritics, or mathematics, script the extraction from the source
   file so characters are copied byte-exact. Retyping such text introduces
   errors that are invisible on review.
5. **Bring the images** into `articles/assets/<slug>/` — see §11.2.
6. **Add citations to house standard** (§8.3). Imported prose is often written
   without footnotes; supply them for claims a reader would want to check, and
   obey §13: a real source, or an explicit statement that there is none.
7. **Recompute every figure** the source asserts — arithmetic, dates, counts.
   See §11.4.
8. **Register it** with a `source` block (§4.2), and set `kind` to whatever it
   actually is; add a new `kind` to `library.js` if none fits.
9. **Link both ways**: the entry's `related`, and an `#External_links` item
   pointing at the source edition.

### 11.2 Assets

- One directory per entry: `articles/assets/<slug>/`. No shared image pool —
  when an entry is deleted its assets go with it.
- Rename to something descriptive on the way in. `kyles.png` becomes
  `two-kyles.jpg`.
- Downscale to **1600px on the long edge**, which is past what the layout can
  show and enough for a retina display. Never upscale.
- Photographic or painterly plates become **JPEG at quality ~88**; keep PNG only
  for line art, screenshots of text, and anything needing transparency. On macOS
  `sips -Z 1600 in.png -s format jpeg -s formatOptions 88 --out out.jpg` does
  both steps.
- The originals stay in the source repository. This directory holds web copies,
  and the entry links to the source edition for anyone who wants the full file.

### 11.3 LaTeX papers

- Convert structure by hand rather than trusting an automatic converter: it is
  faster to map `\section` to `<section><h2>` than to clean up generated markup.
- `\cite`/BibTeX entries become numbered footnotes in `#References` (§8.3),
  keeping the bibliographic detail rather than reducing it to an author–year
  stub.
- Figures and tables become `k-figure` and `k-table`. A figure's LaTeX caption
  usually needs expanding: journal captions assume the surrounding paper.
- There is no mathematics component yet. For occasional inline symbols use HTML
  and entities. Do **not** add a script such as KaTeX or MathJax for one entry —
  that breaks §13. If an entry genuinely needs typeset mathematics, raise it
  before importing, because it is a change to the library rather than one page.
- An abstract is not a lead. Rewrite it into a lead paragraph that answers the
  title in plain language, and keep the abstract as a first section if it is
  worth keeping.

### 11.4 Verifying an import

The source is the author's own writing, so **do not silently rewrite its
argument or its prose.** But do check what can be checked, and where a figure
does not survive checking, record it in `#Scholarly_notes` and footnote it
rather than either propagating it or quietly editing it away. The imported
tractate `masechet-metzar` is the worked example: its gematria was recomputed,
three figures did not match, and each is noted with the arithmetic shown while
the author's text stands as written.

Check: arithmetic; dates and episode or edition numbers; etymologies against a
lexicon; whether a claimed tradition can actually be located. Distinguish
throughout between a homiletical reading, which needs no derivation, and a
historical claim, which does.

## 12. Before finishing

Run through all of these. They are quick and they catch what matters.

1. **Serve it and open it.** `python3 -m http.server 8000` from the repo root,
   then `http://localhost:8000/`. Live Server works too.
2. **Console clean.** `render.js` validates the whole registry on every page
   load. Zero warnings from `[kypedia]`.
3. **Registry round-trip.** The new entry appears on the main page under
   *Recently updated*, in `browse.html`, and under each of its tags.
4. **Head matches record.** Slug, collection, status, dates, tags.
5. **TOC matches sections.** Every `h2` in the body appears in the contents box
   and every `id` is reachable.
6. **Footnotes balance.** Every `cite_ref-N` has a `cite_note-N` and back.
7. **Links resolve.** Internal links from `articles/` start with `../`;
   external links carry `target="_blank" rel="noopener noreferrer"`.
8. **Print view.** `Cmd-P` — chrome hidden, body readable.
9. **Narrow window.** Below 900px the sidebar stacks, the infobox and figures go
   full width, and parallel text stacks into one column. Nothing overflows
   horizontally.
10. **Imported entries**: images load, provenance line shows, and every figure
    recomputed under §11.4 either matches or is noted.

```bash
# word count for the `words` field
python3 - <<'PY'
import re, html
s = open('articles/<slug>.html', encoding='utf-8').read()
body = s.split('<div class="mw-body-content">', 1)[1]
text = html.unescape(re.sub(r'<[^>]+>', ' ', body))
print(len([w for w in text.split() if re.search(r'\w', w)]))
PY
```

---

## 13. Hard rules

- **Never delete or rewrite existing entry prose** to make a change fit. The
  writing is the asset. Add, correct, or annotate; do not replace.
- **Never break a published anchor** — not a slug, not a section `id`, not a
  collection or tag id.
- **Never invent a citation, a date, or a source.** Mark gaps as gaps.
- **Never introduce a build step, framework, package manager, or CDN
  dependency.** This site must open from disk in ten years.
- **Never bypass the registry** by hand-writing a listing.
- **Never leave `[kypedia]` console warnings behind.**
- If Python or Node is needed for a one-off script, use a virtual environment
  for any `pip install` and do not commit the environment.
