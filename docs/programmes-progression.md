# Programmes and transparent progression

F04 and F05 add optional structure without turning intentions into completed workouts.

## Programme planner

Home → Next session supports a saved-routine rotation or selected weekdays. The secondary editor orders routine IDs and chooses the next local date. Start copies the current routine into the single active workout. Editing a routine or programme cannot rewrite that copied session or completed history. An active linked session must be finished/discarded before changing its sequence.

Move changes one planned date, including an intentional second session on the same day. Skip marks that date skipped and schedules the same routine on the next eligible date; it does not advance the rotation. Missed dates remain explicit instead of silently earning completion. Pause retains intentions and history. Only the next slot is scheduled; an acknowledged Finish creates the following slot.

Finish stores its linked workout, retires that scheduling slot and advances the cursor in the same state snapshot. A failed save rolls all of them back. Editing an existing workout does not advance twice. `advanced` means the scheduling slot was consumed, not that it necessarily still has a completed workout: completion/adherence always derives from saved workout IDs. Deleting history cannot silently replay an old rotation slot.

Calendar plans have an outline and accessible planned/skipped text. Existing accent fill and tiny multiple-session count still derive only from completed activity. Plans do not earn ranks.

## Version 1 progression

Suggestions are off by default and configured per stable exercise ID, recorded load protocol and setup label. Users choose a rep range, working-set count and increment. The latest completed comparable session supplies source workout/set IDs. Warm-ups, future dates, drafts, calculator checks, different setups/bands and incomplete routine targets cannot trigger an increase. Every working set must reach the chosen top range. Mixed loads require manual review.

Ordinary loaded movements add the chosen increment; assistance decreases toward zero. Reps-only and band movements receive repetition targets, never invented kilograms. Duration/distance logging is unchanged; this first rule applies to repetition-based movements.

Review shows Why and the exact source. Accept applies the computed target to the unfinished draft; Apply edited target uses explicit user edits; Ignore preserves current inputs. Notes and RPE survive. These choices never rewrite logged measurements or guarantee safe loading. The decision retains its rule version/snapshot and source IDs, so a later rule edit cannot change what was accepted. The same source is not silently applied twice.

## Portable state

The validated arrays are `programmesV1`, `planSlots`, `progressionRules` and `progressionDecisions`. `planLink` identifies the original planned slot on a copied/completed workout. Existing unstructured `programmes` JSON from older compatible backups is retained untouched; the new versioned key avoids taking ownership of that previously unspecified field.

All fields participate in normal backup export, verification/replacement preview, restore, recovery checksums, migration and reset. Snapshot format-1 wire counts remain frozen. Old backups default to empty arrays; exact loads, stable IDs, typed drafts and additional unknown fields remain intact.

Local feature/regression tests and both editor configurations are required. Browser journeys exercise create/move/start/finish/reload, explicit progression and enlarged-text themes. PRs retain actual gates, artifacts and deployment evidence. Physical iPhone Home Screen/VoiceOver sign-off remains separate.
