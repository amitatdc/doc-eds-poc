/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroBannerParser from './parsers/hero-banner.js';
import cardsRelatedParser from './parsers/cards-related.js';
import embedVideoParser from './parsers/embed-video.js';

// TRANSFORMER IMPORTS
import docCleanupTransformer from './transformers/doc-cleanup.js';

// PARSER REGISTRY
const parsers = {
  'hero-banner': heroBannerParser,
  'cards-related': cardsRelatedParser,
  'embed-video': embedVideoParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'content-page',
  description: 'Standard content article page: hero banner with title, intro overview, and a long-form prose content box (headings, paragraphs, lists, embedded video). May include a related-links cards grid in the footer region.',
  urls: [
    'https://www.doc.govt.nz/get-involved/apply-for-permits/how-we-regulate/',
    'https://www.doc.govt.nz/our-work/save-our-iconic-kiwi/',
  ],
  blocks: [
    {
      name: 'hero-banner',
      instances: ['section.doc-main-layout__hero .hero', 'section.doc-main-layout__hero'],
    },
    {
      name: 'embed-video',
      instances: ['#doc-content-box iframe[src*="youtube.com/embed"]', '#doc-content-box p.fullwidthimagecentre:has(iframe)'],
    },
    {
      name: 'cards-related',
      instances: ['#footer-related', 'footer section.w-full.bg-white .doc-main-layout__related__content'],
    },
  ],
};

// TRANSFORMER REGISTRY
const transformers = [
  docCleanupTransformer,
];

// SAMPLE CUSTOM PAGE PROPERTIES - keyed by pathname
// Mirrors the custom fields added to models/_page.json (page-metadata model).
const SAMPLE_PAGE_PROPERTIES = {
  '/get-involved/apply-for-permits/how-we-regulate/': {
    'Page Owner': 'Jane Doe',
    'Internal Department': 'Permissions',
    'Review Date': '2027-07-24',
    Confidentiality: 'Public',
  },
  '/our-work/save-our-iconic-kiwi/': {
    'Page Owner': 'Tim Raemaekers',
    'Internal Department': 'Threatened Species',
    'Review Date': '2027-07-24',
    Confidentiality: 'Public',
  },
};

/**
 * Append custom page-property rows to the Metadata block produced by
 * WebImporter.rules.createMetadata. That block is a <table> whose first row is
 * a <th>Metadata</th> header and whose data rows are <tr><td>label</td><td>value</td></tr>.
 * We locate it as the last <table> in main whose header cell reads "Metadata".
 */
function appendCustomMetadata(main, document, originalURL) {
  const { pathname } = new URL(originalURL);
  const props = SAMPLE_PAGE_PROPERTIES[pathname];
  if (!props) return;

  const tables = [...main.querySelectorAll('table')];
  const metaTable = tables.reverse().find((t) => {
    const th = t.querySelector('th');
    return th && th.textContent.trim().toLowerCase() === 'metadata';
  });
  if (!metaTable) return;

  Object.entries(props).forEach(([label, value]) => {
    const row = document.createElement('tr');
    const keyCell = document.createElement('td');
    keyCell.textContent = label;
    const valCell = document.createElement('td');
    valCell.textContent = value;
    row.append(keyCell, valCell);
    metaTable.append(row);
  });
}

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration.
 * De-duplicates by DOM element so overlapping fallback selectors do not
 * cause the same block to be parsed twice.
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  const seen = new Set();

  template.blocks.forEach((blockDef) => {
    let matchedForBlock = false;
    blockDef.instances.forEach((selector) => {
      if (matchedForBlock) return; // instances are ordered fallbacks; first match wins
      let elements;
      try {
        elements = document.querySelectorAll(selector);
      } catch (e) {
        console.warn(`Invalid selector for "${blockDef.name}": ${selector}`);
        return;
      }
      if (elements.length === 0) return;
      elements.forEach((element) => {
        if (seen.has(element)) return;
        seen.add(element);
        pageBlocks.push({ name: blockDef.name, selector, element });
        matchedForBlock = true;
      });
    });
    if (!matchedForBlock) {
      console.warn(`Block "${blockDef.name}" not found on page`);
    }
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. beforeTransform (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // already replaced by earlier parser
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (final cleanup)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    appendCustomMetadata(main, document, params.originalURL);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
