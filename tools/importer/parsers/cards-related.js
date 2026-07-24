/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-related. Base: cards (container block).
 * Source: https://www.doc.govt.nz (content-page + programme-landing templates)
 * Model (blocks/cards-related/_cards-related.json): container with child `card`
 *   { image (reference) + imageAlt (collapsed) + text (richtext) }.
 *
 * Container block: one ROW per card, TWO columns:
 *   col1 -> field:image (the card image; imageAlt collapses into <img alt>)
 *   col2 -> field:text  (linked title heading + description, kept as rich text)
 *
 * Handles BOTH source DOM shapes (detected by structure, not a single fixed path):
 *   A) content-page:      #footer-related .card                 -> img + h3.card_header>a.card_link + p description
 *   B) programme-landing: .products-container .product-card (an <a>) -> .product-media img + .product-info title/description
 */
export default function parse(element, { document }) {
  // Locate the card elements for whichever shape was matched.
  // (element may be the container itself, or in the union it may be a single card.)
  let cards = Array.from(element.querySelectorAll('.product-card, .card'));
  // If the element IS a single card (union selector matched one card), use it directly.
  if (cards.length === 0 && element.matches && element.matches('.product-card, .card')) {
    cards = [element];
  }

  const cells = [];

  cards.forEach((card) => {
    // --- Image (col1) ---
    const img = card.querySelector('.product-media img, img');

    // --- Title + description (col2) ---
    // Title: linked heading. Shape A uses h3.card_header > a.card_link; shape B uses the
    // .product-card anchor's title, with the visible title text in the first .product-info div.
    let titleEl = card.querySelector('h1, h2, h3, h4, .card_header');

    // The card's own link (whole-card anchor in shape B, or the title link in shape A).
    const cardAnchor = card.matches('a') ? card : card.querySelector('a[href]');

    // Description container.
    //   Shape A (content-page): paragraphs inside `.flex.flex-col.items-start.gap-5`.
    //   Shape B (programme-landing): `.product-description`.
    const descContainer = card.querySelector('.product-description, .flex.flex-col.items-start.gap-5');

    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));

    if (titleEl) {
      // Shape A: title is already a heading with an inner link — keep as-is.
      textCell.appendChild(titleEl);
    } else {
      // Shape B: build a linked heading from the product title text + card anchor href.
      const titleText = card.querySelector('.product-info > div')
        || (cardAnchor && cardAnchor.getAttribute('title') ? null : null);
      const href = cardAnchor ? cardAnchor.getAttribute('href') : null;
      const label = titleText
        ? titleText.textContent.trim()
        : (cardAnchor ? (cardAnchor.getAttribute('title') || cardAnchor.textContent.trim()) : '');
      if (label) {
        const h3 = document.createElement('h3');
        if (href) {
          const a = document.createElement('a');
          a.setAttribute('href', href);
          a.textContent = label;
          h3.appendChild(a);
        } else {
          h3.textContent = label;
        }
        textCell.appendChild(h3);
      }
    }

    if (descContainer) {
      // Prefer contained <p> elements; otherwise wrap the container's text in a paragraph.
      const paras = Array.from(descContainer.querySelectorAll('p'));
      if (paras.length) {
        paras.forEach((p) => {
          if (p.textContent.trim()) textCell.appendChild(p);
        });
      } else if (descContainer.textContent.trim()) {
        const p = document.createElement('p');
        p.textContent = descContainer.textContent.trim();
        textCell.appendChild(p);
      }
    }

    // Build the row: [image cell, text cell]. Image cell must exist even if empty.
    const imageCell = document.createDocumentFragment();
    if (img) {
      imageCell.appendChild(document.createComment(' field:image '));
      imageCell.appendChild(img);
    }

    cells.push([imageCell, textCell]);
  });

  // Empty-block guard: no cards found.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-related', cells });
  element.replaceWith(block);
}
