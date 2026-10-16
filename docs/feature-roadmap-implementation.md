# Feature-roadmap implementation register

Source: the user-approved five-page feature roadmap dated 15 October 2026. This register tracks actual implementation, not an assumption that a specification or issue is finished.

| Feature | Release | Tracking | Current state |
| --- | --- | --- | --- |
| F01 Recovery centre | R0 | [#157](https://github.com/zerryH/lift-redesign/issues/157) | Contract in 5.7.51; external verification in 5.7.52; durable capture/retention, Profile status/list/export and explicit restore implemented in 5.7.53. Exact-head gates/release evidence belong to its PR. Physical-device sign-off and observation remain outstanding; see [the recovery note](recovery-centre.md). |
| F02 Private diagnostics | R0 | [#156](https://github.com/zerryH/lift-redesign/issues/156) | Implemented in the 5.7.54 candidate: bounded redacted events, exact preview/explicit Copy, catalogue-ID shortcut, stale-tab access and reset cleanup. Release gates/publication and physical-device sign-off must be recorded separately; see [the diagnostics note](private-diagnostics.md). |
| F03 Quick logging/favourites | R1 | [#155](https://github.com/zerryH/lift-redesign/issues/155) | Specified; existing previous-set/repeat controls are not the complete feature. |
| F08 Rank/setup inspector | R1 | [#160](https://github.com/zerryH/lift-redesign/issues/160) | Specified; existing provenance and muscle information are inputs, not completion. |
| F04 Programme planner | R2 | [#158](https://github.com/zerryH/lift-redesign/issues/158) | Specified; depends on R0/F03. |
| F05 Progression suggestions | R2 | [#159](https://github.com/zerryH/lift-redesign/issues/159) | Specified; depends on F04. |
| F06 Groups/warm-up presets | R3 | [#161](https://github.com/zerryH/lift-redesign/issues/161) | Specified; depends on R0/F03/F04. |
| F07 Goals/adherence | R3 | [#162](https://github.com/zerryH/lift-redesign/issues/162) | Specified; depends on F04/F05. |

## Delivery boundaries

- Follow the requested first three slices: snapshot/manifest contract; durable recovery/verification interface; redacted diagnostics.
- Each new state field must be validated and included in export, preview, restore, reset and migrations in the same usable vertical slice. Preserve stable IDs, raw measurements and provenance.
- Finish acknowledgement remains authoritative. No plan advancement, suggestion, completed-calendar fill or earned rank may be driven by a failed save or unfinished draft.
- The current regression, both editor configurations, Chromium/WebKit and native build gates remain enabled. Merge exact tested heads and verify Pages bytes.
- A passing automated run is not physical-device sign-off. The actual iPhone Home Screen airplane-mode, force-close, interrupted-save/update, Files import, midnight, keyboard and VoiceOver checklist requires a person with the device.
- Automatic cloud sync, a new native distribution route, social/public ranking, nutrition and opaque AI coaching are deferred by the PDF. They are not silently substituted into this scope.
- Zero observed failures in a documented test set is reportable; zero latent bugs in an entire codebase is not provable by this process.

## Audit scope

Review maintained JavaScript contracts/UI, build/persistence/update workers, native bridge/project, data and validation paths, styles/accessibility and tests. Generated `app.js`, HTML distributions and embedded catalogue/rank/anatomy copies are verified against their canonical sources/build; they are not counted as independent code reviews. Catalogue/standards consistency is checked across all records; fitness heuristic validity still needs independent domain review.
