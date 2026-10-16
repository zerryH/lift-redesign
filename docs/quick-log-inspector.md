# Quick logging and rank/setup inspection

F03 and F08 from the approved roadmap are implemented as optional additions to the existing logger and picker.

- All, Pinned and Recent picker modes preserve search, muscle and equipment filters. Pins are ordered stable IDs; the secondary order sheet supports Earlier, Later and Unpin. Archived or unavailable references remain in the order sheet until explicitly removed. Recent derives from completed, non-future history, never drafts.
- Copy previous set uses the current exercise/setup and compatible tracking/load protocol. Invalid typed input remains editable. Copy is an explicit replacement action, never an automatic correction.
- Accepted logs retain a stable workout/entry/set Undo reference. The visible Undo survives reload, targets only that set and waits for save acknowledgement. A failed Undo restores the record. Rapid activations of the same unchanged input within 350 ms accept once; editing inputs starts a new action. Direct internal logging retains its synchronous boolean contract.
- Earned rank buttons and muscle-contribution rank buttons open the source inspector. It groups comparable setup/protocol records, shows the contributing completed set/date and exact canonical load, recorded entered unit, load convention, equipment, bodyweight/height, provenance and current standards. Missing legacy provenance is explicitly labelled. Warm-ups, future workouts and unsupported measurements have exclusion reasons. Calculator checks and drafts remain separate.
- Changing comparison context is explained before opening Profile. Current comparisons recalculate; original measurements and recorded context do not change. Product tiers are heuristics, not population percentiles.

## Portable contract and compatibility

`favourites` is an optional ordered array of at most 500 unique stable exercise IDs. `logUndo` is an optional `{workoutId, entryId, setId}` reference; stale references are discarded without deleting a set. Both are validated, exported, restored and reset. The restore/verification preview counts pins. Snapshot wire counts remain unchanged so older checksummed recovery envelopes still verify; their checksum covers every new field.

No new performance cache exists. Pinning or inspecting a rank never rewrites workouts. Existing backups without these fields default to an empty pin list and no accepted-log Undo. The generic additional-field contract in the previous releases preserves new fields when an older compatible build imports a backup, but only this release supplies the new controls.

## Validation and remaining sign-off

Feature regressions cover stable ordering, reload, exact loads, double activation, invalid text, Undo and backup restore, provenance, separate setups, warm-up/future exclusions and derived Recent. Browser journeys cover real picker controls, export/import, accepted-log Undo after reload, duplicate activation and both themes at enlarged text. Existing regression, both editor configurations, native and browser checks remain required; PR evidence records actual results.

Physical iPhone Home Screen keyboard/VoiceOver and force-close checks remain separate. Automated browser evidence does not establish that sign-off or prove there are no latent bugs.
