# Slat

Slat is a local-first, offline strength-training logger. Workout data is stored on the device; the app does not require an account or a Slat-owned backend.

## Current release

**Build: 5.7.17**

- 475 compatible names, grouped into 450 distinct browse identities
- 400 ranked movements; other movements track duration, distance, bands or reps
- 46 rank tiers
- Ranking standards v11: Slat-owned exercise-specific heuristics

New in 5.7.17: backups with ordinary line breaks and tabs in older notes or band labels restore successfully. Editing weight, repetitions or RPE preserves untouched text exactly, including formatting that a single-line editor cannot display. The bounded restore and creation/edit limits added in 5.7.16 remain in place. See [the current code audit](docs/code-audit-2026-10-12.md).

New in 5.7.12/5.7.13: update checks recover older open pages, protect unsaved drafts, retry failed installations, validate fresh staged files, and isolate the active cache. See `docs/fixes-5.7.12.md` and `docs/update-recovery.md`.

New in 5.7.9: saving an unchanged custom name preserves its saved check, routine and Progress selectors show canonical choices, and the local-file browser journey waits for reload. See `docs/fixes-5.7.9.md`.

New in 5.7.8: web rest notifications are explicitly static next-set reminders. The unreliable web completion-notification update has been removed; in-app and native iPhone countdowns remain available. See `docs/fixes-5.7.8.md`.

New in 5.7.7: workout-date corrections no longer depend on locale formatting, and the rest timer can be adjusted down as well as up. See `docs/fixes-5.7.7.md`.

New in 5.7.5: routine copies retain planned targets and zero-rest presets, switching equipment setups refreshes measurement inputs from matching history, and saved routines have a Duplicate action. See `docs/fixes-5.7.5.md`.

New in 5.7.4: an iPhone app project with a real ActivityKit countdown, progress bar and translucent glass surface. A versioned bridge connects logging and timer controls. Native installation and signing are required; a website/PWA update alone cannot display the custom live widget. See `ios/README.md` and `docs/fixes-5.7.4.md`.

New in 5.7.3: a compact rest-timer dock that reserves its own space, with a progress line and optional system rest cards. Phone notifications show a fixed next-set time. As of 5.7.8, they are static reminders with no completion alert. iPhone web notifications require a Home Screen installation, and a native Live Activity countdown is outside the web app. See `docs/fixes-5.7.3.md`.

New in 5.7: editable session dates/names, saved ordered routines, tracking-mode progress charts, equipment setup labels, timer controls, History search/details, and weekly/monthly training summaries. See `docs/audit-5.7.0.md` and `docs/catalogue-review-5.7.0.md`.

The shipped app is a self-contained HTML build for GitHub Pages and a local `lift-local.html` file.

## Architecture

- Vanilla HTML/CSS/JavaScript.
- No Three.js, WebGL runtime, CDN dependency, hosted API, account system, analytics SDK or workout backend.
- Anatomy is rendered as 2D SVG with front/anterior and back/posterior views. See `THIRD_PARTY_NOTICES.md` for current asset provenance.
- The workout catalogue is sourced from `exercises.json`.
- Ranking standards and tier names are sourced from `ranks-config.json`.
- `data-integrity.js` validates backup candidates before replacement. A previous-state recovery copy is retained; imports never clear the current state first.
- Saves are serialized. A newer saved revision in another tab pauses stale writes and offers draft export.
- `app.js` contains data and anatomy source markers; `build.mjs` injects JSON and `anatomy-front.svg` / `anatomy-back.svg` into the self-contained build.
- `index.html` and `lift-local.html` are generated self-contained builds and are kept byte-identical.
- Hosted writes use an IndexedDB transaction with revision checks, followed by the localStorage recovery copy. Either acknowledged store can preserve a save; conflicting tabs pause, and failed saves offer retry. Local-file mode uses localStorage.
- The local `file://` build intentionally uses localStorage because service workers and other secure-context APIs are unavailable there.

## Exercise catalogue

`exercises.json` contains 475 compatible names and an explicit catalogue with stable IDs, synonyms, equipment, muscles, tracking modes and input instructions. Browse shows 450 distinct movements. Search, split, muscle and equipment filters use the same records. Legacy names remain importable without discarding sets.

## Ranking system

Slat uses 46 tiers from Wood I through Blue Gem. Each supported exercise has its own male/female threshold ladder. Completed workouts earn ranks using recorded bodyweight and height, with optional age and height adjustments. Rank previews and explicitly saved checks remain separate from earned exercise and muscle ranks.

**Ranking standards v11 are Slat-owned heuristics, not population percentiles.** The thresholds are generated from exercise metadata, movement-family anchor values, reference bodyweights, ROM class, unilateral handling and a fixed 46-step Slat progression. No Strength Level or ExRx threshold table is embedded in the v11 dataset. See `docs/rank-methodology-v11.md`.

Ranks are estimates for training context, not medical advice, diagnosis, a biomechanical law, an official federation classification or a guarantee of performance.

## Privacy and ownership

Use **Profile → Privacy & data** and **Profile → Terms & ranking** inside the app. Source-level notices are also provided in `PRIVACY.md`, `TERMS.md`, `LICENSE`, and `AI-USAGE-NOTICE.md`.

Slat's original source and original creative work are **all rights reserved** unless a separate notice says otherwise. Third-party material keeps its own license; see `THIRD_PARTY_NOTICES.md`.

Because the repository is public, GitHub's platform terms permit certain viewing/forking actions. An ownership notice cannot override those platform permissions. If the source itself must be inaccessible, the repository must be private and the deployment architecture must be changed accordingly.

## Credits

- Made by **@o.r146**
- TikTok: **@o.r146**
- Support: [Slat support and feedback](https://github.com/zerryH/lift-redesign/issues)

## Build and tests

Run `node build.mjs` for the canonical generated build. The build is idempotent and regenerates both `index.html` and `lift-local.html` plus the service-worker cache hash.

The release suite covers catalogue integrity, equipment classification, ranking shape/progression, state compatibility, mobile interactions, update behavior, generated-file parity, encoding, legal/ownership notices and release-version consistency.

## Third-party notices

See `THIRD_PARTY_NOTICES.md`, `ANATOMY_CREDITS.md`, and `LICENSE-MUSCLE-MAPPER.txt`. The repository currently retains attribution for the bundled advanced anatomy SVG material attributed to Ryan Graves; that attribution must remain until those assets are actually replaced with independently authored anatomy artwork.

## Validation and audit traceability

Install the test dependency with `npm install --no-save --ignore-scripts playwright@1.64.0`, then `npx playwright install chromium webkit`. Run `SLAT_BROWSERS=chromium,webkit node tools/check-release.mjs` for all independent regression scripts, reproducible standards/build checks and real-browser journeys. Missing browser binaries fail the gate. GitHub Actions runs these checks on pull requests and review-branch pushes.

For focused checks, use `node tools/test-release.mjs` or `node tools/test-browser.mjs`. Browser reports/screenshots are written to `test-results/browser/`. Alternate local runtime paths can be supplied with `SLAT_PLAYWRIGHT_PATH` and `SLAT_CHROMIUM_PATH`. See [the implementation register](docs/audit-implementation-5.6.md) and [plan completion record](docs/plan-completion.md) for evidence and outstanding device/product gates.
