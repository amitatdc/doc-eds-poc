# Migrate Page: doc.govt.nz "Native plants" — Plan

## Overview
Migrate `https://www.doc.govt.nz/nature/native-plants/` into the AEM Edge Delivery Services project. Analysis of the page shows it matches the existing **`content-page`** template already set up in this project (hero banner with title, intro overview, and a long-form prose content box; a "Related" links section near the footer). It has **no embedded video and no form** — those blocks in the template are optional and simply won't be emitted for this page.

Because the template and its import infrastructure (parsers, transformer, bundled import script) already exist, this is a **template-reuse import**: add the new URL to the `content-page` template, provide page properties, re-bundle, run the import, then preview and verify against the source.

**Project type:** `xwalk` · **Content source:** doc.govt.nz · **Reused template:** `content-page` (hero-banner, embed-video [optional], cards-related)

**Status:** Ready to execute. ⚠️ Execution requires switching from Plan mode to Execute mode.

## Assumptions
- The page maps to the `content-page` template (confirmed via structure analysis). If a first import reveals content the template's parsers don't capture, I'll flag it and, if needed, run a fresh page analysis rather than force-fit.
- Sample custom page properties (Page Owner, Internal Department, Review Date, Confidentiality) will be set for the new path, consistent with the other content-page entries.

## Checklist

### 1. Confirm the page fits the template
- [ ] Re-verify the page's structure against `content-page` selectors (hero `section.doc-main-layout__hero`, prose `#doc-content-box`, related `#footer-related`)
- [ ] Confirm no unexpected content types (video/form/galleries) that would need extra parsers

### 2. Wire the URL into the content-page import
- [ ] Add `https://www.doc.govt.nz/nature/native-plants/` to the `content-page` template's `urls` in `tools/importer/page-templates.json`
- [ ] Add the same URL to `tools/importer/urls-content-page.txt`
- [ ] Add a `SAMPLE_PAGE_PROPERTIES` entry for `/nature/native-plants/` in `tools/importer/import-content-page.js` (Page Owner, Internal Department, Review Date, Confidentiality)
- [ ] Mirror the URL/property additions in the bundled script (or re-bundle so the bundle stays in sync)

### 3. Run the import
- [ ] Re-bundle the import script if the project requires it (`import-content-page.bundle.js`)
- [ ] Run the bulk import for the content-page URL list to generate the page HTML into the content directory
- [ ] Confirm the new page HTML and any downloaded images/assets were produced without errors (check the import report)

### 4. Preview & verify
- [ ] Restart the local dev server if needed so the newly imported page is served (per project note: new imports preview under `/content/`)
- [ ] Preview the imported page and inspect DOM structure (hero, prose content, related cards) with token-efficient snapshot/evaluate checks
- [ ] Compare rendered output against the source page for content completeness and section styling; iterate on parsers/transformer only if gaps appear

### 5. Lint & wrap up
- [ ] Run `npm run lint` (and `npm run build:json` if any model files changed) to keep the project clean
- [ ] Summarize what was imported, the page path, and note the option to push the branch / open a PR with the feature-preview URL for the migrated page

> **Note:** Execution requires switching to Execute mode. On approval I'll start with step 1 and proceed through the import and verification.
