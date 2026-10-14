# Slat 5.7.32 — live logging and accessibility fixes

The broader live UI audit reproduced these defects on 5.7.31 using synthetic records:

- Invalid typed weight/reps vanished after changing exercise or reloading, while stale invalid flags kept preventing a set from logging.
- A precise 67.25 kg draft displayed as 67.3 kg after reload, and the range could show a different snapped value.
- Non-numeric weight sent the range to its browser-default midpoint, despite the readout showing zero.
- Pound-labelled sliders announced canonical kilogram values instead of the selected unit. Exercise search, bodyweight and ranking toggles lacked useful stable accessible names.
- Free workout History rows, filters, read-only details and derived routines displayed the internal name Empty. Their presentation now says Free workout without renaming durable split keys or user-supplied names.

Draft source text is now additive backup data alongside canonical measurements. Weight source units remain attached to the draft. Restoring raw text independently recalculates its value/validation, so a contradictory stored numeric field cannot bypass validation. Blank, invalid and decimal-comma inputs remain editable. Repeat, deliberate slider input and equipment changes clear stale raw fields. No completed sets, exercise identities, dates, ranks or timer preferences are migrated.

Inputs expose invalid state with a visible border; an invalid range has a finite zero fallback and announces that a valid weight is needed. Valid ranges announce the precise input value in the selected units. Exercise search, Profile bodyweight and adjustment toggles have explicit accessible names. The Home introduction's missing text-space is also corrected.

Validation: `tests/typed-draft-retention.mjs` covers navigation, reload, backup restore, inconsistent draft records, precision, unit changes, blanks, decimal commas, attribute escaping and repair controls. `tests/workout-display-labels.mjs` verifies presentation-only free workout naming, search and filter keys. `tools/test-browser.mjs` adds real Chromium/WebKit coverage of those user journeys and accessible names. The full release suite contains 73 independent scripts. Publication remains gated on green exact-head regression, browser and native CI plus Pages verification.

This is a focused set of confirmed fixes, not a claim that every screen or physical device is bug-free. User-specific glitches and actual iPhone suspension/notification/VoiceOver behavior still need reproducible examples or device testing.
