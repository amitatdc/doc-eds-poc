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

  // tools/importer/import-content-page.js
  var import_content_page_exports = {};
  __export(import_content_page_exports, {
    default: () => import_content_page_default
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

  // tools/importer/parsers/cards-related.js
  function parse2(element, { document }) {
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

  // tools/importer/parsers/embed-video.js
  function parse3(element, { document }) {
    const iframe = element.matches && element.matches("iframe") ? element : element.querySelector("iframe[src]");
    const rawSrc = iframe ? iframe.getAttribute("src") : null;
    const posterImg = element.matches && element.matches("iframe") ? null : element.querySelector("img");
    if (!rawSrc) {
      element.replaceWith(...element.childNodes);
      return;
    }
    let uri = rawSrc.trim();
    const ytMatch = uri.match(/youtube\.com\/embed\/([^/?#]+)/i);
    if (ytMatch) {
      uri = `https://www.youtube.com/watch?v=${ytMatch[1]}`;
    }
    const cell = document.createDocumentFragment();
    if (posterImg) {
      cell.appendChild(document.createComment(" field:embed_placeholder "));
      cell.appendChild(posterImg);
    }
    cell.appendChild(document.createComment(" field:embed_uri "));
    const link = document.createElement("a");
    link.setAttribute("href", uri);
    link.textContent = uri;
    cell.appendChild(link);
    const cells = [[cell]];
    const block = WebImporter.Blocks.createBlock(document, { name: "embed-video", cells });
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

  // tools/importer/import-content-page.js
  var parsers = {
    "hero-banner": parse,
    "cards-related": parse2,
    "embed-video": parse3
  };
  var PAGE_TEMPLATE = {
    name: "content-page",
    description: "Standard content article page: hero banner with title, intro overview, and a long-form prose content box (headings, paragraphs, lists, embedded video). May include a related-links cards grid in the footer region.",
    urls: [
      "https://www.doc.govt.nz/get-involved/apply-for-permits/how-we-regulate/",
      "https://www.doc.govt.nz/our-work/save-our-iconic-kiwi/"
    ],
    blocks: [
      {
        name: "hero-banner",
        instances: ["section.doc-main-layout__hero .hero", "section.doc-main-layout__hero"]
      },
      {
        name: "embed-video",
        instances: ['#doc-content-box iframe[src*="youtube.com/embed"]', "#doc-content-box p.fullwidthimagecentre:has(iframe)"]
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
  var SAMPLE_PAGE_PROPERTIES = {
    "/get-involved/apply-for-permits/how-we-regulate/": {
      "Page Owner": "Jane Doe",
      "Internal Department": "Permissions",
      "Review Date": "2027-07-24",
      Confidentiality: "Public"
    },
    "/our-work/save-our-iconic-kiwi/": {
      "Page Owner": "Tim Raemaekers",
      "Internal Department": "Threatened Species",
      "Review Date": "2027-07-24",
      Confidentiality: "Public"
    }
  };
  function appendCustomMetadata(main, document, originalURL) {
    const { pathname } = new URL(originalURL);
    const props = SAMPLE_PAGE_PROPERTIES[pathname];
    if (!props) return;
    const tables = [...main.querySelectorAll("table")];
    const metaTable = tables.reverse().find((t) => {
      const th = t.querySelector("th");
      return th && th.textContent.trim().toLowerCase() === "metadata";
    });
    if (!metaTable) return;
    Object.entries(props).forEach(([label, value]) => {
      const row = document.createElement("tr");
      const keyCell = document.createElement("td");
      keyCell.textContent = label;
      const valCell = document.createElement("td");
      valCell.textContent = value;
      row.append(keyCell, valCell);
      metaTable.append(row);
    });
  }
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
  var import_content_page_default = {
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
      appendCustomMetadata(main, document, params.originalURL);
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
  return __toCommonJS(import_content_page_exports);
})();
