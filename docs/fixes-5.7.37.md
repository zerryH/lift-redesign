# Interrupted-save recovery — 5.7.37

Two persistence failures were reproduced on 5.7.36:

- Rejecting the browser Web Lock request during Finish rejected the save promise. The finish handler expects a false failure result, so its rollback was skipped and the draft disappeared from the current view even though no completed workout had been saved.
- A cross-tab BroadcastChannel error after successful storage writes rejected the save and displayed an action failure despite the workout being durable.

The queued save boundary now converts coordination failures to its existing false result, sets the visible failed-save status, and permits the normal draft/rest rollback and retry. It preserves the writer lock requirement; it does not retry without coordination. Advisory broadcast failures are isolated after successful storage acknowledgement.

Regression coverage includes synchronous and asynchronous lock rejection, retained drafts and rest clocks, unchanged durable bytes, retry without duplicates, failed edits retaining prior saved measurements, and successful IndexedDB/localStorage writes with a closed notification channel. The storage and backup formats are unchanged.
