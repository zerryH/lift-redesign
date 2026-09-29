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
