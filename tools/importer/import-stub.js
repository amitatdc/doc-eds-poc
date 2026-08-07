/* eslint-disable */
/* global WebImporter */

/**
 * Minimal placeholder ("stub") import script.
 *
 * Generates a bare placeholder page for a URL so that links pointing at it
 * resolve instead of 404ing. The page contains only a hero-banner block whose
 * text is the page title (no body content is copied from the source).
 *
 * The hero-banner block table matches the shape produced by
 * parsers/hero-banner.js (base: hero), so it renders with the existing
 * blocks/hero-banner code:
 *   Row 1 (block name) added by createBlock.
 *   Row 2: text -> field:text (the H1 heading). No image row for stubs.
 */

// Clean, human-readable titles keyed by pathname. Falls back to the source
// document <title> (stripped of any ": section" suffix) when a path is absent.
const STUB_TITLES = {
  '/get-involved/conservation-activities/attract-birds-to-your-garden/': 'Attract birds to your garden',
  '/our-work/motukarara-conservation-nursery/': 'Motukārara Wholesale Conservation Nursery',
  '/about-us/science-publications/conservation-publications/nz-threat-classification-system/': 'New Zealand Threat Classification System',
};

function resolveTitle(document, originalURL) {
  const { pathname } = new URL(originalURL);
  if (STUB_TITLES[pathname]) return STUB_TITLES[pathname];
  const raw = (document.title || '').trim();
  // doc.govt.nz titles read "Page name: Section" — keep the page name only.
  return raw.split(':')[0].trim() || 'Placeholder';
}

export default {
  transform: (payload) => {
    const { document, params } = payload;
    const originalURL = params.originalURL;
    const title = resolveTitle(document, originalURL);

    // Build a fresh container so no source chrome/content leaks into the stub.
    const main = document.createElement('div');

    // hero-banner block: a single text row carrying the title as an H1.
    const heading = document.createElement('h1');
    heading.textContent = title;

    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));
    textCell.appendChild(heading);

    const block = WebImporter.Blocks.createBlock(document, {
      name: 'hero-banner',
      cells: [[textCell]],
    });
    main.appendChild(block);

    // Minimal metadata block: just the Title.
    const hr = document.createElement('hr');
    main.appendChild(hr);

    const metaTable = document.createElement('table');
    const headRow = document.createElement('tr');
    const th = document.createElement('th');
    th.textContent = 'Metadata';
    headRow.appendChild(th);
    metaTable.appendChild(headRow);

    const titleRow = document.createElement('tr');
    const keyCell = document.createElement('td');
    keyCell.textContent = 'Title';
    const valCell = document.createElement('td');
    valCell.textContent = title;
    titleRow.append(keyCell, valCell);
    metaTable.appendChild(titleRow);

    main.appendChild(metaTable);

    const path = WebImporter.FileUtils.sanitizePath(
      new URL(originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
    );

    return [{
      element: main,
      path,
      report: {
        title,
        template: 'stub',
        blocks: ['hero-banner'],
      },
    }];
  },
};
