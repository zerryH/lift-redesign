# Slat 5.7.24 — rollback-safe reset

## Reproduced defect

Slat can validly have a durable workout copy in IndexedDB when the localStorage fallback is unavailable. Reset previously deleted IndexedDB before clearing session storage. If session cleanup then failed, Reset reported a safe failure but the only database copy had already been removed.

## Fix

- Capture the personal keys in localStorage and sessionStorage plus the IndexedDB state before deleting anything.
- Clear and verify the failure-prone browser stores before clearing IndexedDB.
- If any step fails, restore the captured local, session and database copies.
- Continue to preserve unrelated origin keys.

The change runs only after the user explicitly confirms Reset. It does not alter workouts, calendar history, routines, rankings, preferences or backup contents during ordinary use.

## Regression evidence

`tests/audit-data-contracts.mjs` now models an IndexedDB-only workout with unavailable session storage. The reset attempt must fail without changing the database record. Existing reset-failure integration coverage continues to verify that ordinary local and database copies survive an unsuccessful deletion.
