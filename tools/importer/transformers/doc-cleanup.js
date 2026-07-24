/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: doc.govt.nz (Department of Conservation NZ) site-wide cleanup.
 *
 * Removes non-authorable site chrome so the import contains only page-level
 * authorable content. Robust for both the `content-page` and
 * `programme-landing` templates (same site shell).
 *
 * All selectors below were verified against migration-work/cleaned.html.
 *
 * IMPORTANT nuances preserved:
 *  - The <footer> region contains BOTH real page content
 *    (#footer-related / .doc-main-layout__related = the "Related" cards grid,
 *    mapped as the cards-related block) AND true site-footer chrome
 *    (#footer-feedback-container / .doc-main-layout__feedback = feedback widget,
 *    and #footerId = social links / govt.nz / copyright nav). We must strip the
 *    chrome but keep the Related cards, so we DO NOT remove the whole <footer>.
 *  - #doc-content-box contains a YouTube embed iframe (real content, the
 *    embed-video block). We must NOT blanket-remove <iframe> in beforeTransform,
 *    or the embed-video parser (which runs between hooks) would have nothing to
 *    extract. Widget iframes (reCAPTCHA, empty trailing iframe) are removed by
 *    their specific containers/attributes instead.
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Widgets / tracking that could interfere with block matching.
    // Verified in cleaned.html:
    //   - .grecaptcha-badge / .grecaptcha-logo (reCAPTCHA widget, line ~749)
    //   - reCAPTCHA anchor iframe (line ~751)
    // These are removed before parsing so they never get pulled into a block.
    WebImporter.DOMUtils.remove(element, [
      '.grecaptcha-badge',
      '.grecaptcha-logo',
      '.grecaptcha-error',
      'iframe[src*="google.com/recaptcha"]',
      'textarea.g-recaptcha-response',
      '[id^="g-recaptcha-response"]',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // --- Non-authorable site chrome (verified in cleaned.html) ---
    WebImporter.DOMUtils.remove(element, [
      // Skip-to-content link wrapper (line ~5-7)
      '#skip-to-content',
      // Site header / global navigation (line ~10-404)
      'header',
      // Breadcrumb region (line ~405)
      '.doc-main-layout__breadcrumb',
      // Feedback form widget inside <footer> (line ~585) — chrome, NOT content.
      // Target both the container id and the layout class per excludedRegions.
      '#footer-feedback-container',
      '.doc-main-layout__feedback',
      '#footer-feedback',
      '#feedbackInFooter',
      // True site footer: social links / govt.nz / copyright nav (line ~663)
      '#footerId',
      // Empty trailing iframe left after reCAPTCHA widget (line ~759)
      'iframe:not([src])',
    ]);

    // NOTE: We intentionally do NOT remove <footer> itself, nor
    // #footer-related / .doc-main-layout__related, because that subtree is the
    // real "Related" cards grid (mapped as cards-related).

    // Safe leftover element cleanup (do not touch content iframes such as the
    // YouTube embed inside #doc-content-box).
    WebImporter.DOMUtils.remove(element, [
      'script',
      'noscript',
      'style',
      'link',
      'source',
    ]);
  }
}
