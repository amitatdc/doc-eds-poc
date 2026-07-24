/**
 * loads and decorates the hero-banner block
 * @param {Element} block The hero-banner block element
 */
export default function decorate(block) {
  // No decoration required: the hero-banner renders its background image and
  // heading directly from the authored content structure.
  block.classList.add('hero-banner-decorated');
}
