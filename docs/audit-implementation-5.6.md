# Audit implementation register — Slat 5.6.0

This change implements the behavior fixes from the 10 October 2026 audit against `241b138da2840f3a8f7f36ba90b9018352ad3f62`. It preserves workout records and the app's local-first design. The source changes are a reviewable release candidate, not evidence of completed physical-device certification.

## Finding coverage

| ID | Implementation | Validation / remaining work |
|---|---|---|
| F01 | Deep backup validation, isolated preparation, retained recovery copy, overwrite without clearing first, failed-write rollback | Executable invalid nested data, successful replacement and quota tests; device interruption check pending |
| F02 | One awaited startup sequence; QoL installs once after storage and migration | Executed 0, 50, 500 and 3000 ms delays per storage stage |
| F03 | Calculator converts lb to canonical kg before scoring | Equivalent kg/lb fixtures pass |
| F04 | Preview, explicit saved check and earned workout result use separate state | High and low previews never replace earned ranks |
| F05 | Pure calculation context takes reference as an argument | Preview/save/reload preserves profile reference |
| F06 | Saved checks rebuild from raw inputs under current adjustment settings | Adjustment recalculation tested; saved bodyweight/height/reference are intentionally retained |
| F07 | All progress calculations consume adjusted score; labels specify estimated 1RM | Progress result agrees across calculation and earned list |
| F08 | Explicit unranked, first-tier target and maximum handling | Below-threshold and valid first-target fixtures |
| F09 | Earned records keyed by canonical exercise identity; no benchmark alias fallback | Single Bench Press produces one earned record |
| F10 | Every catalogue row declares muscle contributions; unsupported tracking has an exclusion reason | All 16 muscle zones have SVG coverage; tibialis and adductors separated from calf/quadriceps zones; earned contributor details tested in browser |
| F11 | Anatomy reads explicit contribution weights, independent from benchmark inheritance | Calf/shoulder/core isolation fixtures |
| F12 | Corrected muscle labels, split consistency and independent equipment/muscle facets | All 472 compatible entries covered by schema checks |
| F13 | Explicit movement families, including hip isolation, shrugs and wrists; corrected squat/curl anchors | Version 10 ladders regenerated and checked; empirical standard validation remains outside this patch |
| F14 | Loaded machine/cable movements no longer add bodyweight | Effective-load regression fixtures |
| F15 | Single-implement and unilateral records specify count and input instruction | Single dumbbell extension and concentration curl fixtures |
| F16 | Duration, distance, bands and bodyweight reps have separate inputs; unsupported modes cannot earn estimated-1RM ranks | Tracking-mode and engine exclusion fixtures |
| F17 | Bodyweight and timed movements start at zero added load | Default-input fixtures |
| F18 | Stable catalogue IDs, 25 true synonym mappings, display names separate from legacy keys | Old sets retain their contents and map to shared IDs; unique entry/set IDs survive restart and historical editing; 447 browse identities |
| F19 | Removed 180-result truncation; separate split, muscle and equipment filters; Core/Full Body rank tabs | Full 447-item browse output and all split checks |
| F20 | Registry and benchmark aliases rebuild from base data on import | Removed custom name and alias do not survive replacement; custom rename/retire retains IDs and logged sets; incompatible benchmark mappings remain unranked |
| F21 | Shared kg/lb presentation for logging, history summaries, rank rows, profile and charts | Conversion fixtures; rendered mobile presentation still requires device checks |
| F22 | PR baseline excludes current workout and edited original | New current-session record displays PR |
| F23 | Removed the self-triggering MutationObserver; QoL uses the render hook | No observer is installed; startup and render tests pass |
| F24 | Set value opens an edit form for load, reps/duration/distance and note | Browser log → edit → finish → reload passes; set RPE/band/note edits and durable removal undo covered |
| F25 | Nested types normalize only after preserving raw recovery state; invalid JSON stops at recovery view | Malformed nested state and invalid JSON tested |
| F26 | Calculator/rank/history names and form values escaped; reserved object keys rejected | Injected image markup cannot reach raw result HTML |
| F27 | Serialized writes check last saved revision; Web Locks used when available; stale tab pauses with export/reload | Two real Chromium tabs detect the stale writer; controlled concurrent-write fixtures pass; physical-device interruption remains a release gate |
| F28 | Blank birth year correctly migrates legacy age; profile typing remains a draft until Save | Migration and import/restart fixtures |
| F29 | Workout date uses local calendar; earned result date comes from the winning set's workout | Device-calendar fixture |
| F30 | Shared time axis, independent recorded bodyweight series, padded value scale, point markers, unit labels and accessible data table | Chart scale/data-table logic and real view rendering checked; screen-reader interpretation remains a device gate |
| F31 | Empty imperial bar input resolves to 20 kg; common bar presets, finite plate-pair counts and explicit below-bar warnings | Shared unit helpers, finite inventory decomposition and real browser calculator/chart/export journey |
| F32 | Version 5.6.0 comes from build source; generated outputs identical; cache includes integrity module | Exact cache hash, parity and release-version tests |
| F33 | Update handler receives the actual button; local-file Reload reloads after pending saves | Real offline reopening and synthetic waiting-worker activation preserve draft/rest; upgrade from the actual public 5.5.106 installation remains a release gate |
| F34 | Shared dialog roles, focus return, Tab containment, Escape and background inertness | Real keyboard containment, closed-details exclusion, Escape/inert restoration and native timer focus retention pass; VoiceOver/TalkBack pending |
| F35 | Slider permits native vertical panning while horizontal adjustments remain explicit | Gesture-source checks; real touch arbitration pending |
| F36 | Shared interaction tokens and new logging layout; duplicate profile adjustment switches removed | Foundation cascade layer and authoritative component rules replace legacy importance pileup; only five reduced-motion declarations remain important; 27 computed-style comparisons showed no migration differences |
| F37 | 43 isolated regression scripts, 25 audit scenarios, catalogue-wide protocols/boundaries and real-browser journeys; Chromium/WebKit CI configured | Full suite documented below; no false claim that mocked DOM tests are browser tests |
| F38 | Rest deadline, note, RPE, band and numeric draft persist per active exercise | Restart fixture and real offline/reload journey; timer controls retain keyboard focus |
| F40 | Empty/repeated finish guarded; edit replaces by ID; failed save restores draft | Empty, concurrent duplicate, edit and quota fixtures |
| F39 | Versioned methodology matches tier averaging, contribution weights, factors and data-source policy; Profile and notices link the existing repository support tracker | README, notices and methodology consistency checks |

## Exercise data review

All 472 original/runtime-compatible names now have explicit records. Browse presents 447 canonical identities; 400 support strength rankings. Tracking-only movements remain usable and keep their history. Retained legacy ladders are not exposed as valid strength rankings for timed, distance or band activities. Stable IDs are attached to normalized workout exercise records; legacy names remain accepted for imports.

Protocols describe the implementation convention rather than asserting scientific validation. Some broad exercise names still represent one selected convention (for example, one dumbbell for seated overhead extensions). The input instruction makes that convention visible. Users can create another variant rather than silently mixing protocols.

## Test evidence and release gate

Verification on 11 October 2026: **43/43 local regression scripts passed**. All 447 canonical protocols log and round-trip through actual application handlers; all 400 ranked movements are checked against both references and 46 tier boundaries. The generator checks all 472 retained ladders. The release workflow runs the final pushed source, deterministic build and all 35 configured Chromium/WebKit journeys before merge.

New browser acceptance covers custom duration and per-implement settings, plate calculations and below-bar messaging, accessible chart rows, complete export/import round-trips, IndexedDB-only writes and real two-tab conflict detection, enlarged root font with keyboard logging, exact 5.5.106 source/data migration and local-file reload/logging. Old-source migration blocks service workers to isolate data compatibility; installed-phone upgrade validation remains separate. Existing catalogue-wide forms, offline/waiting-worker activation and 100/1,000/10,000 retained sessions remain covered. Browser screenshots and reports are CI artifacts, not physical-device certification.

`node tools/check-release.mjs` runs the complete local release gate after Playwright and browser binaries are installed. It fails if generated outputs are stale or a browser is unavailable. `tools/test-release.mjs` provides the isolated source/runtime suite; its DOM stubs are not browser evidence. `tools/test-browser.mjs` writes versioned browser evidence, screenshots and timings to `test-results/browser/`. GitHub Actions is configured to run regression/build checks plus Chromium and WebKit journeys and retain the report. The successful final-head workflow is the release evidence; an earlier run does not approve a later source revision.

See [the 21-section completion record](plan-completion.md) for feature acceptance and the remaining public-release gates. These remain open:

1. Physical iOS Safari/installed PWA and Android Chrome: native import/export pickers, real touch, virtual keyboard, orientation and interrupted saves.
2. Large text/text zoom, VoiceOver and TalkBack; keyboard checks on desktop do not certify screen-reader usability.
3. Representative copies of real 5.5.106 user data and a real installed upgrade; fixtures and synthetic service workers cannot replace a migration cohort.
4. Midrange-phone performance, storage quota/interruption and browser-specific persistence behavior.
5. Owner/content review of exercise instructions, empirical ranking standards, support triage and anatomy legibility. The added anatomy regions are schematic.

## Product inspiration

Liftoff's publicly described relationship between logged lifts, per-exercise progress and a muscle map informed clearer provenance and the logging hierarchy. No Liftoff artwork, proprietary thresholds or source code is used. Reference reviewed 10 October 2026: https://liftoffrank.com/.

## Browser automation and dialog follow-up

The review follow-up clamps shared dialogs to their padded viewport, gives their close control a styled SVG button, and removes redundant button backdrop filters. The backup browser journey checks dialog bounds before acting.

The WebKit 27.2 runner stalled in its pre-pointer stability polling after file selection while diagnostics showed visible, enabled, focused, inert-free controls. WebKit pointer-control journeys therefore scroll controls into view and use native mouse input after checking visibility, enabled state, browser hit testing and inert ancestors. It does not force a locator click or dispatch a synthetic DOM click. Successful cancellation/replacement and unchanged/replaced stored data are still required. Chromium retains normal locator actions; WebKit still requires each action’s actual saved-data or visible-state outcome.

Playwright is pinned to 1.64.0 to include the upstream WebKit offline-emulation fix (https://github.com/microsoft/playwright/pull/42894). Physical Safari/PWA validation remains open. CI reports and failures retain exact browser versions, dialogs and control geometry; configured checks are not certification.

### Persistent notification obstruction

Real WebKit evidence exposed an update action banner covering the last history control. Action notifications now include an accessible dismiss button, remain visible while actionable, and allow pointer input through their noninteractive text area. The offline/upgrade journey verifies dismissing the prompt retains the draft and pending worker, then activates the update from Profile. Browser fixtures unregister their service workers between journeys, and WebKit pointer input waits for an actual hittable target after scrolling.

### Import contract validation

Measurements must be numeric scalars; booleans, arrays, objects and whitespace-only values no longer coerce into valid loads/repetitions. Known unit/reference enums, backup version bounds, protocol version integers and the RPE ceiling are validated. Cycles, non-JSON values and excessive nesting fail before replacement. Legacy numeric strings, zero/unknown legacy RPE and signed assistance values remain unchanged. `tests/backup-contract.mjs` records these acceptance cases.

### Data contracts and durability completion

Catalogue v3 adds per-row evidence notes and explicit benchmark, split and muscle IDs. All standard anchors are stored on their records; generator parity confirms no numerical change in this follow-up. New sets retain exercise/benchmark/catalogue/standard IDs, units, load convention and performance context. Legacy measurements keep a raw migration snapshot and are never silently reinterpreted as duration or distance.

Persistence now compares and writes in one IndexedDB transaction before the localStorage copy, increments revisions and broadcasts saved/reset events. New fixtures prove quota-only fallback and rejection of a newer database revision. Save status and retry are visible. Pure catalogue, performance and workout modules plus persistence/dialog source modules are embedded into the self-contained distributions and included in cache hashing.

The owner requested publishing on 11 October 2026. External acceptance tasks remain recorded in the completion document; they are not represented as automated passes.
