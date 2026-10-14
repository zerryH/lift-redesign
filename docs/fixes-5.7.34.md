# 5.7.34 — VS Code diagnostics

## Reproduction

TypeScript 5.9.3 reproduced 142 JavaScript diagnostics when checking the previous `app.js` with ES2022 and DOM libraries. Checking every root script together also produced duplicate-definition diagnostics because the build embedded the same source fragments in `app.js`. This reproduces a repository problem; it does not establish the exact contents of the user's local VS Code Problems panel.

## Changes

- `app-core.js` is now the editable shell. `build.mjs` generates `app.js` and the two HTML copies from that shell, the original source fragments and the data files. VS Code checks the canonical shell and fragments together rather than checking duplicate copies in the same scope. The generated bundle receives a separate compiler check too.
- `jsconfig.json` keeps `checkJs` enabled and includes modern JavaScript, DOM and DOM iterable declarations. Exact control selectors, the optional iOS bridge, standalone detection and native status events have concrete declarations in `types/browser.d.ts`.
- DOM callbacks and controls carry their actual input/button types. DOM text and dataset assignments use strings. The serialized save queue acknowledges both its initial empty promise and later boolean results; an async lock wrapper models the actual flattened result.
- Initialization runs after helper definitions. Regression harnesses capture that exact initialization expression instead of the first unrelated async callback. Existing assertions remain enabled.
- The logging/timer wrapper returns the original logging result, allowing callers to distinguish accepted and rejected sets. An unranked anatomy fallback retains the requested muscle identity.
- The multiline exercise label now supplies standard `line-clamp` alongside the existing WebKit property.
- Pinned development dependencies and `npm run check:editor` make the diagnostics reproducible in CI. No `@ts-nocheck`, disabled JavaScript validation or blanket `any` declarations are used to erase errors.

## Updating a local editor

Pull the latest main branch, open the repository folder in VS Code and run **Developer: Reload Window**. Run `npm ci --ignore-scripts`, `npm run build` and `npm run check:editor` for the same check used in CI. Edit `app-core.js` or a source fragment rather than generated `app.js`, `index.html` or `lift-local.html`.

A different extension, local edits or a different checkout can report additional diagnostics. The exact message, file and line from the local Problems panel are needed to reproduce those remaining items.
