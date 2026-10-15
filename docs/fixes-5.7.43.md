# Accessible another-tab recovery — 5.7.43

Reproduced on 5.7.42: open a dialog, then receive a save from another tab. On the next dialog lifecycle update, the recovery panel becomes inert because the existing editor remains the active dialog. Its Export this tab and Reload latest controls are unreachable; dismissal is intentionally blocked during the conflict. Higher rank overlays can also cover the warning.

Conflict recovery now participates in the dialog lifecycle with explicit highest priority. It is an alert dialog with a named heading and description, immediately focuses Export this tab, traps keyboard navigation between its recovery controls and keeps the paused editor inert. Repeated conflict signals reuse the same panel. Escape does not dismiss protection. The panel sits above existing overlays and scrolls within the available viewport.

Export still downloads the paused tab's in-memory recovery copy; Reload latest still loads the other tab's durable state. No storage conflict guards are relaxed, and no workout, calendar, ranking, timer or backup data is migrated.

Regression coverage uses the real lifecycle and recovery handler with existing action, sheet and rank dialogs, plus no pre-existing dialog. Browser journeys use two real tabs, interrupted editor interaction, keyboard cycling, recovery download contents and reloading the latest copy; rank overlay recovery is checked separately.
