# Figma Design → EDS Block Migration Plan

## Goal
Migrate a Figma design into an AEM Edge Delivery Services block for the `doc-eds-poc` project (xwalk / Universal Editor), extracting both the visual design and content structure with high fidelity, and delivering an author-editable block verified in preview.

## Decisions Captured
- **Figma plugin:** ✅ Approved to enable the Figma → EDS migration plugin (`excat-figma@excat-extended`).
- **Design source:** A Figma file/frame **URL** (to be provided at the start of Phase 1).
- **Block target:** Undecided by design — inspect the Figma frame first, then recommend **new block vs. extend existing** (existing candidates: `hero`/`hero-banner`, `cards`/`cards-related`, `columns`, `form`).

## Status
- **User approved** enabling the plugin and proceeding. First action in Execute mode is writing `.agents/settings.json`.
- After the settings file is written, the turn ends so the session reinitializes and the Figma skill loads. Design work begins on the following message.

## Open Inputs Still Needed
- [ ] **Figma frame/component URL** — the exact frame to migrate (collect at the start of Phase 1, once the plugin is loaded).
- [ ] **Figma access** — confirm the plugin can read the file (auth/opt-in), since Figma is an external service.

## Prerequisites
- `.agents/settings.json` must contain `{"enabledPlugins": {"excat-figma@excat-extended": true}}` (created if the file does not exist).
- Plugin activates on the **next user turn** after the settings file is written (session auto-reinitializes; no manual restart, no reload message to the user).
- Do **not** attempt to invoke the Figma skill on the same turn the settings file is written — it is unavailable until the reinit fires.
- Local dev server (`aem up`) available for preview verification at the `/content` prefix.

## Checklist

### Phase 0 — Enable tooling (Execute mode)
- [ ] Write `.agents/settings.json` with `excat-figma@excat-extended` enabled (merge into existing `enabledPlugins` if the file already exists).
- [ ] Briefly confirm the file was written; end the turn so the plugin loads on the user's next message.
- [ ] On the next turn, verify the Figma skill(s) appear in `<available-skills>` and collect the **Figma URL** (via AskUserQuestion if not provided).

### Phase 1 — Extract design & content from Figma
- [ ] Invoke the Figma migration skill (exact name from `<available-skills>`) with the provided frame URL.
- [ ] Extract design tokens (colors, typography, spacing, radii, shadows) and layout structure.
- [ ] Extract content structure (headings, text, images, CTAs, repeatable items).
- [ ] Capture a reference screenshot/export of the target frame for visual comparison.

### Phase 2 — Classify & decide block target
- [ ] Review the extracted structure and content model.
- [ ] Recommend **new block** vs. **extend existing block**, with rationale.
- [ ] Confirm the recommendation with the user before building (AskUserQuestion if ambiguous).
- [ ] Define the block's authoring contract (initial content/table structure + UE fields).

### Phase 3 — Build the block
- [ ] Create/modify `blocks/<name>/` — `<name>.js`, `<name>.css`, and `_<name>.json` (xwalk model + definition + filter).
- [ ] Implement responsive CSS (mobile-first; 600/900/1200 breakpoints) scoped to the block.
- [ ] Register the component in the block group and the relevant section filter.
- [ ] Run `npm run build:json` to regenerate `component-definition/models/filters.json`.

### Phase 4 — Verify
- [ ] Create a throwaway static test page in the block-table format the block expects.
- [ ] Restart dev server, preview, and inspect DOM/computed styles (snapshot + evaluate).
- [ ] Compare rendered block against the Figma reference; iterate on CSS for fidelity.
- [ ] Run `npm run lint` (JS + CSS + xwalk model rules) until clean.

### Phase 5 — Wrap up
- [ ] Summarize the block, its authoring fields, and how to insert/edit it in Universal Editor.
- [ ] Note any follow-ups (design tokens to promote to global styles, assets to optimize, etc.).

## Notes & Risks
- **Fidelity depends on Figma access:** best results come from the live URL via the plugin; if access fails, fallback is working from exports (lower spacing/token accuracy).
- **Design-token reuse:** prefer mapping Figma tokens onto the project's existing CSS custom properties over hard-coded values, to stay consistent with the site.
- **Block-vs-existing** is deliberately deferred to Phase 2 so the choice is grounded in the actual design rather than guessed up front.

---
**Execution requires Execute mode.** This plan is approved to proceed: Phase 0 writes `.agents/settings.json` (a file modification, hence Execute mode), then the turn ends so the plugin loads before Phase 1 begins.
