# 5.7.50 — refresh rank displays when calculator units change

## Reproduced on 5.7.49

Changing kg/lb inside Get your rank updates the shared preferred unit and saves it. The calculator refreshed, but the rank view behind it did not. Closing the calculator without Save check left saved-check values, bodyweight, assistance and earned-rank displays in the old units until another action happened to redraw the page. For example, the preference was lb while a saved card still showed `60 kg × 8 at 80 kg BW`.

The new isolated regression fails on the published source with `calculator unit changes must refresh the underlying rank cards before closing`.

## Focused fix

Use the existing shared unit-setting redraw instead of explicitly suppressing it in the calculator. Both the underlying view and calculator then display the current unit immediately. Unit buttons still invalidate the calculator preview, retain exact canonical load/bodyweight and persist the shared preference. No additional save or new measurement conversion is introduced.

No backup schema, history, logged measurements, catalogue, ranking standard, calendar, rest timer or styling changes.

## Coverage

- Isolated regression covers kg/lb starts, repeated toggles, normal and assisted checks, immediate rank-view refresh, closing without Save check, exact canonical results, unchanged saved checks/history/pending typed drafts and reload persistence.
- Chromium/WebKit journey covers real saved-check controls, both close-button and Escape dismissal without saving, current visible labels/values, calculator precision, retained pending workout input, subsequent logging and reload.
- All existing release gates, engines, deadlines and unseeded local-file persistence checks remain enabled.

Exact CI and deployment evidence is recorded on the pull request. This is a reproduced display-consistency fix, not a claim that the app has no remaining bugs.
