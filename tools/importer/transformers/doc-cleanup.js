/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: doc.govt.nz (Department of Conservation NZ) site-wide cleanup.
 *
 * Removes non-authorable site chrome so the import contains only page-level
 * authorable content. Robust for the `content-page`, `programme-landing`, and
 * `booking-form` templates (same site shell).
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
 *  - booking-form template: #doc-content-box contains an authorable EPiServer
 *    form (div.block.formcontainerblockwithcustomdefaultvalues >
 *    form.EPiServerForms, cleaned.html line ~491). We KEEP the form and all of
 *    its authorable definition (h2.Form__Title, legends/labels
 *    .Form__Element__Caption, radio/text/date field inputs, .FormParagraphText
 *    helper notes, and button.FormSubmitButton) so the form-booking parser can
 *    recover field semantics. We ONLY strip EPiServer plumbing that is not
 *    authorable content (see the beforeTransform block below). The same
 *    EPiServer form markup also backs the site-wide feedback widget inside
 *    #footer-feedback-container (cleaned.html line ~893), which is removed
 *    wholesale in afterTransform.
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

    // --- EPiServer form plumbing (non-authorable) ---
    // The booking-form template keeps the authorable EPiServer form inside
    // #doc-content-box (form.EPiServerForms) so the form-booking parser can
    // recover field semantics. We strip ONLY the non-authorable plumbing here,
    // in beforeTransform, so the parser (which runs between the hooks) sees a
    // clean form and never pulls this chrome into the extracted field
    // definition. Everything authorable — h2.Form__Title, fieldset/legend and
    // label .Form__Element__Caption, the radio/text/number/date field inputs
    // (.FormChoice__Input / .FormTextbox__Input / .FormDateTime__Input),
    // .FormParagraphText helper notes, and button.FormSubmitButton — is left
    // untouched. All class names below were verified in cleaned.html.
    //
    // NOTE: The site-wide feedback widget (#footer-feedback-container) is ALSO
    // an EPiServer form and is removed wholesale in afterTransform; these same
    // selectors additionally clean its plumbing early, which is harmless.
    WebImporter.DOMUtils.remove(element, [
      // System hidden inputs: form GUID / channel / partial-view plumbing.
      //   cleaned.html booking form lines ~493-497 (Form__SystemElement),
      //   feedback form lines ~894-898 / ~927 / ~932.
      'input.FormHidden',
      // Bare, attribute-stripped token/anti-forgery inputs the scraper left
      //   classless (cleaned.html lines ~498 and ~899). Real form fields all
      //   carry Form* classes, so this cannot match an authorable field.
      'form.EPiServerForms input:not([class])',
      // Empty submit-result status region (cleaned.html lines ~500-503).
      '.Form__Status',
      // Empty per-field ARIA validation-error placeholders (many, e.g. line
      //   ~519); they carry no field semantics.
      'span.Form__Element__ValidationError',
      // reCAPTCHA field block inside an EPiServer form (feedback widget:
      //   .recaptchaelementblock / .FormRecaptcha, cleaned.html ~916). Not part
      //   of the authorable form definition. (The booking form has none.)
      '.recaptchaelementblock',
      '.FormRecaptcha',
      // Hidden page-name / page-url system field blocks (feedback widget,
      //   cleaned.html ~925 / ~930).
      '.hiddenpagenameelement',
      '.hiddenpageurlelement',
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
