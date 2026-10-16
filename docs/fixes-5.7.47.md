# 5.7.47 — keep keyboard undo inside the active dialog

## Reproduced on 5.7.46

With two logged sets, open the confirmation to delete the first set and press Ctrl/Cmd+Z while focus is on a dialog button. The global workout shortcut still removes the last set behind that dialog. Confirming the original deletion then removes the first set too and replaces the single Undo record, leaving the other removal unavailable to Undo.

If an Undo record already exists, the same shortcut can instead restore it behind the dialog. The isolated regression failed on the published source because both the in-memory workout and its persisted copy changed while confirmation was open.

## Focused fix

The global quick-action keyboard handler now defers to the existing visible-dialog lifecycle. On non-editor dialog controls it consumes Ctrl/Cmd+Z, preventing both app undo and the browser's fallback undo from reaching behind the dialog. Input, textarea and select controls retain native undo. Normal workout recovery resumes after closing the dialog; Escape, Tab and keyboard activation retain their own handlers.

The first PR browser attempt caught a remaining issue in an earlier candidate: simply returning from the handler preserved the sets but still allowed a save timestamp/revision change during the real shortcut. The completed log is retained on the PR. The corrected candidate also blocks default undo on non-editor dialog controls, while explicitly testing that text-field undo is not cancelled. The exact memory/storage assertions remain unchanged.

The isolated regression covers Ctrl and Cmd with and without a prior removal, unchanged memory/storage while a dialog is open, native text-field handling, exactly one confirmed deletion, subsequent Undo and reload. The Chromium/WebKit journey uses real keyboard input in the delete confirmation and checks exact saved set identities and data, dismissal, confirmation, normal undo and reload.

No storage/backup format, measurement, exercise catalogue, ranking, calendar or timer behavior was changed. Release/check/deployment evidence is recorded on the PR. This is a focused reproducible fix, not an exhaustive zero-bug claim.
