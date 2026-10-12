# SLAT code audit - 12 October 2026

Release candidate: **5.7.14**, based on main `f287470f84f0088a93c0abf26428e8968cb3e946` (5.7.13 / PR #113). This audit preserves the recently merged updater and earlier exact set-edit fixes. All probes use synthetic state, never production workout records.

## What changed

The release addresses twenty reproduced defect or failure-path cases. It also restricts custom benchmark comparisons when an explicitly supplied muscle or equipment family conflicts with the selected standard. It does not claim that every possible defect has been found, or that the benchmark model has been empirically validated.

| Case | Before | Change and regression evidence |
| --- | --- | --- |
| A01 | Imported routine targets could insert HTML into the current workout. | Validate numeric targets and escape every target/input display. Malformed backups leave saved bytes unchanged. |
| A02 | Restored draft strings could break input attributes; draft fields could replace exercise identity. | Escape slider/input attributes and whitelist editable draft fields. Invalid text remains available for correction. |
| A03 | A non-array correction history crashed session details and corrections. | Validate imported correction records and tolerate malformed existing lists when displaying or appending a correction. |
| A04 | A 150,000-session history overflowed the argument stack while calculating calendar bounds. | Calculate bounds in one streaming loop; the actual History view renders the fixture. |
| A05 | A custom name matching a built-in or another custom exercise changed load/rank resolution. | Reject case-insensitive name collisions before backup replacement, using the current catalogue. |
| A06 | Switching calculator units rounded canonical measurements and changed scores. | Retain exact kg values behind the displayed text; only explicit edits replace them. Ten switches retain the exact load, bodyweight and result. |
| A07 | An overlong custom ID was accepted, then produced a self-export the validator rejected. | Apply the existing 160-character identity contract consistently to custom/workout/routine references. |
| A08 | Old controls, keyboard shortcuts and timer ticks could mutate a replacement while its save was pending. | Hold an import lock through acknowledged save; guard delegated actions, inputs, mapping changes, close controls, shortcuts and old rest callbacks. |
| A09 | Closing legal sheets by button left global keyboard listeners registered. | Use the shared dialog lifecycle; twenty open/close cycles retain the baseline handler count. |
| A10 | Valid custom names such as `toString` resolved inherited object members instead of their metadata/standards. | Require own properties and use a null-prototype best-result accumulator; mapped prototype-like names earn the expected rank. |
| A11 | Duplicate imported workout IDs made an editing draft replace the wrong saved workout. | Reject ambiguous import identities. Preserve both existing saved records and detach an ambiguous preexisting draft from replacement. |
| A12 | Contradictory typed sets could be imported and earn strength ranks. | Validate duration/distance/repetition invariants and independently exclude typed duration, distance and band sets from estimated 1RM. Loaded timed custom exercises remain supported. |
| A13 | A valid zero bodyweight factor became one in recorded provenance. | Preserve finite zero, fractional and one factors exactly. |
| A14 | Imported manual checks silently rounded fractional reps. | Validate calculator inputs at import; rank refresh excludes invalid fractional reps instead of rounding them into valid measurements. |
| A15 | Routine names and IDs could identify different or missing movements. | Validate imported references against built-in/custom identities. Session creation resolves known names and blocks unresolved or contradictory references. |
| A16 | Dates before 1900 could be accepted while remaining unreachable in the activity calendar. | Import and correction contracts require the supported 1900-9999 range; the date editor exposes the lower bound. Existing archival source values are not rewritten by a broad date migration. |
| A17 | Pending/blocked IndexedDB operations could leave startup or a save pending indefinitely. | Bound opens and transactions to five seconds, close abandoned late connections, abort timed-out transactions and release connections on version changes. Startup can use the intact local copy. |
| A18 | Two writers could both acknowledge successful local fallback after failed database writes without coordination. | Require Web Locks for online database-failure fallback; otherwise report failure without writing. Keep coordinated fallback and IndexedDB-only saves available. |
| A19 | Reset removed primary state but retained personal import/migration/startup recovery copies. | Delete and verify the explicit personal-key inventory, preserve unrelated origin keys and retain rollback on failure. |
| A20 | Same-key worker reinstall could replace an active cache before validation failed. | Existing caches are verified without rewriting; new invalid staging is deleted. Include normalized worker source in the cache fingerprint so worker-only changes receive a new identity. |

## Prior register reconciliation

The separate 5.7.13 report uses identifiers F01-F20. Preserve that report as a historical baseline; this status supersedes its implementation plan.

| Prior finding | Current status |
| --- | --- |
| F01 database requests | Addressed by A17; deterministic stalled-open/read and blocked-open tests. Physical storage-eviction behavior remains a device gate. |
| F02 fallback writer race | Addressed by A18 through a conservative coordination policy. No unlocked online fallback write is acknowledged. |
| F03 reset recovery copies | Addressed by A19, including startup recovery and unrelated-key preservation. |
| F04 duplicate editing IDs | Addressed by A11 for import and existing local state. |
| F05 custom name shadowing | Addressed by A05. |
| F06 contradictory typed measurements | Addressed by A12. |
| F07 unrelated custom standards | Partially addressed: explicit muscle routing and recognizable equipment families must be compatible. Incompatible saved checks retain their raw inputs with a repair message and recalculate when the mapping is corrected. A complete movement-family compatibility policy and legacy mapping review remain open. |
| F08 zero provenance factor | Addressed by A13. |
| F09 fractional saved checks | Addressed by A14. |
| F10 routine references | Addressed by A15; unresolved sessions do not start. |
| F11 calendar date range | Addressed by A16 for new imports/corrections; old archival records are retained. |
| F12 backup freshness | Open: reminders still use workout IDs/export requests rather than an exported content revision or confirmed retained file. |
| F13 full-history work | Open: rendering/rank rebuilding/saving still scan or serialize the full history. Container stress timings are not phone latency measurements. |
| F14 text budgets | Open: imported notes/bands can exceed creation/edit limits. Do not silently truncate historical text. |
| F15 cache reuse | Addressed by A20; retains the active-cache isolation already merged in #113. |
| F16 duplicate offline package | Open improvement: generated HTML and precached source contain duplicate payloads. Reducing the runtime graph needs offline/local-file acceptance tests. |
| F17 keyboard conflict bypass | Addressed by the shared import/finish/conflict guards in A08; the Ctrl/Cmd+Z conflict fixture preserves the set. |
| F18 legal listeners | Addressed by A09. |
| F19 HTML-string composition | Open maintenance risk: feature insertion still depends on literal view fragments. Current view tests pass; no missing current control is claimed. |
| F20 export/import capacity | Open: sufficiently large valid exports can exceed the 25 MiB import ceiling. A measured, restorable large-backup route is needed. |

## Validation and release gate

`tools/test-release.mjs` runs each regression script in an isolated copy, so build-mutating tests cannot hide stale committed outputs. The release includes two new regression scripts (`full-audit-regressions.mjs` and `audit-data-contracts.mjs`) and adds three Chromium/WebKit browser journeys for malformed backups, delayed imports and exact calculator units/dialog Escape behavior.

Required checks: all 60 independent scripts; the deterministic 475-exercise ranking generator; a reproducible build with no generated-file diff; Chromium and WebKit journeys on the exact PR head; and the optional iOS project compile. Merge only after those checks pass. Verify the Pages merge SHA and compare live `version.json`, `app.js`, both generated HTML files and `sw.js` to the release bytes.

No catalogue entries, standard ladders, raw workout loads or user notes are automatically rewritten by this release. Reset cleanup runs only after the user invokes and confirms Reset. Unsafe backups are rejected before replacement, with existing durable state preserved. The in-app glass rest countdown remains live; web notifications remain explicitly static next-set reminders, as requested.

## Coverage and limitations

Reviewed: app controllers and bootstrap, state repair, persistence, backup contracts, session transitions, measurement provenance, catalogue identity, ranking engine, routine/progress enhancements, dialogs, rest notification/native bridge modules, worker lifecycle, deterministic build, release workflows and optional Swift app/widget code. Structural tests cover 475 names / 450 canonical identities, 400 ranked movements, 46 tiers and 16 anatomy zones. Browser journeys log canonical movements through actual controls, exercise save/reload/undo/conflicts, validate layout and test offline/update behavior.

Actual iPhone Home Screen suspension, VoiceOver/TalkBack, OS notification delivery, storage eviction, power interruption and native Live Activity appearance require physical-device verification. A native compile is not a device runtime test. The standards are labeled provisional Slat heuristics; catalogue consistency and mathematical regression tests do not establish physiological validity or population fairness.

## Focused next work

1. Make backup freshness reflect content changes and provide a compatible route for large backups (F12/F20).
2. Define field/record budgets with a visible legacy-data policy (F14).
3. Measure logging/save latency on a real iPhone before changing full-history storage or caching (F13).
4. Design explicit movement-family compatibility for custom benchmarks; keep uncertain mappings unranked (F07).
5. Reduce duplicate offline assets and replace literal-string feature assembly with explicit composition points (F16/F19), with existing durability/offline checks retained.

These are tracked follow-ups, not completed features. The current release prioritizes demonstrated safety and correctness failures.
