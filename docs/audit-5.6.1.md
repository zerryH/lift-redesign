# Slat 5.6.1 audit and 5.6.2 activity update

Audited 11 October 2026. Source: `da9f6c51adc2e83c4e11678c0bd97c059435a5b2`, the latest public build at audit start. The audit reads repository data, not a user's private device database. No personal workout backup was supplied.

The complete exercise catalogue contains **472 rows / 447 distinct movements / 25 aliases**, with **400 ranked** and **47 tracking-only** movements. All rows satisfy the executable identity, equipment enum, split, tracking, load protocol, muscle-routing and threshold contracts. The all-row runtime journey logs and round-trips all 447 movements and checks 400 × 2 reference tables × 46 tier boundaries. Content issues below still exist despite those structural checks.

[Every record's review result](catalogue-review-5.6.1.md) includes all rows, their equipment/muscle/tracking metadata, aliases and individual follow-ups.

## Confirmed defects

| ID | Priority | Reproduction and effect in 5.6.1 | Required action / 5.6.2 status |
|---|---|---|---|
| A01 | High | Start Bench Press with a draft of 20 kg, type 67.5, then reload without changing another field. Memory is 67.5, but the persisted draft is 20. Repetitions have the same listener-order problem. | **Fixed**: persist after parsing the final input; runtime and actual browser reload checks. |
| A02 | Medium | Two Bench Press sessions on the same date: older session 40 kg, newer session 80 kg. Last time returns 40 because date-only sorting leaves older insertion first. | **Fixed**: tie-break equal dates by descending workout ID. |
| A03 | Medium | Search the declared alias `Dumbbell Bicep Curl`. The canonical movement is `Dumbbell Curl`, but alias terms are not indexed, producing no results. | **Fixed**: all 25 declared aliases searchable; canonical identities remain unchanged. |
| A04 | Medium | Type `45abc` into a timed set or `65oops` into bodyweight. The parser silently records 45 seconds or 65 kg. Distance has the same permissive parsing. | **Open**: strict finite numeric parsing shared across all measurement fields; reject trailing text and explain the invalid field. |
| A05 | Medium | A backup duration of 999,999,999 seconds is accepted. Normal logging caps duration at 86,400 seconds and distance at 100,000 m, but import validation only checks a lower bound. | **Open**: apply protocol-specific limits consistently to new/imported records; preserve raw recovery for legacy anomalies. |
| A06 | High content | `Goblet Squat` (ex196) is tagged **Barbell**, so it appears under the wrong equipment and uses type B. ACE's own exercise entry describes a single dumbbell held vertically. | **Open**: define explicit dumbbell and kettlebell variants, preserve the existing identity/history, and review the standard when changing protocol. |
| A07 | Medium content | Eight reps-only entries instruct “Enter added weight only” although the form has no weight input: Push-Up, Pull-Up, Chin-Up, Bench Dip, Deficit Push-Up, Ring Push-Up, Ring Dip and Close-Grip Push-Up. | **Open**: use reps-only instructions; link to a separately defined weighted variant where appropriate. |

## Content and ranking review, distinguished from proven runtime defects

| ID | Priority | Evidence / concern | Next action |
|---|---|---|---|
| C01 | High | Svend Press is tagged Barbell and uses the bench movement family. Spanish Squat is tagged Barbell with a normal loaded-squat protocol. Generic Farmer’s Carry is also Barbell. | Define the actual supported equipment/variant and load convention before changing tags or rankings. Spanish squat sources show band support; a supported-band version needs a distinct protocol. |
| C02 | Medium | Battle Ropes is classified as Quadriceps and assigned only quads/glutes/hamstrings/upper-back contributions. Shoulders, arms and core are absent; the instruction calls it a “hold.” Turkish Get-Up also inherits the broad olympic/quad model. | Replace broad family defaults with movement-specific content. ACE's battle-rope research supports reviewing the omitted upper-body/trunk routing; numerical contribution weights need their own review. |
| C03 | High | Close-Grip Bench Press and JM Press use triceps-isolation anchor ratios (0.10–1.50), while Bench Press uses the bench family. All 400 ranked identities are explicitly marked provisional. | Independently calibrate the pressing families, record evidence and publish a versioned ranking migration. This audit does not establish a scientifically correct replacement ladder. |
| C04 | Medium | Many names still leave the implement or counting method implicit: Reverse Curl, Upright Row, Drag Curl, Wrist Roller, Single-Leg Romanian Deadlift and Farmer’s Carry. | Clarify displayed variant names and total/per-side/per-implement counting. Maintain stable IDs and searchable legacy names. |
| C05 | Medium | Cable and machine stack numbers are compared without storing machine/pulley configuration. | Optional equipment-specific notes or profiles, with an explicit same-machine comparison convention. |

## Requested calendar — delivered in 5.6.2

History contains a January–December activity grid with Monday–Sunday rows, month labels and year navigation. It uses exactly two fill colors: neutral grey for zero completed workouts, and the existing theme accent (`--ac`, purple in the current theme) for any completed workout. One workout has **no count label**; two or more show their small exact count. It never uses an intensity gradient.

A larger Month view shows numbered dates and the same activity/count rule. Year view scrolls horizontally within its card on narrow screens. Keyboard users can focus a day and navigate with arrow keys. A day detail announces the date, completed workout count and logged sets; View workouts filters History to that date.

Counts derive directly from finished records with at least one set. Drafts and rank-calculator checks are excluded. Existing history appears immediately. Completing a session adds activity; editing replaces the existing session; deletion and undo remove/restore its activity. The calendar stores no separate counter that could drift after imports or edits. It uses the saved workout date, including sessions started before midnight.

## QoL additions to prioritize next

1. **Workout date/name correction and backfilling.** A forgotten session should be assigned to its actual day without editing a backup. Make date changes update provenance and calendar placement deliberately.
2. **Progress for tracking-only movements.** Current progress choices are strength/rankable lifts; durations, distance, bands and most unranked bodyweight work need appropriate trend views rather than estimated 1RM.
3. **Saved workout routines and repeat-session creation.** The current split choices start clean; users cannot save a personal ordered routine with target sets/reps/rest and launch a copy.
4. **Rest timer controls.** Add an explicit enable/disable setting and clearer help. Consider per-exercise rest presets and optional completion feedback, respecting foreground/background browser behavior.
5. **History search/filtering and read-only session details.** Calendar date filtering is implemented; next add exercise, split and text filters and a view action that does not enter edit mode.
6. **Training summary.** Weekly/monthly sessions, logged sets per muscle and selected-period comparisons can build on the calendar's exact records; keep any training guidance separate from rank rewards.

## Validation

- 47/47 isolated regression scripts passed locally, including both new calendar/audit scripts.
- Numerical generator parity passed for all 472 rows. No ranking thresholds or database identities changed in this release.
- Calendar fixtures check every weekday and month length across 2020–2040, leap day, Monday 1 July 2024, multiple sessions, zero/single-session badge omission, empty histories, filtering, edits and deletion.
- Real Chromium/WebKit CI journeys exercise calendar counts, edit/delete/undo, light/dark screenshots, a 320 px viewport, keyboard navigation, reload, and immediate draft-weight/reps persistence. The release must pass these on its exact branch head before merging.
- Physical iOS/Android, installed-PWA interruptions, VoiceOver/TalkBack, native keyboard/wake-lock behavior and empirical rank calibration remain independent validation tasks from the earlier quality plan.

## External content references

- [ACE Goblet Squat](https://www.acefitness.org/resources/everyone/exercise-library/362/goblet-squat/): dumbbell equipment and setup.
- [ACE muscle activation during battle-rope exercises](https://www.acefitness.org/continuing-education/certified/research/7470/muscle-activation-during-battle-rope-exercises/): original commissioned research; motivates review, not fabricated numerical map weights.
- [Mirafit Spanish squats](https://mirafit.co.uk/blog/spanish-squats/): equipment maker's band-supported exercise description.
