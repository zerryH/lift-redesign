# Slat 5.7.11 — exact weights during set edits

Saving a note, RPE or quantity edit used to reparse the rounded weight displayed by the editor. A 60 kg set displayed as 132.3 lb could become 60.01034191833514 kg even when the weight field was untouched. Fine-grained kg records were rounded too.

The editor now retains the original recorded weight when its displayed field is unchanged. Explicit weight changes still use strict validation and convert from the unit in which the editor opened. Legacy negative assistance values retain their original sign during unrelated edits. No migration or rewrite of stored workouts is performed.

Regression coverage exercises kg/lb note and RPE edits, assistance, distance and duration records, persistence and reload, explicit weight changes, and invalid input. Chromium and WebKit journeys cover the actual edit form.
