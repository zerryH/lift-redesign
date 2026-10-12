# Slat 5.7.9 — preserve custom names and simplify exercise choices

- Saving an unchanged custom-exercise name is now a no-op. Previously the rank-check rename path wrote the check under the same key and then deleted that key, silently removing the user's saved check. Existing measurements, draft data, identities and durable state remain intact; real renames still move the check and update exercise labels.
- Routine and Progress selectors now test the original name against its canonical identity. The previous lookup resolved an alias before checking its alias flag, offering duplicate choices such as Dumbbell Bicep Curl and Dumbbell Curl. Historical alias records retain their identity and measurements; charts and routines use the canonical choice.
- The local-file browser reload journey now waits for the requested navigation to complete before inspecting restored data. The 5.7.8 post-merge browser failure occurred in that journey; its notification-expiry check had passed.
- Browser undo assertions wait for the restored data and cleared undo record after native pointer input. A subsequent WebKit run exposed an immediate row-count assertion racing that input; the set and workout restoration assertions remain unchanged.

Validation covers unchanged and real name saves, reload persistence, every catalogue alias in both selectors, and real browser interactions for saved checks and routine selection. No exercise catalogue, rank standards, workout data or notification behavior is migrated.
