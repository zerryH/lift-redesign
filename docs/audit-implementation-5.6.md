# Audit implementation register — Slat 5.6.0

This change implements the behavior fixes from the 10 October 2026 audit against `241b138da2840f3a8f7f36ba90b9018352ad3f62`. It preserves workout records and the app's local-first design. The source changes are a reviewable release candidate, not evidence of completed physical-device certification.

## Finding coverage

| ID | Implementation | Validation / remaining work |
|---|---|---|
| F01 | Deep backup validation, isolated preparation, retained recovery copy, overwrite without clearing first, failed-write rollback | Executable invalid nested data, successful replacement and quota tests; device interruption check pending |
| F02 | One awaited startup sequence; QoL installs once after storage and migration | Executed 0, 50, 500 and 1500 ms delays per storage stage |
| F03 | Calculator converts lb to canonical kg before scoring | Equivalent kg/lb fixtures pass |
| F04 | Preview, explicit saved check and earned workout result use separate state | High and low previews never replace earned ranks |
| F05 | Pure calculation context takes reference as an argument | Preview/save/reload preserves profile reference |
| F06 | Saved checks rebuild from raw inputs under current adjustment settings | Adjustment recalculation tested; saved bodyweight/height/reference are intentionally retained |
| F07 | All progress calculations consume adjusted score; labels specify estimated 1RM | Progress result agrees across calculation and earned list |
| F08 | Explicit unranked, first-tier target and maximum handling | Below-threshold and valid first-target fixtures |
| F09 | Earned records keyed by canonical exercise identity; no benchmark alias fallback | Single Bench Press produces one earned record |
| F10 | Every catalogue row declares muscle contributions; unsupported tracking has an exclusion reason | Catalogue-wide checks; forearm/adductor/tibialis SVG coverage remains limited to list summaries |
| F11 | Anatomy reads explicit contribution weights, independent from benchmark inheritance | Calf/shoulder/core isolation fixtures |
| F12 | Corrected muscle labels, split consistency and independent equipment/muscle facets | All 472 compatible entries covered by schema checks |
| F13 | Explicit movement families, including hip isolation, shrugs and wrists; corrected squat/curl anchors | Version 10 ladders regenerated and checked; empirical standard validation remains outside this patch |
| F14 | Loaded machine/cable movements no longer add bodyweight | Effective-load regression fixtures |
| F15 | Single-implement and unilateral records specify count and input instruction | Single dumbbell extension and concentration curl fixtures |
| F16 | Duration, distance, bands and bodyweight reps have separate inputs; unsupported modes cannot earn estimated-1RM ranks | Tracking-mode and engine exclusion fixtures |
| F17 | Bodyweight and timed movements start at zero added load | Default-input fixtures |
| F18 | Stable catalogue IDs, 25 true synonym mappings, display names separate from legacy keys | Old sets retain their contents and map to shared IDs; 447 browse identities |
| F19 | Removed 180-result truncation; separate split, muscle and equipment filters; Core/Full Body rank tabs | Full 447-item browse output and all split checks |
| F20 | Registry and benchmark aliases rebuild from base data on import | Removed custom name and alias do not survive replacement |
| F21 | Shared kg/lb presentation for logging, history summaries, rank rows, profile and charts | Conversion fixtures; rendered mobile presentation still requires device checks |
| F22 | PR baseline excludes current workout and edited original | New current-session record displays PR |
| F23 | Removed the self-triggering MutationObserver; QoL uses the render hook | No observer is installed; startup and render tests pass |
| F24 | Set value opens an edit form for load, reps/duration/distance and note | Handler and data persistence paths implemented; browser focus check pending |
| F25 | Nested types normalize only after preserving raw recovery state; invalid JSON stops at recovery view | Malformed nested state and invalid JSON tested |
| F26 | Calculator/rank/history names and form values escaped; reserved object keys rejected | Injected image markup cannot reach raw result HTML |
| F27 | Serialized writes check last saved revision; Web Locks used when available; stale tab pauses with export/reload | Stale-writer fixture passes; simultaneous physical browser contexts still need verification |
| F28 | Blank birth year correctly migrates legacy age; profile typing remains a draft until Save | Migration and import/restart fixtures |
| F29 | Workout date uses local calendar; earned result date comes from the winning set's workout | Device-calendar fixture |
| F30 | Shared time axis, independent recorded bodyweight series, padded value scale, point markers, unit labels and accessible data table | Source/logic implemented; canvas painting and screen-reader check pending |
| F31 | Empty imperial bar input resolves to 20 kg, avoiding double conversion | Shared unit helpers and plate decomposition retained |
| F32 | Version 5.6.0 comes from build source; generated outputs identical; cache includes integrity module | Exact cache hash, parity and release-version tests |
| F33 | Update handler receives the actual button; local-file Reload reloads after pending saves | Update regression suite; installed service-worker upgrade pending |
| F34 | Shared dialog roles, focus return, Tab containment, Escape and background inertness | Structural implementation; VoiceOver/TalkBack and nested dialogs pending |
| F35 | Slider permits native vertical panning while horizontal adjustments remain explicit | Gesture-source checks; real touch arbitration pending |
| F36 | Shared interaction tokens and new logging layout; duplicate profile adjustment switches removed | Partial: legacy CSS cascade retained to avoid unverified wholesale visual changes; broader consolidation needs rendered baselines |
| F37 | New reusable runtime harness, 22 audit behavior checks, updated contradictory tests, isolated release runner | Full suite documented below; no false claim that mocked DOM tests are browser tests |
| F38 | Rest deadline, note, RPE, band and numeric draft persist per active exercise | Restart fixture |
| F40 | Empty/repeated finish guarded; edit replaces by ID; failed save restores draft | Empty, concurrent duplicate, edit and quota fixtures |
| F39 | Versioned methodology now matches tier averaging, contribution weights, factors and data-source policy | README, notices and methodology consistency checks |

## Exercise data review

All 472 original/runtime-compatible names now have explicit records. Browse presents 447 canonical identities; 400 support strength rankings. Tracking-only movements remain usable and keep their history. Retained legacy ladders are not exposed as valid strength rankings for timed, distance or band activities. Stable IDs are attached to normalized workout exercise records; legacy names remain accepted for imports.

Protocols describe the implementation convention rather than asserting scientific validation. Some broad exercise names still represent one selected convention (for example, one dumbbell for seated overhead extensions). The input instruction makes that convention visible. Users can create another variant rather than silently mixing protocols.

## Test evidence and release gate

Verification on 11 October 2026: **38 of 38 regression scripts passed**, including 22 new audit behavior scenarios. The generator check passed for all 472 retained ladders. Generated HTML parity, exact service-worker cache hashing and release-version checks passed.

Run `node tools/test-release.mjs` for the full independent-workspace suite. Run `node tools/generate-rank-standards-v9.mjs --check` to check every retained ladder. `tests/audit-regressions.mjs` executes the actual app with controlled storage and DOM stubs; it is not a browser rendering test.

Browser testing was attempted, but the runtime's Chromium download returned a truncated archive and the remote browser could not reach the workspace's local HTTP server. Therefore this candidate must complete these checks before public release:

1. iOS Safari and installed PWA: cold start, import/export picker, interrupted save, update and offline reopening.
2. Android Chrome and desktop Chrome: complete workout, edit, delete, calculator kg/lb, custom mapping, filters and progress chart.
3. Small screens, large text, landscape, dark/light mode, reduced motion, keyboard navigation, VoiceOver and TalkBack.
4. Two real tabs saving simultaneously; storage quota; reload during import; recovery export.
5. Check the service worker upgrades from 5.5.106 without replacing or losing saved data.

## Product inspiration

Liftoff's publicly described relationship between logged lifts, per-exercise progress and a muscle map informed clearer provenance and the logging hierarchy. No Liftoff artwork, proprietary thresholds or source code is used. Reference reviewed 10 October 2026: https://liftoffrank.com/.
