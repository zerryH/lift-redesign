# Slat

Slat is a local-first, offline strength-training logger. Workout data is stored on the device; the app does not require an account or a Slat-owned backend.

## Current release

**Build: 5.6.0**

- 472 compatible names, grouped into 447 distinct browse identities
- 400 ranked movements; other movements track duration, distance, bands or reps
- 46 rank tiers
- Ranking standards v10: Slat-owned exercise-specific heuristics

The shipped app is a self-contained HTML build for GitHub Pages and a local `lift-local.html` file.

## Architecture

- Vanilla HTML/CSS/JavaScript.
- No Three.js, WebGL runtime, CDN dependency, hosted API, account system, analytics SDK or workout backend.
- Anatomy is rendered as 2D SVG with front/anterior and back/posterior views. See `THIRD_PARTY_NOTICES.md` for current asset provenance.
- The workout catalogue is sourced from `exercises.json`.
- Ranking standards and tier names are sourced from `ranks-config.json`.
- `data-integrity.js` validates backup candidates before replacement. A previous-state recovery copy is retained; imports never clear the current state first.
- Saves are serialized. A newer saved revision in another tab pauses stale writes and offers draft export.
- `app.js` contains `BEGIN:EXERCISES` and `BEGIN:RANKS` markers; `build.mjs` injects the current JSON between those markers.
- `index.html` and `lift-local.html` are generated self-contained builds and are kept byte-identical.
- `localStorage` is written first and IndexedDB is used on supported hosted origins; saved timestamps prevent an older IndexedDB copy from rolling back newer local data.
- The local `file://` build intentionally uses localStorage because service workers and other secure-context APIs are unavailable there.

## Exercise catalogue

`exercises.json` contains 472 compatible names and an explicit catalogue with stable IDs, synonyms, equipment, muscles, tracking modes and input instructions. Browse shows 447 distinct movements. Search, split, muscle and equipment filters use the same records. Legacy names remain importable without discarding sets.

## Ranking system

Slat uses 46 tiers from Wood I through Blue Gem. Each supported exercise has its own male/female threshold ladder. Completed workouts earn ranks using recorded bodyweight and height, with optional age and height adjustments. Rank previews and explicitly saved checks remain separate from earned exercise and muscle ranks.

**Ranking standards v10 are Slat-owned heuristics, not population percentiles.** The thresholds are generated from exercise metadata, movement-family anchor values, reference bodyweights, ROM class, unilateral handling and a fixed 46-step Slat progression. No Strength Level or ExRx threshold table is embedded in the v10 dataset. See `docs/rank-methodology-v10.md`.

Ranks are estimates for training context, not medical advice, diagnosis, a biomechanical law, an official federation classification or a guarantee of performance.

## Privacy and ownership

Use **Profile → Privacy & data** and **Profile → Terms & ranking** inside the app. Source-level notices are also provided in `PRIVACY.md`, `TERMS.md`, `LICENSE`, and `AI-USAGE-NOTICE.md`.

Slat's original source and original creative work are **all rights reserved** unless a separate notice says otherwise. Third-party material keeps its own license; see `THIRD_PARTY_NOTICES.md`.

Because the repository is public, GitHub's platform terms permit certain viewing/forking actions. An ownership notice cannot override those platform permissions. If the source itself must be inaccessible, the repository must be private and the deployment architecture must be changed accordingly.

## Credits

- Made by **@o.r146**
- TikTok: **@o.r146**
- Discord: **ejaculator2000**

## Build and tests

Run `node build.mjs` for the canonical generated build. The build is idempotent and regenerates both `index.html` and `lift-local.html` plus the service-worker cache hash.

The release suite covers catalogue integrity, equipment classification, ranking shape/progression, state compatibility, mobile interactions, update behavior, generated-file parity, encoding, legal/ownership notices and release-version consistency.

## Third-party notices

See `THIRD_PARTY_NOTICES.md`, `ANATOMY_CREDITS.md`, and `LICENSE-MUSCLE-MAPPER.txt`. The repository currently retains attribution for the bundled advanced anatomy SVG material attributed to Ryan Graves; that attribution must remain until those assets are actually replaced with independently authored anatomy artwork.

## Validation and audit traceability

Run `node tools/test-release.mjs` to run every regression script in an independent copy. Run `node tools/generate-rank-standards-v9.mjs --check` for reproducible standards. See [the implementation register](docs/audit-implementation-5.6.md) for audit IDs, changes and remaining device verification.
