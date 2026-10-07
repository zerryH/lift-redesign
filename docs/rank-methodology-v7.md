# LiftLog ranking methodology v7

**Release:** 5.5.84  ·  **Standards:** 468 exercises  ·  **Tiers:** 46

## Purpose

LiftLog v7 is an exercise-specific heuristic ranking system. It is designed to make the same user's lifts comparable across different movement types while avoiding the claim that the result is a measured population percentile.

## Inputs

Each exercise receives a movement-family anchor from its own metadata. The model also uses:

- reference bodyweight: 75 kg for the male reference and 60 kg for the female reference;
- exercise family (bench, squat, deadlift, row, pulldown, machine, isolation, bodyweight, core, etc.);
- ROM class (`high`, `medium`, `low`);
- unilateral handling where applicable;
- load/equipment type from the exercise catalogue; and
- a 46-step internal tier progression.

Female reference thresholds use a fixed 0.68 factor in v7. This is a product heuristic, not a claim about population physiology.

## Tier progression

For tier index `i` from 0 through 45, the progression multiplier is:

`1 + 2.4 × (i / 45)^1.45`

The resulting value is multiplied by the exercise's Lift family anchor and reference bodyweight, then adjusted for ROM and unilateral movement where applicable. Thresholds are rounded to practical load increments and forced to remain strictly increasing.

## What v7 does not claim

- It is not a population percentile table.
- It is not medical or biomechanical validation.
- It is not an official federation standard.
- It is not copied from Strength Level or ExRx threshold tables.
- It does not imply that a rank is an objectively true measure of strength.

## Reproducibility

`tools/generate-rank-standards-v7.mjs --check` regenerates the expected threshold ladders from `ranks-config.json` metadata and verifies that the checked-in thresholds match the published methodology.

## Versioning

Changing anchors, the tier formula, reference factors or exercise metadata should increment the ranking version and be documented before release.
