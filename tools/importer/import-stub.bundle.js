/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
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

  // tools/importer/import-stub.js
  var import_stub_exports = {};
  __export(import_stub_exports, {
    default: () => import_stub_default
  });
  var STUB_TITLES = {
    "/get-involved/conservation-activities/attract-birds-to-your-garden/": "Attract birds to your garden",
    "/our-work/motukarara-conservation-nursery/": "Motuk\u0101rara Wholesale Conservation Nursery",
    "/about-us/science-publications/conservation-publications/nz-threat-classification-system/": "New Zealand Threat Classification System"
  };
  function resolveTitle(document, originalURL) {
    const { pathname } = new URL(originalURL);
    if (STUB_TITLES[pathname]) return STUB_TITLES[pathname];
    const raw = (document.title || "").trim();
    return raw.split(":")[0].trim() || "Placeholder";
  }
  var import_stub_default = {
    transform: (payload) => {
      const { document, params } = payload;
      const originalURL = params.originalURL;
      const title = resolveTitle(document, originalURL);
      const main = document.createElement("div");
      const heading = document.createElement("h1");
      heading.textContent = title;
      const textCell = document.createDocumentFragment();
      textCell.appendChild(document.createComment(" field:text "));
      textCell.appendChild(heading);
      const block = WebImporter.Blocks.createBlock(document, {
        name: "hero-banner",
        cells: [[textCell]]
      });
      main.appendChild(block);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      const metaTable = document.createElement("table");
      const headRow = document.createElement("tr");
      const th = document.createElement("th");
      th.textContent = "Metadata";
      headRow.appendChild(th);
      metaTable.appendChild(headRow);
      const titleRow = document.createElement("tr");
      const keyCell = document.createElement("td");
      keyCell.textContent = "Title";
      const valCell = document.createElement("td");
      valCell.textContent = title;
      titleRow.append(keyCell, valCell);
      metaTable.appendChild(titleRow);
      main.appendChild(metaTable);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title,
          template: "stub",
          blocks: ["hero-banner"]
        }
      }];
    }
  };
  return __toCommonJS(import_stub_exports);
})();
