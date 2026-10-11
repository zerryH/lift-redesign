# Slat ranking methodology v10

Release 5.6.0 uses a versioned, explicit exercise catalogue. There are 472 readable legacy names, 447 distinct browse identities, and 400 ranked movements. Twenty-five true synonym names resolve to an existing identity; old workout sets remain intact. The threshold file retains 472 ladders for compatibility, but unsupported tracking modes cannot use them.

## Calculation and input contract

Weights are stored in kilograms. Pounds are converted at input and presentation boundaries using 2.20462 lb per kg. Each catalogue record declares equipment, split, primary muscle, muscle contributions, tracking mode, implement count, and an input instruction. The engine uses the corresponding explicit metadata rather than inferring it from a display name.

Working sets of 1–12 reps use Epley estimated 1RM and the configured rep-reliability curve. Warm-ups, timed holds, distance sets and band sets never enter estimated strength ranking. Assisted load is max(0, bodyweight − assistance). Weighted bodyweight movements add external load to the configured bodyweight fraction; push-up variants use a 0.65 approximation. Most bodyweight core and conditioning movements remain tracking-only because a full-bodyweight strength protocol would be misleading.

Normal load equals the entered load times the recorded implement multiplier. Explicit one-implement and unilateral movements count one implement. Paired dumbbell movements instruct the user to enter weight per dumbbell. Machine and cable performance depends on pulley setup and equipment; comparisons remain approximate.

Estimated strength is normalized to reference bodyweight with exponent 0.67. Optional age and height adjustments use the checked-in configuration. Age is derived from birth year, with a 20–40 baseline and a maximum multiplier of 1.12. Height multipliers are capped at 0.94–1.06. These are product heuristics, not measured population percentiles or biomechanical validation.

## Result provenance

- The calculator always previews the submitted inputs. It does not mutate profile settings or workout ranks.
- Save check explicitly keeps raw inputs, reference, bodyweight, height and date in `checks`. Checks recalculate under current age/adjustment settings, retaining their saved sex reference, bodyweight and height. They do not contribute to earned overall or muscle ranks.
- Only completed workouts contribute to earned ranks. A draft or in-progress edit has no effect until Finish saves it. Each set keeps its recorded bodyweight and height.
- Earned ranks are derived caches. They rebuild from completed sets; only raw records and saved checks are persisted.
- Synonyms resolve exercise identity. Benchmark inheritance is independent and never creates an achievement on a different exercise.

## Tier and muscle aggregation

Each ranked exercise retains 46 ascending thresholds from Wood I through Blue Gem. A below-first-threshold result is Unranked and receives a first-tier target. A maximum result is explicitly marked as maximum. Remaining load is a change in estimated 1RM, not an instruction to add that amount to the next set.

Overall rank is the mean earned exercise tier, rounded for its label. Muscle rank is the weighted mean continuous tier position of its explicitly contributing earned exercises. It uses the weights in `exercises.json`, never equality between benchmark aliases. Forearms, adductors and tibialis have list summaries; their SVG coverage is not complete. A muscle without a supported earned performance stays unranked even if an unranked activity has been logged.

## Reproducibility and limitations

`node tools/generate-rank-standards-v9.mjs --check` verifies all retained ladders. The filename is retained for existing automation; the generator writes ranking version 10. Anchors are Slat-owned estimates. New hip-isolation, shrug and wrist families replace unrelated fallback families. Catalogue and protocol changes can change displayed ranks while preserving original recorded loads.

Automated tests check identity, routing, shape, conversions, boundaries, preview isolation, imports and persistence. They cannot validate the empirical fairness of these standards. Device gesture, screen-reader and service-worker lifecycle checks remain separate release gates.
