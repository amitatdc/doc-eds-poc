/* eslint-disable */
/* global WebImporter */
/**
 * Parser for form-booking. Base: form (definition-driven AEM boilerplate form block).
 * Source: https://www.doc.govt.nz/.../tongariro-alpine-crossing-bookings/booking-form/ (booking-form template)
 *
 * BLOCK CONTRACT (blocks/form-booking/form-booking.js + _form-booking.json):
 *   The block is DEFINITION-DRIVEN — it does NOT consume inline field markup.
 *   decorate() collects every <a> inside the block, then:
 *     - formLink  = a SAME-ORIGIN anchor whose href ends with `.json` -> the form DEFINITION source
 *     - submitLink = any OTHER anchor                                 -> the submit / action URL
 *   The model (_form-booking.json) is a SIMPLE block with two scalar fields:
 *     - reference (aem-content, "Form")     -> link to the form-definition spreadsheet/JSON
 *     - action    (text,        "Action URL") -> the submit endpoint
 *
 * XWALK SIMPLE-BLOCK TABLE (one row per model field; each cell field-hinted, hint BEFORE content):
 *   Row 1 (block name) is added by createBlock.
 *   Row 2: field:reference -> <a href="....json"> to the form definition source
 *   Row 3: field:action    -> <a href="..."> to the submit / action endpoint
 *
 * WHY LINKS ARE SYNTHESIZED:
 *   The source is an EPiServer inline form (form.EPiServerForms). It has NO external JSON
 *   definition and NO action attribute (it posts back to the page). The full field inventory
 *   (radio choice groups, number/date/text/tel/email inputs, fieldsets, helper notes, submit —
 *   recovered from legends / Form__Element__Caption / FormChoice options in the source) lives
 *   in the SEPARATE form-definition spreadsheet that this block references. This parser emits
 *   the model-driven, field-hinted 2-field shape and synthesizes the definition + action links
 *   (a human wires the real definition/submit endpoints post-import). Existing same-origin
 *   `.json` / action attributes in the source are preferred over the synthesized fallbacks.
 */
export default function parse(element, { document }) {
  // Normalize: the union selectors may hand us the outer
  // `.block.formcontainerblockwithcustomdefaultvalues` container OR the inner
  // `form.EPiServerForms`. Work from the <form> when we can find one.
  const form = (element.matches && element.matches('form'))
    ? element
    : (element.querySelector('form.EPiServerForms, form') || element);

  // Empty-block guard: nothing form-like to migrate.
  const isFormLike = (form.matches && form.matches('form'))
    || form.querySelector('form, .Form__Title, .FormSubmitButton, .Form__Element, [class*="Form"]');
  if (!isFormLike) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Derive a stable slug from the form title, used to label/scaffold the definition + action links.
  const titleEl = form.querySelector('.Form__Title, h2, h1');
  const title = (titleEl && titleEl.textContent.trim()) || 'Booking form';
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'booking-form';

  // --- reference (field:reference): link to the form-definition source (spreadsheet/JSON) ---
  // Prefer an existing same-origin .json link if present in the source; otherwise synthesize one.
  const existingJson = Array.from(form.querySelectorAll('a[href$=".json"]'))
    .find((a) => a.getAttribute('href'));
  const referenceHref = existingJson
    ? existingJson.getAttribute('href')
    : `/forms/${slug}.json`;
  const referenceLink = document.createElement('a');
  referenceLink.setAttribute('href', referenceHref);
  referenceLink.textContent = title;

  // --- action (field:action): the submit / action endpoint ---
  // EPiServer form has no action attribute (posts back to the page); use one if present,
  // else synthesize a submit endpoint. Kept as an anchor so the block finds a second link.
  const actionHref = form.getAttribute('action')
    || form.getAttribute('data-action')
    || `/forms/${slug}-submit`;
  const submitButton = form.querySelector('.FormSubmitButton, button[type="submit"], button');
  const actionLabel = (submitButton && submitButton.textContent.trim()) || 'Submit';
  const actionLink = document.createElement('a');
  actionLink.setAttribute('href', actionHref);
  actionLink.textContent = actionLabel;

  const cells = [];

  // Row: reference — the form definition source (field hint BEFORE content).
  const referenceCell = document.createDocumentFragment();
  referenceCell.appendChild(document.createComment(' field:reference '));
  referenceCell.appendChild(referenceLink);
  cells.push([referenceCell]);

  // Row: action — the submit / action URL (field hint BEFORE content).
  const actionCell = document.createDocumentFragment();
  actionCell.appendChild(document.createComment(' field:action '));
  actionCell.appendChild(actionLink);
  cells.push([actionCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'form-booking', cells });
  element.replaceWith(block);
}
