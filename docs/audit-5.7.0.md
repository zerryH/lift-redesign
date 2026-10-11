# Slat 5.7.0 — audit completion and training tools

Based on public 5.6.2 (4216a5b5c7ade4e4790aa7663bd20dfaadef5e6a). The repository catalogue was reviewed; no private device workout database was supplied. Source and generated distribution remain self-contained and offline-capable.

## Findings addressed

| Finding | Result |
|---|---|
| A04 numeric prefixes | A shared full-value numeric parser rejects trailing text, blanks and non-finite measurements. Decimal commas are supported at entry. Bodyweight, duration, distance, load, reps and edit forms retain explicit validation. |
| A05 import limits | Imports enforce duration ≤86,400 seconds, distance ≤100,000 m, load −60…2,000 kg (legacy assistance allowed), bodyweight ≤500 kg and height ≤230 cm. Existing anomalous state is retained with a startup recovery copy; it is not silently capped. |
| A06 Goblet Squat | Existing ex196 stays stable and becomes explicitly Dumbbell Goblet Squat, with one implement and unchanged load counting. Kettlebell Goblet Squat has a new identity (ex473). Its ladder uses disclosed goblet anchors rather than the barbell squat family. |
| A07 reps-only notes | Eight bodyweight notes now request reps. Push-Up, Pull-Up and Chin-Up expose separately identified weighted alternatives. Weighted Pull-Up and Weighted Chin-Up are new ex474/ex475; other variants can use the existing explicit custom load protocol. |
| C01 equipment/protocol | Svend Press explicitly logs combined squeezed plates. Spanish Squat specifies band support and only extra held load. Both cease using unrelated strength ladders. Farmer’s Carry explicitly keeps total load, preserving old counting; the dumbbell-specific carry keeps per-implement counting. |
| C02 muscle routing | Battle ropes now includes anterior deltoids, trunk, forearms and upper back, with active-work instructions. Turkish Get-Up describes a full cycle per side and includes trunk, shoulder, hip and leg routing. Map weights are product approximations, not measured activation percentages. |
| C03 pressing rankings | Close-Grip Bench Press moves to the pressing family and includes chest/shoulder contributions. JM Press ceases borrowing an isolation-extension ladder until a dedicated comparable standard exists. Version 11 preserves raw sets and original provenance while rebuilding derived ranks. Independent empirical calibration is still unavailable; no scientific validation is claimed. |
| C04 naming/counting | Dumbbell reverse/upright/drag variants are explicit. Barbell single-leg RDL and hanging-load wrist roller instructions define counting. Search retains the original names and stable IDs. |
| C05 machine comparisons | Each exercise can store an optional equipment/setup label. New sets snapshot it; Last time uses the chosen label and progress charts filter by saved setup. Labels never convert stack numbers or reinterpret old sets. |

## Features delivered

- **Date and name correction:** Today → Name & date, including historical Edit. Dates can be backfilled. Finish replaces a historical session rather than adding a second session. Original date/name and original performance context are retained; load, bodyweight and timestamps remain intact.
- **Tracking progress:** History or Profile → Progress charts. Select any movement, metric, time window and equipment label. Timed/distance movements offer best set and daily totals; reps/band movements offer reps. Bands compare within one labelled resistance. Legacy reps-only records have a separate view and never become invented duration/distance. Warm-ups are excluded.
- **Routines:** Build ordered exercises with sets, reps/seconds/metres and rest targets, reorder/remove, save and start. Today can save its exercise order as a routine. Read-only History detail offers Repeat session or Save as routine. Starting copies targets and creates empty set lists with fresh entry IDs.
- **Rest timer:** Explicit off/on, a default duration, per-exercise override (0 skips rest), routine rest targets and optional foreground vibration. Deadlines survive reload. This is a between-set reminder; browsers can suspend background pages, vibration and wake locks.
- **History:** Name/exercise/note/setup text search, split and exercise filters, existing calendar day filter, bounded pagination, and read-only details. Viewing does not open or replace a draft.
- **Summary:** Select a week or month using a date. Exact completed sessions, active days, non-warm-up sets and previous-period comparison. Each set is assigned once to the catalogue primary muscle; these are logging counts, not recovery scores or rank rewards.
- **Calendar:** The existing two-color grey/accent calendar remains derived from completed records. One workout has no numeric badge; 2+ retain exact small counts. All date corrections, finishes, imports, deletion and undo flow through those records.
- **Backup:** Routines, exercise preferences and set equipment context are included in version-4 backups, validated before replacement and persisted with existing transactional/recovery behavior. Older backups without these additive fields remain compatible.

## Remaining validation limits

Engineering checks cannot establish empirical population strength standards or complete physical iOS/Android, installed-PWA interruption, VoiceOver/TalkBack and native keyboard/wake-lock validation. All ranking evidence stays explicitly provisional. These are outstanding validation tasks, not claims that the published app has passed them.

## Content sources

- [ACE Goblet Squat](https://www.acefitness.org/resources/everyone/exercise-library/362/goblet-squat/)
- [ACE commissioned battle-rope research](https://www.acefitness.org/continuing-education/certified/research/7470/muscle-activation-during-battle-rope-exercises/)
- [Mirafit Spanish Squats](https://mirafit.co.uk/blog/spanish-squats/)

Sources support equipment and movement descriptions; they do not establish the numerical rank ladders or numerical anatomy-map weights.
