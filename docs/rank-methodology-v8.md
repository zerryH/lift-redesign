# LiftLog ranking methodology v8

**Release:** 5.5.85  ·  **Standards:** 468 exercises  ·  **Tiers:** 46

## Purpose
LiftLog v8 is an exercise-specific heuristic ranking system. It compares a logged estimated 1RM against a dedicated threshold ladder for each supported exercise without claiming to represent measured population percentiles.

## Calculation
1. A set is converted to estimated 1RM using Epley for 1–12 reps and the configured rep-reliability curve. A zero/negative load never produces a ranked result.
2. Load semantics are exercise-specific. Bilateral dumbbell exercises score both dumbbells internally, while the displayed bodyweight ratio remains based on the user-entered per-hand load. Bodyweight and assisted movements use their dedicated effective-load rules.
3. The score is normalized to reference bodyweight using the configured allometric exponent, then adjusted by age and a small height/ROM correction. Taller athletes receive a small penalty rather than a bonus.
4. Each exercise has its own Wood-I and Blue-Gem reference ratios and its own 46-step ladder. Compound, isolation, machine, bodyweight and leg movements therefore do not share one universal strength scale. Leg movements use intentionally harder ladders; for example, 3× bodyweight on a leg press is not treated as equivalent to 3× bodyweight on a bench press.
5. Age is a modest heuristic: youth and older-lifter adjustments are intentionally capped. A 17-year-old and a 20-year-old with the same lift can therefore receive different scores without age overwhelming the underlying lift.

## Tier ladder
The visible ladder remains 46 tiers: Wood I–V, Bronze I–V, Silver I–V, Gold I–V, Platinum I–V, Emerald I–V, Sapphire I–V, Ruby I–V, Diamond I–V, and Blue Gem. Exercise-specific anchors place Wood I around a beginner-strength level and Blue Gem near the high end; the exact kg threshold varies by exercise, sex reference, ROM and load semantics.

## What v8 does not claim
- It is not a population percentile table.
- It is not medical or biomechanical validation.
- It is not an official federation standard.
- It is not copied from Strength Level or ExRx threshold tables.
- It does not imply that a rank is an objectively true measure of strength.

## Reproducibility
`tools/generate-rank-standards-v8.mjs --check` regenerates all 468 ladders from the checked-in exercise metadata and documented Lift-owned anchors and verifies that the checked-in thresholds match.

## Versioning
Changing anchors, the tier curve, reference factors or exercise metadata increments the ranking version and invalidates cached rank results so they are recalculated from the saved workouts.
