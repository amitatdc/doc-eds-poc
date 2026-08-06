/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroBannerParser from './parsers/hero-banner.js';
import formBookingParser from './parsers/form-booking.js';
import cardsRelatedParser from './parsers/cards-related.js';

// TRANSFORMER IMPORTS
import docCleanupTransformer from './transformers/doc-cleanup.js';

// PARSER REGISTRY
const parsers = {
  'hero-banner': heroBannerParser,
  'form-booking': formBookingParser,
  'cards-related': cardsRelatedParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'booking-form',
  description: 'Booking/enquiry form page: hero banner with title, intro overview, and a long-form form (radio-button choice groups, text inputs, number and date fields, statistical questions, and a submit button) rendered inside the content box. May include a related-links cards grid in the footer region.',
  urls: [
    'https://www.doc.govt.nz/parks-and-recreation/places-to-go/central-north-island/places/tongariro-national-park/things-to-do/tracks/tongariro-alpine-crossing-bookings/booking-form/',
  ],
  blocks: [
    {
      name: 'hero-banner',
      instances: ['section.doc-main-layout__hero .hero', 'section.doc-main-layout__hero'],
    },
    {
      name: 'form-booking',
      instances: ['#doc-content-box .block.formcontainerblockwithcustomdefaultvalues', '#doc-content-box form.EPiServerForms'],
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
