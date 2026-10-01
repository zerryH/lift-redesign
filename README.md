# Liftlog
Minimal offline strength tracker: logging + bodyweight-relative ranks. No backend; data stays on the device.

## Deploy
1. Drag this folder onto Netlify Drop (app.netlify.com/drop), or push it to GitHub Pages.
2. Open the link in Safari on your iPhone.
3. Share → Add to Home Screen.
4. Always open it from the Home Screen icon (Safari and the Home Screen app keep separate storage).
5. Back up: Profile → Export backup → Save to Files. Import from the same screen (Merge or Replace).

## Tweaking
- Rank thresholds: `ranks-config.json` (min ratio to enter each tier, [male, female]).
- Exercises and templates: `exercises.json` (types: B barbell, D per-dumbbell, W bodyweight, M machine, U unranked).
- After editing files, bump `V` in `sw.js` so installed copies update.

## v3 redesign
- Dark/light iOS-style UI, exercise carousel + working weight and reps sliders for logging, and an interactive muscle map on Ranks.
- Ranks → **Get your rank**: pick a lift, enter weight, reps, bodyweight and height (kg/lb supported) to see your tier. Male/Female references are clearly labeled benchmark sets. The result is saved per exercise until you update it, and included in backups.
- New workouts created from any split start with a clean exercise list; add exercises manually as you go.


### Open directly from the downloaded ZIP
The `index.html` file is self-contained. After extracting the ZIP, double-click `index.html` to run Lift directly from `file://` without npm, localhost, or a server. Exercise/rank data is embedded for this mode; IndexedDB is used when available, with localStorage fallback.


### Ranking balance
Legs exercises use 25% higher rank-entry ratios than before, making high ranks require proportionally stronger estimated 1RM relative to bodyweight.


### Profile & safety
- Animations remain off by default.
- Profile includes a 5-second confirmation countdown before Reset all data becomes available.
- Button taps use short Liquid Glass-inspired micro-feedback: a brief press glow, soft touch flare, and two tiny light sparks when animations are enabled. The effect is intentionally brief (about 0.2s).
## Local/offline build
- `index.html` and `lift-local.html` are self-contained and do not fetch JSON data.
- They are intended to work when opened directly from a downloaded folder/file viewer.
- No npm, localhost, or server is required for the standalone files.


### Destructive actions
Delete/discard actions use an in-app confirmation sheet rather than browser confirm dialogs, so they work reliably in Safari/iPhone local HTML viewers as well as on desktop.


### Relative strength profile update
- Profile stores age and bodyweight, and offers male/female reference standards.
- Ranks use bodyweight-relative thresholds plus a provisional broad age-band adjustment. This estimate is not an official federation age-grading formula.
- Demo data is not loaded automatically, and the demo-data button has been removed. New installs start with empty workout history.


## Reliability and accessibility fixes
- Saves write a timestamped localStorage fallback first, reuse a single IndexedDB connection, and compare timestamps at startup to avoid loading an older IndexedDB copy after a timed-out save.
- Editing a past workout keeps the original in History until Finish commits the edit; Discard no longer removes the saved workout.
- Custom/imported exercise names are normalized before use, confirmation dialog content is HTML-escaped, and pinch-to-zoom is allowed.

## QoL update
- Added progress charts for estimated 1RM plus bodyweight.
- Added a rest timer with optional screen wake lock, typed weight/reps entry, last-set repeat, RPE and notes.
- Added a plate calculator, global kg/lb setting, optional interpolated age adjustment, and custom-exercise ranked-lift mapping.
- Ranking now records bodyweight with logged sets, uses a recent 90-day window with per-lift all-time fallback, and overall rank uses core compound lifts when enough data exists.
- Added common aliases for close-grip bench, sumo/trap-bar deadlift, cable lateral raise, and machine row.
- Added build.mjs and tests/smoke.mjs so the two self-contained HTML builds stay synchronized and are syntax-checked.

## v4 UX + ranking update
- First launch now opens a guided tutorial covering Home/workouts, History, Ranks, Get Rank, Profile, theme selection, and credits. Profile includes **Replay tutorial**.
- Profile now has explicit **Dark** and **Light** theme buttons instead of a single ambiguous mode toggle.
- Rank references are labeled **Male reference** and **Female reference** with an explanation that they are benchmark sets for comparison and do not alter workout logging.
- Height / ROM adjustment can be switched on or off. Lift uses a mild provisional height correction: taller athletes receive a small downward ratio adjustment to reflect the app's longer-ROM model. This is a Lift heuristic, not a biomechanical or federation-standard formula.
- Ranks now include a draggable 3D-style front/back body map. Related lifts unlock muscle areas; unlocked areas use the corresponding rank color, while unranked areas stay locked/neutral. The muscle mapping is a Lift visualization based on related strength exercises, not a direct measurement of individual muscle size or strength.
- Credits are shown in Profile: **Made by @o.r146 · TikTok**.
- `tests/smoke.mjs` now checks tutorial/rank/theme markers, synchronized embedded builds, syntax, and height-adjustment markers.


## Bug-fix pass
- Fixed a missing rear-deltoid rank mapping that could throw while rendering the Ranks tab. Added a defensive fallback for unmatched muscle zones and corrected the aggregate muscle-rank calculation.
- The tutorial now leaves the app visible underneath a compact coach card, with click-through everywhere outside the card. Tutorial buttons remain usable without hiding the app behind a dark overlay.
- Reduced action button sizing inside button groups and the rank muscle controls; full-width primary workout actions retain their larger size.
- Added a render error fallback with a Retry button so a future view error does not silently leave navigation appearing broken.
## Mobile profile and anatomy visual fix

- Profile age/height adjustment switches now remain compact on narrow screens instead of stretching into oversized oval cards.
- Age/height save buttons align to their own content and keep a normal tap-target height.
- Replaced the blocky rank placeholder with a shaded front/back anatomical SVG, clearer torso/limb contours, and separately mapped muscle regions that retain rank colors.
- Smoke tests now guard against the mobile stretch rule returning and check the upgraded anatomy markup.
- Validation covers build, JavaScript syntax, smoke tests, and matching embedded scripts; no live iPhone/Safari browser session was available for this pass.
