# Progress-chart date windows — 5.7.39

Reproduced on 5.7.38:

- A 90-day chart containing a current workout and a restored 2030 workout plotted both. The bodyweight series also included the future measurement because only a lower date boundary was applied.
- All time used a zero-millisecond lower cutoff, hiding valid pre-1970 workouts and bodyweight records even though those dates pass the app's data contract.
- A falsy timestamp check also rejected the valid epoch-zero timestamp (1970-01-01 at local noon in UTC+12).

Finite windows now use inclusive local calendar dates through today and an exclusive next-midnight upper bound, calculated together from one clock reading. Both chart series use those boundaries. All time has unbounded dates and accepts every finite timestamp, including negative values and zero. Help text explains that finite windows end today and All time includes future-dated records.

No workouts, bodyweight values, calendar dates, ranks or backup formats are migrated. Future records remain available through All time and the existing history/profile views.

Regression coverage runs in UTC, Europe/Helsinki, America/New_York and UTC+12, including DST boundaries, the first/last eligible dates, midnight rollover, 1900 dates, epoch zero, identical series filters and unchanged stored bytes. Chromium/WebKit journeys exercise finite versus All time selection and retained original history.
