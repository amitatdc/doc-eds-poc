/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-booking-form.js
  var import_booking_form_exports = {};
  __export(import_booking_form_exports, {
    default: () => import_booking_form_default
  });

  // tools/importer/parsers/hero-banner.js
  function parse(element, { document }) {
    const scope = element.querySelector(".hero") || element;
    const picture = scope.querySelector("picture");
    const img = scope.querySelector('img[class*="hero"], picture img, img');
    const imageEl = picture || img;
    const heading = scope.querySelector('h1, h2, [class*="doc-h1"]');
    if (!imageEl && !heading) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (imageEl) {
      const imageCell = document.createDocumentFragment();
      imageCell.appendChild(document.createComment(" field:image "));
      imageCell.appendChild(imageEl);
      cells.push([imageCell]);
    }
    if (heading) {
      const textCell = document.createDocumentFragment();
      textCell.appendChild(document.createComment(" field:text "));
      textCell.appendChild(heading);
      cells.push([textCell]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/form-booking.js
  function parse2(element, { document }) {
    const form = element.matches && element.matches("form") ? element : element.querySelector("form.EPiServerForms, form") || element;
    const isFormLike = form.matches && form.matches("form") || form.querySelector('form, .Form__Title, .FormSubmitButton, .Form__Element, [class*="Form"]');
    if (!isFormLike) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const titleEl = form.querySelector(".Form__Title, h2, h1");
    const title = titleEl && titleEl.textContent.trim() || "Booking form";
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "booking-form";
    const existingJson = Array.from(form.querySelectorAll('a[href$=".json"]')).find((a) => a.getAttribute("href"));
    const referenceHref = existingJson ? existingJson.getAttribute("href") : `/forms/${slug}.json`;
    const referenceLink = document.createElement("a");
    referenceLink.setAttribute("href", referenceHref);
    referenceLink.textContent = title;
    const actionHref = form.getAttribute("action") || form.getAttribute("data-action") || `/forms/${slug}-submit`;
    const submitButton = form.querySelector('.FormSubmitButton, button[type="submit"], button');
    const actionLabel = submitButton && submitButton.textContent.trim() || "Submit";
    const actionLink = document.createElement("a");
    actionLink.setAttribute("href", actionHref);
    actionLink.textContent = actionLabel;
    const cells = [];
    const referenceCell = document.createDocumentFragment();
    referenceCell.appendChild(document.createComment(" field:reference "));
    referenceCell.appendChild(referenceLink);
    cells.push([referenceCell]);
    const actionCell = document.createDocumentFragment();
    actionCell.appendChild(document.createComment(" field:action "));
    actionCell.appendChild(actionLink);
    cells.push([actionCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "form-booking", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-related.js
  function parse3(element, { document }) {
    let cards = Array.from(element.querySelectorAll(".product-card, .card"));
    if (cards.length === 0 && element.matches && element.matches(".product-card, .card")) {
      cards = [element];
    }
    const cells = [];
    cards.forEach((card) => {
      const img = card.querySelector(".product-media img, img");
      let titleEl = card.querySelector("h1, h2, h3, h4, .card_header");
      const cardAnchor = card.matches("a") ? card : card.querySelector("a[href]");
      const descContainer = card.querySelector(".product-description, .flex.flex-col.items-start.gap-5");
      const textCell = document.createDocumentFragment();
      textCell.appendChild(document.createComment(" field:text "));
      if (titleEl) {
        textCell.appendChild(titleEl);
      } else {
        const titleText = card.querySelector(".product-info > div") || (cardAnchor && cardAnchor.getAttribute("title") ? null : null);
        const href = cardAnchor ? cardAnchor.getAttribute("href") : null;
        const label = titleText ? titleText.textContent.trim() : cardAnchor ? cardAnchor.getAttribute("title") || cardAnchor.textContent.trim() : "";
        if (label) {
          const h3 = document.createElement("h3");
          if (href) {
            const a = document.createElement("a");
            a.setAttribute("href", href);
            a.textContent = label;
            h3.appendChild(a);
          } else {
            h3.textContent = label;
          }
          textCell.appendChild(h3);
        }
      }
      if (descContainer) {
        const paras = Array.from(descContainer.querySelectorAll("p"));
        if (paras.length) {
          paras.forEach((p) => {
            if (p.textContent.trim()) textCell.appendChild(p);
          });
        } else if (descContainer.textContent.trim()) {
          const p = document.createElement("p");
          p.textContent = descContainer.textContent.trim();
          textCell.appendChild(p);
        }
      }
      const imageCell = document.createDocumentFragment();
      if (img) {
        imageCell.appendChild(document.createComment(" field:image "));
        imageCell.appendChild(img);
      }
      cells.push([imageCell, textCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-related", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/doc-cleanup.js
  var TransformHook = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".grecaptcha-badge",
        ".grecaptcha-logo",
        ".grecaptcha-error",
        'iframe[src*="google.com/recaptcha"]',
        "textarea.g-recaptcha-response",
        '[id^="g-recaptcha-response"]'
      ]);
      WebImporter.DOMUtils.remove(element, [
        // System hidden inputs: form GUID / channel / partial-view plumbing.
        //   cleaned.html booking form lines ~493-497 (Form__SystemElement),
        //   feedback form lines ~894-898 / ~927 / ~932.
        "input.FormHidden",
        // Bare, attribute-stripped token/anti-forgery inputs the scraper left
        //   classless (cleaned.html lines ~498 and ~899). Real form fields all
        //   carry Form* classes, so this cannot match an authorable field.
        "form.EPiServerForms input:not([class])",
        // Empty submit-result status region (cleaned.html lines ~500-503).
        ".Form__Status",
        // Empty per-field ARIA validation-error placeholders (many, e.g. line
        //   ~519); they carry no field semantics.
        "span.Form__Element__ValidationError",
        // reCAPTCHA field block inside an EPiServer form (feedback widget:
        //   .recaptchaelementblock / .FormRecaptcha, cleaned.html ~916). Not part
        //   of the authorable form definition. (The booking form has none.)
        ".recaptchaelementblock",
        ".FormRecaptcha",
        // Hidden page-name / page-url system field blocks (feedback widget,
        //   cleaned.html ~925 / ~930).
        ".hiddenpagenameelement",
        ".hiddenpageurlelement"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        // Skip-to-content link wrapper (line ~5-7)
        "#skip-to-content",
        // Site header / global navigation (line ~10-404)
        "header",
        // Breadcrumb region (line ~405)
        ".doc-main-layout__breadcrumb",
        // Feedback form widget inside <footer> (line ~585) — chrome, NOT content.
        // Target both the container id and the layout class per excludedRegions.
        "#footer-feedback-container",
        ".doc-main-layout__feedback",
        "#footer-feedback",
        "#feedbackInFooter",
        // True site footer: social links / govt.nz / copyright nav (line ~663)
        "#footerId",
        // Empty trailing iframe left after reCAPTCHA widget (line ~759)
        "iframe:not([src])"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "script",
        "noscript",
        "style",
        "link",
        "source"
      ]);
    }
  }

  // tools/importer/import-booking-form.js
  var parsers = {
    "hero-banner": parse,
    "form-booking": parse2,
    "cards-related": parse3
  };
  var PAGE_TEMPLATE = {
    name: "booking-form",
    description: "Booking/enquiry form page: hero banner with title, intro overview, and a long-form form (radio-button choice groups, text inputs, number and date fields, statistical questions, and a submit button) rendered inside the content box. May include a related-links cards grid in the footer region.",
    urls: [
      "https://www.doc.govt.nz/parks-and-recreation/places-to-go/central-north-island/places/tongariro-national-park/things-to-do/tracks/tongariro-alpine-crossing-bookings/booking-form/"
    ],
    blocks: [
      {
        name: "hero-banner",
        instances: ["section.doc-main-layout__hero .hero", "section.doc-main-layout__hero"]
      },
      {
        name: "form-booking",
        instances: ["#doc-content-box .block.formcontainerblockwithcustomdefaultvalues", "#doc-content-box form.EPiServerForms"]
      },
      {
        name: "cards-related",
        instances: ["#footer-related", "footer section.w-full.bg-white .doc-main-layout__related__content"]
      }
    ]
  };
  var transformers = [
    transform
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    const seen = /* @__PURE__ */ new Set();
    template.blocks.forEach((blockDef) => {
      let matchedForBlock = false;
      blockDef.instances.forEach((selector) => {
        if (matchedForBlock) return;
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
  var import_booking_form_default = {
    transform: (payload) => {
      const {
        document,
        url,
        html,
        params
      } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_booking_form_exports);
})();
