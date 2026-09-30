# Liftlog
Minimal offline strength tracker: logging + bodyweight-relative ranks. Kg only, no backend.

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
- Dark purple UI, exercise carousel + working weight and reps sliders for logging (kg), body map on Ranks.
- Ranks → **Get your rank**: pick a lift, enter weight, reps and bodyweight (kg or lb) to see your tier. The result is saved per exercise until you update it, and included in backups.
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
