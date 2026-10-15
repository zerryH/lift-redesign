# Legacy exercise filters — 5.7.35

Reproduced on 5.7.34 with a saved workout containing a movement absent from the current catalogue and custom-exercise registry:

- The movement appeared in the library and displayed an inferred equipment label, but selecting that equipment hid it. The options used the fallback label while the filter required catalogue metadata.
- Its retained muscle category was Custom, but the muscle dropdown omitted that choice.

The equipment options and predicate now share one metadata-or-fallback resolver. The muscle dropdown uses the existing dynamic muscle-options helper. Canonical equipment labels retain their current filtering behavior.

No storage format, workout records, exercise names, ranking protocols or timer behavior changes. A regression script covers combined filters, nonmatching equipment, canonical exercises and unchanged workout history.
