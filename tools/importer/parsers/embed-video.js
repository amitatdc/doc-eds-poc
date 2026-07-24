/* eslint-disable */
/* global WebImporter */
/**
 * Parser for embed-video. Base: embed.
 * Source: https://www.doc.govt.nz (content-page template only)
 * Model (blocks/embed-video/_embed-video.json):
 *   embed_placeholder (reference, optional poster image) + embed_placeholderAlt (collapsed)
 *   + embed_uri (text, the video URL).
 *   All fields share the `embed_` prefix -> grouped into ONE cell (per field-hinting rules).
 *
 * Source shape: <p class="fullwidthimagecentre"><iframe src=".../youtube.com/embed/ID"></iframe></p>
 * The element may be the <iframe> itself or the wrapping <p> (both appear in instances[]).
 *
 * Block table: 1 column, 1 content row.
 *   Row: [ field:embed_placeholder (if a poster image exists) + field:embed_uri (watch URL) ]
 */
export default function parse(element, { document }) {
  // Resolve the iframe whether we were handed the iframe or its wrapper.
  const iframe = element.matches && element.matches('iframe')
    ? element
    : element.querySelector('iframe[src]');

  const rawSrc = iframe ? iframe.getAttribute('src') : null;

  // Optional poster/placeholder image (source currently has none, but handle it).
  const posterImg = element.matches && element.matches('iframe')
    ? null
    : element.querySelector('img');

  // Empty-block guard: no embeddable URL.
  if (!rawSrc) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Normalize YouTube /embed/ID to a canonical watch URL (embed-block convention).
  let uri = rawSrc.trim();
  const ytMatch = uri.match(/youtube\.com\/embed\/([^/?#]+)/i);
  if (ytMatch) {
    uri = `https://www.youtube.com/watch?v=${ytMatch[1]}`;
  }

  // Build the single grouped cell (embed_ prefix -> one cell).
  const cell = document.createDocumentFragment();

  // Poster image goes above the link, only if present (field:embed_placeholder).
  if (posterImg) {
    cell.appendChild(document.createComment(' field:embed_placeholder '));
    cell.appendChild(posterImg);
  }

  // Video URL as a link (field:embed_uri).
  cell.appendChild(document.createComment(' field:embed_uri '));
  const link = document.createElement('a');
  link.setAttribute('href', uri);
  link.textContent = uri;
  cell.appendChild(link);

  const cells = [[cell]]; // 1 column: one row, one cell holding all grouped content.

  const block = WebImporter.Blocks.createBlock(document, { name: 'embed-video', cells });
  element.replaceWith(block);
}
