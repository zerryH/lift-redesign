# Lift

Lift is a local/offline strength-training logger. Workout data stays on the device; the app does not require an account or backend.

## Current release

Build: 5.5.26

The shipped app is a self-contained HTML build for GitHub Pages and a local lift-local.html file.

## Architecture

- Vanilla HTML/CSS/JavaScript.
- No Three.js, WebGL runtime, CDN dependency, or hosted API.
- Anatomy is 2D SVG: two separate detailed models, front/anterior and back/posterior.
- The workout catalogue is sourced from exercises.json.
- Ranking standards and tier names are sourced from ranks-config.json.
- app.js contains BEGIN:EXERCISES and BEGIN:RANKS markers; build.mjs injects the current JSON between those markers.
- index.html and lift-local.html are generated self-contained builds and are kept byte-identical.
- localStorage is written first and IndexedDB is used on supported hosted origins; saved timestamps prevent an older IndexedDB copy from rolling back newer local data.
- The local file:// build intentionally uses localStorage because service workers and other secure-context APIs are unavailable there.

## Exercise catalogue

exercises.json currently contains 469 rows and 469 unique exercise names after removing the duplicate JM Press and Tate Press rows.

Retained variants:
- JM Press — barbell (B)
- Tate Press — dumbbell (D)

The four-field exercise row format is:
name | split | load/type code | muscle

## Ranking system

The runtime contains 460 standards and 46 tiers.

Ranking uses logged exercise performance relative to bodyweight, with optional age and height/ROM adjustments. The 1RM/rank/PR estimator intentionally uses 1–12 reps. Sets above 12 reps are still logged but are explicitly excluded from rank and PR calculations.

The overall rank shown on the Ranks screen is the arithmetic average of the rank indices for logged exercises that have a recognized standard and rankable data. It is not a separate hidden compound-only score.

Muscle ranks are calculated separately from the exercise-to-muscle transfer model and displayed on the front/back anatomy maps.

The rank tier list is data-driven from ranks-config.json; there is no separate hardcoded tier-name list.

## Tutorial

The current 10-step tutorial is:

1. Welcome to Lift
2. Start a workout
3. Add your exercises
4. Log every set
5. Review finished workouts
6. Set your athlete data
7. Calculate your rank
8. Read the muscle map
9. Standards, backups & updates
10. That is the whole loop

The hosted build can check for a newer service-worker build. In the local file:// build, the Profile action is labeled Reload because a local HTML file cannot download a replacement file by itself.

## Build pipeline

Edit source/config files, then run:

    node build.mjs

The build:

1. Reads exercises.json and ranks-config.json.
2. Validates their expected shapes.
3. Injects the JSON into the marked regions of app.js.
4. Removes any existing lift-anatomy-map-style block and inserts exactly one current anatomy stylesheet.
5. Regenerates both index.html and lift-local.html.
6. Verifies those two HTML files are byte-identical.
7. Computes a deterministic short content hash.
8. Writes a clean service-worker cache name as liftlog-v<BUILD_VERSION>-<hash>.

The build is idempotent: running it twice produces byte-identical generated files.

## Tests

Run:

    node tests/smoke.mjs
    node tests/rank-progression.mjs
    node --check app.js
    node --check sw.js
    node build.mjs

The smoke test checks embedded JSON parity, 46-tier configuration, single anatomy-style injection, generated-file parity, dead-3D cleanup removal, version consistency, duplicate exercise names, runtime SVG ID uniqueness after front/back namespacing, icon references, and build idempotence.

## Anatomy licensing

See ANATOMY_CREDITS.md and LICENSE-MUSCLE-MAPPER.txt.

The upstream muscle_mapper repository is MIT-licensed as software, while its README states that the bundled advanced SVG assets are provided by Ryan Graves under CC BY 4.0. Lift preserves that attribution.
