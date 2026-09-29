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
- Dark UI, exercise carousel + weight ruler for logging (kg), body map on Ranks.
- Ranks → **Get your rank**: pick a lift, enter weight, reps and bodyweight (kg or lb) to see your tier. The result is saved per exercise until you update it, and included in backups.
