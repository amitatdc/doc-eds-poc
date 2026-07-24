/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-banner. Base: hero.
 * Source: https://www.doc.govt.nz (content-page + programme-landing templates)
 * Model (blocks/hero-banner/_hero-banner.json): image (reference) + imageAlt (collapsed) + text (richtext).
 *
 * Handles BOTH template shapes robustly (detected by structure, not a fixed class path):
 *   - element may be `section.doc-main-layout__hero` OR the inner `.hero` div
 *   - banner image lives in a <picture> (or bare <img>) inside a hero image container
 *   - title is an <h1> (fallback h2)
 *
 * Block table: 1 column.
 *   Row 1 (block name) is added by createBlock.
 *   Row 2: image  -> field:image (imageAlt collapses into the <img alt>)
 *   Row 3: text   -> field:text (the H1 heading)
 */
export default function parse(element, { document }) {
  // Normalize: whether we were handed the section or the inner .hero, work from the
  // element itself so both instance selectors resolve the same content.
  const scope = element.querySelector('.hero') || element;

  // Banner image: prefer a <picture>; otherwise fall back to a standalone <img>.
  const picture = scope.querySelector('picture');
  const img = scope.querySelector('img[class*="hero"], picture img, img');
  const imageEl = picture || img;

  // Title: H1 first (both templates use an H1 in the hero), then H2 as a fallback.
  const heading = scope.querySelector('h1, h2, [class*="doc-h1"]');

  // Empty-block guard: nothing meaningful to migrate.
  if (!imageEl && !heading) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row: image (field:image). imageAlt is a collapsed field carried on the <img alt>.
  if (imageEl) {
    const imageCell = document.createDocumentFragment();
    imageCell.appendChild(document.createComment(' field:image '));
    imageCell.appendChild(imageEl);
    cells.push([imageCell]);
  }

  // Row: text (field:text) — the hero heading, kept as semantic HTML.
  if (heading) {
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));
    textCell.appendChild(heading);
    cells.push([textCell]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-banner', cells });
  element.replaceWith(block);
}
