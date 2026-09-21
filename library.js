/* ==========================================================================
   Kypedia — library registry
   --------------------------------------------------------------------------
   This file is the single source of truth for what exists in the library.
   Every listing on the site (home page panels, browse page, tag indexes,
   the metadata strip and category footer on each article) is rendered from
   the data below by render.js.

   Adding an entry means two edits and nothing else:
     1. create the article file from templates/article-template.html
     2. append a record to KYPEDIA.entries in this file

   Read AGENTS.md before editing. Field rules and the controlled tag
   vocabulary are documented there and enforced loosely by render.js, which
   logs a console warning for unknown collections, statuses, or tags.

   Plain script, no modules and no fetch, so the site also works when opened
   directly from disk with file:// URLs.
   ========================================================================== */

window.KYPEDIA = {
  /* ---------------------------------------------------------------- site -- */
  site: {
    name: "Kypedia",
    wordmark: "KYPEDIA",
    mark: "K",
    tagline: "A reference library of long-form writing",
    /* Shown in the home page banner. */
    blurb:
      "Kypedia collects long-form writing and research into one cross-linked " +
      "reference library. Entries are written to be cited and revisited " +
      "rather than read once: stable headings, permanent anchors, sources " +
      "kept close to the claims they support.",
    /* Used for the copyright/footer line and the citation helper. */
    author: "Kypedia",
    started: "2026",
  },

  /* ------------------------------------------------------------ statuses -- */
  /* Maturity of an entry. Order here is the order used for sorting and for
     the "status" filter on the browse page. */
  statuses: {
    seed: {
      label: "Seed",
      blurb: "A title and a few notes. Not yet readable as a piece.",
    },
    draft: {
      label: "Draft",
      blurb: "Complete enough to read, still moving. Claims may change.",
    },
    working: {
      label: "Working",
      blurb: "Substantially finished and sourced. Open to additions.",
    },
    stable: {
      label: "Stable",
      blurb: "Settled text. Edits are corrections, not rewrites.",
    },
  },

  /* --------------------------------------------------------------- kinds -- */
  /* What sort of document an entry is. Affects labelling only. */
  kinds: {
    article: { label: "Article" },
    essay: { label: "Essay" },
    book: { label: "Book" },
    tractate: { label: "Tractate" },
    note: { label: "Note" },
    index: { label: "Index" },
    glossary: { label: "Glossary" },
    timeline: { label: "Timeline" },
    sources: { label: "Source list" },
  },

  /* --------------------------------------------------------------- facets -- */
  /* Tags are grouped into facets so that a large tag set stays legible.
     Every tag in the vocabulary below declares exactly one facet. */
  facets: {
    subject: { label: "Subjects", blurb: "What the entry is about." },
    source: { label: "Sources", blurb: "Corpora and texts the entry works from." },
    person: { label: "People", blurb: "Figures discussed at length." },
    place: { label: "Places", blurb: "Geography that matters to the argument." },
    period: { label: "Periods", blurb: "Historical span covered." },
    method: { label: "Methods", blurb: "How the work was done." },
  },

  /* ---------------------------------------------------------- collections -- */
  /* Top-level shelves. An entry belongs to exactly one collection.
     Rename these freely; keep the ids stable once entries point at them. */
  collections: [
    {
      id: "language",
      title: "Language & Scripture",
      mark: "L",
      blurb:
        "Close reading of texts: translation, etymology, wordplay, and the " +
        "ways a phrase carries more than it says.",
    },
    {
      id: "history",
      title: "History & Origins",
      mark: "H",
      blurb:
        "How things came to be the way they are — practices, institutions, " +
        "and the paper trail behind them.",
    },
    {
      id: "ideas",
      title: "Ideas & Philosophy",
      mark: "I",
      blurb:
        "Arguments taken seriously and followed to their consequences, with " +
        "the objections kept in view.",
    },
    {
      id: "systems",
      title: "Technology & Systems",
      mark: "S",
      blurb:
        "Machines, software, and organisations described as systems: inputs, " +
        "failure modes, and incentives.",
    },
    {
      id: "nature",
      title: "Nature & Field Notes",
      mark: "N",
      blurb:
        "Observation-led writing about the physical world, from close-up " +
        "natural history to landscape at scale.",
    },
    {
      id: "craft",
      title: "Method & Craft",
      mark: "M",
      blurb:
        "Notes on the work itself: how research gets done, how sources are " +
        "handled, how a long piece is built.",
    },
    {
      id: "reference",
      title: "Reference & Indexes",
      mark: "R",
      blurb:
        "Glossaries, timelines, and source lists that other entries lean on " +
        "instead of repeating.",
    },
  ],

  /* ----------------------------------------------------------------- tags -- */
  /* Controlled vocabulary. Keys are lowercase kebab-case and are what appear
     in an entry's `tags` array. Add a key here before using it. */
  tags: {
    /* subject */
    etymology: { label: "Etymology", facet: "subject" },
    wordplay: { label: "Wordplay", facet: "subject" },
    translation: { label: "Translation", facet: "subject" },
    naming: { label: "Naming", facet: "subject" },
    "hebrew-language": { label: "Hebrew language", facet: "subject" },
    "arabic-language": { label: "Arabic language", facet: "subject" },
    "scottish-gaelic": { label: "Scottish Gaelic", facet: "subject" },
    yiddish: { label: "Yiddish", facet: "subject" },
    sumerian: { label: "Sumerian", facet: "subject" },
    "semitic-languages": { label: "Semitic languages", facet: "subject" },
    kingship: { label: "Kingship", facet: "subject" },
    bees: { label: "Bees", facet: "subject" },
    prophecy: { label: "Prophecy", facet: "subject" },
    mysticism: { label: "Mysticism", facet: "subject" },
    kabbalah: { label: "Kabbalah", facet: "subject" },
    gnosticism: { label: "Gnosticism", facet: "subject" },
    hermeticism: { label: "Hermeticism", facet: "subject" },
    psychoanalysis: { label: "Psychoanalysis", facet: "subject" },
    consciousness: { label: "Consciousness", facet: "subject" },
    ethics: { label: "Ethics", facet: "subject" },
    diaspora: { label: "Diaspora", facet: "subject" },
    rhetoric: { label: "Rhetoric", facet: "subject" },
    "pop-culture": { label: "Popular culture", facet: "subject" },
    /* source */
    deuteronomy: { label: "Deuteronomy", facet: "source" },
    exodus: { label: "Exodus", facet: "source" },
    "yom-kippur": { label: "Yom Kippur", facet: "subject" },
    psalms: { label: "Psalms", facet: "source" },
    isaiah: { label: "Isaiah", facet: "source" },
    talmud: { label: "Talmud", facet: "source" },
    midrash: { label: "Midrash", facet: "source" },
    zohar: { label: "Zohar", facet: "source" },
    "arabic-lexicons": { label: "Arabic lexicons", facet: "source" },
    "south-arabian-inscriptions": {
      label: "South Arabian inscriptions",
      facet: "source",
    },
    "nag-hammadi": { label: "Nag Hammadi codices", facet: "source" },
    "corpus-hermeticum": { label: "Corpus Hermeticum", facet: "source" },
    /* person */
    moses: { label: "Moses", facet: "person" },
    josiah: { label: "Josiah", facet: "person" },
    deborah: { label: "Deborah", facet: "person" },
    rashi: { label: "Rashi", facet: "person" },
    "adam-clarke": { label: "Adam Clarke", facet: "person" },
    "isaac-luria": { label: "Isaac Luria", facet: "person" },
    "shimon-bar-yochai": { label: "Shimon bar Yochai", facet: "person" },
    "matt-stone": { label: "Matt Stone", facet: "person" },
    "ibn-khaldun": { label: "Ibn Khaldūn", facet: "person" },
    "sigmund-freud": { label: "Sigmund Freud", facet: "person" },
    "carl-jung": { label: "Carl Jung", facet: "person" },
    /* place */
    yemen: { label: "Yemen", facet: "place" },
    mesopotamia: { label: "Mesopotamia", facet: "place" },
    /* method */
    "close-reading": { label: "Close reading", facet: "method" },
    philology: { label: "Philology", facet: "method" },
    lexicography: { label: "Lexicography", facet: "method" },
    gematria: { label: "Gematria", facet: "method" },
    "comparative-analysis": { label: "Comparative analysis", facet: "method" },
    /* period */
    antiquity: { label: "Antiquity", facet: "period" },
    modernity: { label: "Modernity", facet: "period" },
    contemporary: { label: "Contemporary", facet: "period" },
  },

  /* -------------------------------------------------------------- entries -- */
  /* Newest first is conventional but not required; listings sort themselves.
     Required: slug, title, path, collection, kind, status, summary, tags,
     created, updated. Optional: subtitle, words, featured, related, source. */
  entries: [
    {
      slug: "place-you-are-afraid-to-look",
      title: "The place you are most afraid to look",
      subtitle: "A dvar Torah for Yom Kippur",
      path: "articles/place-you-are-afraid-to-look.html",
      collection: "ideas",
      kind: "essay",
      status: "draft",
      summary:
        "A Yom Kippur sermon arguing that lasting joy is found inside the " +
        "practice we are avoiding, not outside it. The avoidance is not only " +
        "grief, for a friend's death and a cousin's yahrzeit, but the fear " +
        "of committing to belief and action before we feel certain. Using " +
        "Frank Jackson's Mary thought experiment in reverse, John Wesley's " +
        "advice to preach faith before having it, Aristotle on virtue as a " +
        "habit, and the Talmud's na'aseh v'nishma, the sermon argues that " +
        "action has to come before understanding, and closes on the Yom " +
        "Kippur morning reading: you are already standing here with what " +
        "the doing requires.",
      tags: [
        "yom-kippur",
        "ethics",
        "consciousness",
        "psychoanalysis",
        "deuteronomy",
        "exodus",
        "talmud",
        "hebrew-language",
        "sigmund-freud",
        "comparative-analysis",
        "contemporary",
      ],
      words: 5640,
      created: "2026-09-21",
      updated: "2026-09-21",
      related: ["divine-fracture", "deuteronomy-register-shift"],
    },
    {
      slug: "deuteronomy-register-shift",
      title: "The register shift in Deuteronomy",
      path: "articles/deuteronomy-register-shift.html",
      collection: "language",
      kind: "essay",
      status: "working",
      summary:
        "A word-by-word count of the Five Books shows that Deuteronomy's " +
        "vocabulary is not larger than the growth curve of Genesis through " +
        "Numbers already predicts. What changes is grammatical person: " +
        "known roots are recast as second-person address — \u201cyou shall " +
        "keep,\u201d \u201cyour heart\u201d — at two to three times their " +
        "earlier rate, alongside a smaller, genuinely new core of legal " +
        "and covenantal terms such as lamad, \u201cto teach,\u201d absent " +
        "from the Torah before Deuteronomy 4:1.",
      tags: [
        "hebrew-language",
        "deuteronomy",
        "moses",
        "rhetoric",
        "close-reading",
        "philology",
        "comparative-analysis",
        "antiquity",
      ],
      words: 2770,
      created: "2026-09-12",
      updated: "2026-09-12",
      related: ["devarim-dvorim-wordplay"],
    },
    {
      slug: "divine-fracture",
      title: "The Divine Fracture",
      subtitle: "Ancient mysticism and the architecture of mind",
      path: "articles/divine-fracture.html",
      collection: "ideas",
      kind: "book",
      status: "draft",
      summary:
        "Gnosticism, Hermeticism and Kabbalah describe between them the same " +
        "three-part structure of mind that Freud later named the id, the ego " +
        "and the superego: a spark that precedes socialisation, a mediator " +
        "reading patterns between levels, and an obligation toward repair. An " +
        "imported book runs the correspondence through the primary texts, " +
        "puts Freud at the hinge, and finds the same three movements being " +
        "rebuilt in The Matrix, Lost and Evangelion. The claim is structural " +
        "resemblance, not transmission, and the historical slips are recorded " +
        "rather than repaired.",
      tags: [
        "gnosticism",
        "hermeticism",
        "kabbalah",
        "mysticism",
        "psychoanalysis",
        "consciousness",
        "ethics",
        "pop-culture",
        "nag-hammadi",
        "corpus-hermeticum",
        "zohar",
        "sigmund-freud",
        "carl-jung",
        "isaac-luria",
        "comparative-analysis",
        "close-reading",
        "antiquity",
        "modernity",
        "contemporary",
      ],
      words: 29370,
      created: "2026-07-29",
      updated: "2026-07-29",
      /* Imported works record where they came from; render.js shows this in
         the metadata strip. */
      source: {
        label: "web edition in kylemath/gnosisHermesKabal",
        url: "https://kylemath.github.io/gnosisHermesKabal/",
        imported: "2026-07-29",
      },
    },
    {
      slug: "qayl",
      title: "Qayl",
      subtitle: "The etymology of a Himyaritic title",
      path: "articles/qayl.html",
      collection: "language",
      kind: "essay",
      status: "working",
      summary:
        "Qayl is the South Arabian title of a chief ranking below the king, " +
        "and the Arabic lexicographers derived it from qawl, “speech”, so " +
        "that the qayl is the one whose word is carried out. An imported " +
        "comparative essay refuses that derivation and gathers instead the " +
        "roots of height, summit and choosing crowded around it, reaching as " +
        "far as Sumerian gal and Egyptian qa. Checked against the Sabaic " +
        "evidence the epigraphy holds down to the line, the haykal loan is " +
        "real but proves something narrower, and Goliath does not belong.",
      tags: [
        "etymology",
        "arabic-language",
        "semitic-languages",
        "sumerian",
        "kingship",
        "translation",
        "arabic-lexicons",
        "south-arabian-inscriptions",
        "ibn-khaldun",
        "yemen",
        "mesopotamia",
        "antiquity",
        "philology",
        "lexicography",
        "close-reading",
      ],
      words: 9910,
      created: "2026-07-29",
      updated: "2026-07-29",
      source: {
        label: "a bilingual reader of the Arabic original at mbtda.com",
        url: "https://www.mbtda.com/language/oldarabic/qyl.php",
        imported: "2026-07-29",
      },
    },
    {
      slug: "masechet-metzar",
      title: "Masechet Metzar",
      subtitle: "The name Kyle read through PaRDeS",
      path: "articles/masechet-metzar.html",
      collection: "language",
      kind: "tractate",
      status: "working",
      summary:
        "English Kyle descends from Gaelic caol, a narrow strait; the Hebrew " +
        "for a narrow place is metzar. A bilingual tractate reads the name " +
        "through the four levels of PaRDeS, by way of the two Kyles of South " +
        "Park, and arrives at constriction as the condition of passage rather " +
        "than a defect to be translated away.",
      tags: [
        "naming",
        "hebrew-language",
        "etymology",
        "translation",
        "gematria",
        "kabbalah",
        "diaspora",
        "pop-culture",
        "mysticism",
        "psalms",
        "isaiah",
        "talmud",
        "scottish-gaelic",
        "yiddish",
        "isaac-luria",
        "matt-stone",
        "shimon-bar-yochai",
        "close-reading",
        "contemporary",
      ],
      words: 8190,
      created: "2026-07-29",
      updated: "2026-07-29",
      related: ["devarim-dvorim-wordplay"],
      /* Imported works record where they came from; render.js shows this in
         the metadata strip. */
      source: {
        label: "illuminated edition in kylemath/Metzar",
        url: "https://kylemath.github.io/metzar",
        imported: "2026-07-29",
      },
    },
    {
      slug: "devarim-dvorim-wordplay",
      title: "Devarim–dvorim wordplay",
      path: "articles/devarim-dvorim-wordplay.html",
      collection: "language",
      kind: "article",
      status: "stable",
      featured: true,
      summary:
        "The Hebrew title of Deuteronomy, devarim (“words”), differs from " +
        "devorim (“bees”) by a vowel, and in an unpointed scroll not at all. " +
        "A study of the midrashic pun, the bee simile inside the book that " +
        "anchors it, and the honey-and-sting homily built on both.",
      tags: [
        "hebrew-language",
        "wordplay",
        "etymology",
        "bees",
        "deuteronomy",
        "midrash",
        "talmud",
        "zohar",
        "moses",
        "josiah",
        "deborah",
        "rashi",
        "adam-clarke",
        "mysticism",
        "rhetoric",
        "close-reading",
        "philology",
        "antiquity",
      ],
      words: 6730,
      created: "2026-07-27",
      updated: "2026-07-29",
    },
  ],
};
