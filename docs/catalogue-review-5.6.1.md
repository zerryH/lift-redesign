# Whole-catalogue review — source version 5.6.1

Source commit: `da9f6c51adc2e83c4e11678c0bd97c059435a5b2`. Every one of the 472 rows was read and compared with the ranking metadata and catalogue contract. There are 447 canonical identities, 25 alias rows, 400 ranked identities, and 47 tracking-only identities.

“Pass” means the record has consistent identity, enum, load-protocol, alias, muscle-routing, benchmark and increasing-threshold data under the executable contract. All 400 standards are marked provisional in the source. A structural pass does not prove that equipment labeling, exercise technique, muscle weights, or ranking thresholds are empirically correct. Semantic issues below are retained as open work, not silently changed.

| ID | Database name | Equipment | Muscle | Tracking | Identity/schema | Content follow-up |
|---|---|---|---|---|---|---|
| ex001 | Bench Press | Barbell | Chest | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex002 | Incline Bench Press | Barbell | Chest | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex003 | Dumbbell Bench Press | Dumbbell | Chest | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex004 | Incline Dumbbell Press | Dumbbell | Chest | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex005 | Machine Chest Press | Machine | Chest | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex006 | Overhead Press | Barbell | Front delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex007 | Dumbbell Shoulder Press | Dumbbell | Front delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex008 | Machine Shoulder Press | Machine | Front delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex009 | Weighted Dip | Bodyweight | Triceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex010 | Lateral Raise | Dumbbell | Side delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex011 | Cable Fly | Cable / rope | Chest | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex012 | Pec Deck | Machine | Chest | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex013 | Tricep Pushdown | Cable / rope | Triceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex014 | Skull Crusher | Barbell | Triceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex015 | Overhead Tricep Extension | Barbell | Triceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex016 | Dumbbell Chest Fly | Dumbbell | Chest | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex017 | Incline Dumbbell Fly | Dumbbell | Chest | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex018 | Push-Up | Bodyweight | Chest | reps | Pass | Instruction bug: added-weight instruction displayed on reps-only form without a weight field. |
| ex019 | Deadlift | Barbell | Glutes | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex020 | Barbell Row | Barbell | Upper back | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex021 | Dumbbell Row | Dumbbell | Upper back | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex022 | Pull-Up | Bodyweight | Lats | reps | Pass | Instruction bug: added-weight instruction displayed on reps-only form without a weight field. |
| ex023 | Chin-Up | Bodyweight | Lats | reps | Pass | Instruction bug: added-weight instruction displayed on reps-only form without a weight field. |
| ex024 | Lat Pulldown | Machine | Lats | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex025 | Seated Cable Row | Cable / rope | Upper back | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex026 | T-Bar Row | Barbell | Upper back | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex027 | Face Pull | Cable / rope | Rear delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex028 | Rear Delt Fly | Dumbbell | Rear delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex029 | Barbell Shrug | Barbell | Upper back | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex030 | Dumbbell Shrug | Dumbbell | Upper back | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex031 | Reverse Pec Deck | Machine | Rear delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex032 | Barbell Curl | Barbell | Biceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex033 | Dumbbell Curl | Dumbbell | Biceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex034 | Hammer Curl | Dumbbell | Biceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex035 | Preacher Curl | Barbell | Biceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex036 | Cable Curl | Cable / rope | Biceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex037 | Squat | Barbell | Quadriceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex038 | Front Squat | Barbell | Quadriceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex039 | Leg Press | Machine | Quadriceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex040 | Hack Squat | Machine | Quadriceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex041 | Bulgarian Split Squat | Barbell | Quadriceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex042 | Barbell Lunge | Barbell | Quadriceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex043 | Walking Lunge | Dumbbell | Quadriceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex044 | Romanian Deadlift | Barbell | Hamstrings | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex045 | Hip Thrust | Barbell | Glutes | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex046 | Leg Extension | Machine | Quadriceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex047 | Leg Curl | Machine | Hamstrings | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex048 | Standing Calf Raise | Machine | Calves | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex049 | Seated Calf Raise | Machine | Calves | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex050 | Hip Abduction Machine | Machine | Glutes | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex051 | Hip Adduction Machine | Machine | Adductors | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex052 | Step-Up | Dumbbell | Quadriceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex053 | Hanging Leg Raise | Bodyweight | Abs | reps | Pass | Tracking-only; excluded from strength ranking as declared. |
| ex054 | Cable Crunch | Cable / rope | Abs | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex055 | Ab Wheel | Bodyweight | Abs | reps | Pass | Tracking-only; excluded from strength ranking as declared. |
| ex056 | Plank | Bodyweight | Abs | duration | Pass | Tracking-only; excluded from strength ranking as declared. |
| ex010 | Dumbbell Lateral Raise | Dumbbell | Side delts | load_reps | Pass | Alias of Lateral Raise |
| ex058 | Seated Dumbbell Lateral Raise | Dumbbell | Side delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex059 | Leaning Dumbbell Lateral Raise | Dumbbell | Side delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex060 | Cable Lateral Raise | Cable / rope | Side delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex061 | Single-Arm Cable Lateral Raise | Cable / rope | Side delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex062 | Behind-the-Body Cable Lateral Raise | Cable / rope | Side delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex063 | Machine Lateral Raise | Machine | Side delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex063 | Lateral Raise Machine | Machine | Side delts | load_reps | Pass | Alias of Machine Lateral Raise |
| ex065 | Dumbbell Front Raise | Dumbbell | Front delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex066 | Cable Front Raise | Cable / rope | Front delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex067 | Plate Front Raise | Weight plate | Front delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex068 | Smith Machine Shoulder Press | Smith machine | Front delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex069 | Arnold Press | Dumbbell | Front delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex070 | Seated Barbell Overhead Press | Barbell | Front delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex071 | Push Press | Barbell | Front delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex072 | Landmine Shoulder Press | Barbell | Front delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex073 | Single-Arm Landmine Press | Barbell | Front delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex074 | Cable Y Raise | Cable / rope | Side delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex075 | Incline Y Raise | Dumbbell | Side delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex076 | Prone Y Raise | Dumbbell | Side delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex077 | Reverse Cable Fly | Cable / rope | Rear delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex078 | Cable Rear Delt Fly | Cable / rope | Rear delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex079 | Single-Arm Cable Rear Delt Fly | Cable / rope | Rear delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex080 | Chest-Supported Rear Delt Raise | Dumbbell | Rear delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex081 | Bent-Over Dumbbell Rear Delt Raise | Dumbbell | Rear delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex082 | Rear Delt Machine Fly | Machine | Rear delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex083 | Upright Row | Dumbbell | Side delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex084 | Cable Upright Row | Cable / rope | Side delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex085 | Smith Machine Shrug | Smith machine | Upper back | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex033 | Dumbbell Bicep Curl | Dumbbell | Biceps | load_reps | Pass | Alias of Dumbbell Curl |
| ex087 | Alternating Dumbbell Curl | Dumbbell | Biceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex088 | Seated Dumbbell Curl | Dumbbell | Biceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex089 | Incline Dumbbell Curl | Dumbbell | Biceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex090 | Spider Curl | Dumbbell | Biceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex091 | Concentration Curl | Dumbbell | Biceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex092 | Cross-Body Hammer Curl | Dumbbell | Biceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex093 | Rope Hammer Curl | Cable / rope | Biceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex036 | Cable Bicep Curl | Cable / rope | Biceps | load_reps | Pass | Alias of Cable Curl |
| ex095 | Single-Arm Cable Curl | Cable / rope | Biceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex096 | Bayesian Cable Curl | Cable / rope | Biceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex097 | High Cable Curl | Cable / rope | Biceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex098 | Low Cable Curl | Cable / rope | Biceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex099 | EZ-Bar Curl | EZ-bar | Biceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex100 | Preacher Curl Machine | Machine | Biceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex101 | Machine Biceps Curl | Machine | Biceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex102 | Selectorized Biceps Curl | Machine | Biceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex103 | Plate-Loaded Biceps Curl | Plate-loaded machine | Biceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex104 | Reverse Curl | Dumbbell | Biceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex105 | EZ-Bar Reverse Curl | EZ-bar | Biceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex106 | Zottman Curl | Dumbbell | Biceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex107 | Drag Curl | Dumbbell | Biceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex108 | 21s Biceps Curl | Dumbbell | Biceps | load_reps | Pass | Tracking-only; excluded from strength ranking as declared. |
| ex109 | Resistance Band Curl | Resistance band | Biceps | band_reps | Pass | Tracking-only; excluded from strength ranking as declared. |
| ex013 | Cable Triceps Pushdown | Cable / rope | Triceps | load_reps | Pass | Alias of Tricep Pushdown |
| ex111 | Rope Triceps Pushdown | Cable / rope | Triceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex112 | Straight-Bar Pushdown | Cable / rope | Triceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex113 | V-Bar Pushdown | Cable / rope | Triceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex114 | Single-Arm Cable Pushdown | Cable / rope | Triceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex115 | Reverse-Grip Pushdown | Cable / rope | Triceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex116 | Overhead Cable Triceps Extension | Cable / rope | Triceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex117 | Rope Overhead Triceps Extension | Cable / rope | Triceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex118 | Single-Arm Overhead Cable Extension | Cable / rope | Triceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex119 | Cable Skull Crusher | Cable / rope | Triceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex120 | EZ-Bar Skull Crusher | EZ-bar | Triceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex121 | Dumbbell Skull Crusher | Dumbbell | Triceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex122 | Lying Triceps Extension | Machine | Triceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex123 | Seated Dumbbell Overhead Extension | Dumbbell | Triceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex124 | Single-Dumbbell Overhead Extension | Dumbbell | Triceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex125 | Cable Kickback | Cable / rope | Triceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex126 | Dumbbell Triceps Kickback | Dumbbell | Triceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex127 | Assisted Dip | Assisted machine | Triceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex128 | Bench Dip | Bodyweight | Triceps | reps | Pass | Instruction bug: added-weight instruction displayed on reps-only form without a weight field. |
| ex129 | JM Press | Barbell | Triceps | load_reps | Pass | Benchmark review: triceps-isolation family anchors; compound pressing equivalence unvalidated. |
| ex130 | Tate Press | Dumbbell | Triceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex016 | Flat Dumbbell Fly | Dumbbell | Chest | load_reps | Pass | Alias of Dumbbell Chest Fly |
| ex011 | Cable Chest Fly | Cable / rope | Chest | load_reps | Pass | Alias of Cable Fly |
| ex133 | Low-to-High Cable Fly | Cable / rope | Chest | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex134 | High-to-Low Cable Fly | Cable / rope | Chest | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex135 | Standing Cable Press | Cable / rope | Chest | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex136 | Single-Arm Cable Press | Cable / rope | Chest | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex137 | Incline Cable Fly | Cable / rope | Chest | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex138 | Decline Cable Fly | Cable / rope | Chest | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex139 | Smith Machine Bench Press | Smith machine | Chest | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex140 | Smith Machine Incline Press | Smith machine | Chest | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex141 | Smith Machine Decline Press | Smith machine | Chest | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex142 | Decline Bench Press | Barbell | Chest | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex143 | Incline Machine Chest Press | Machine | Chest | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex144 | Decline Machine Chest Press | Machine | Chest | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex145 | Plate-Loaded Chest Press | Plate-loaded machine | Chest | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex146 | Hammer Strength Chest Press | Machine | Chest | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex147 | Pec Fly Machine | Machine | Chest | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex148 | Assisted Chest Dip | Assisted machine | Chest | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex149 | Deficit Push-Up | Bodyweight | Chest | reps | Pass | Instruction bug: added-weight instruction displayed on reps-only form without a weight field. |
| ex150 | Weighted Push-Up | Bodyweight | Chest | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex151 | Ring Push-Up | Bodyweight | Chest | reps | Pass | Instruction bug: added-weight instruction displayed on reps-only form without a weight field. |
| ex152 | Ring Dip | Bodyweight | Chest | reps | Pass | Instruction bug: added-weight instruction displayed on reps-only form without a weight field. |
| ex153 | Svend Press | Barbell | Chest | load_reps | Pass | Content review: tagged Barbell and bench-family standard; confirm plate/dumbbell variant and strength comparability. |
| ex154 | Landmine Chest Press | Barbell | Chest | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex155 | Neutral-Grip Lat Pulldown | Machine | Lats | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex156 | Wide-Grip Lat Pulldown | Machine | Lats | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex157 | Close-Grip Lat Pulldown | Machine | Lats | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex158 | Underhand Lat Pulldown | Machine | Lats | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex159 | Single-Arm Lat Pulldown | Machine | Lats | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex160 | Straight-Arm Cable Pulldown | Cable / rope | Lats | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex161 | Rope Straight-Arm Pulldown | Cable / rope | Lats | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex162 | Kneeling Cable Pulldown | Cable / rope | Lats | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex163 | Machine Lat Pulldown | Machine | Lats | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex164 | Assisted Pull-Up Machine | Assisted machine | Lats | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex165 | Chest-Supported Machine Row | Machine | Upper back | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex166 | Plate-Loaded Row | Plate-loaded machine | Upper back | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex167 | Chest-Supported T-Bar Row | Machine | Upper back | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex168 | Landmine Row | Barbell | Upper back | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex169 | Meadows Row | Barbell | Upper back | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex170 | Single-Arm Cable Row | Cable / rope | Upper back | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex171 | Wide-Grip Seated Cable Row | Cable / rope | Upper back | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex172 | Close-Grip Seated Cable Row | Cable / rope | Upper back | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex173 | Neutral-Grip Seated Cable Row | Cable / rope | Upper back | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex174 | Underhand Seated Cable Row | Cable / rope | Upper back | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex175 | High Row Machine | Machine | Upper back | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex176 | Iso-Lateral Row Machine | Machine | Upper back | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex177 | Low Row Machine | Machine | Upper back | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex178 | Smith Machine Bent-Over Row | Smith machine | Upper back | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex179 | Pendlay Row | Barbell | Upper back | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex180 | Seal Row | Barbell | Upper back | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex181 | Chest-Supported Dumbbell Row | Dumbbell | Upper back | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex182 | Incline Bench Dumbbell Row | Dumbbell | Upper back | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex183 | Renegade Row | Dumbbell | Upper back | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex184 | Cable Pullover | Cable / rope | Lats | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex185 | Dumbbell Pullover | Dumbbell | Lats | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex186 | Machine Pullover | Machine | Lats | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex187 | Back Extension | Machine | Glutes | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex188 | 45-Degree Back Extension | Bodyweight | Glutes | reps | Pass | Tracking-only; excluded from strength ranking as declared. |
| ex189 | Reverse Hyperextension | Machine | Glutes | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex190 | Rack Pull | Barbell | Glutes | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex191 | Smith Machine Squat | Smith machine | Quadriceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex040 | Hack Squat Machine | Machine | Quadriceps | load_reps | Pass | Alias of Hack Squat |
| ex193 | Pendulum Squat | Machine | Quadriceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex194 | Belt Squat | Machine | Quadriceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex195 | V-Squat Machine | Machine | Quadriceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex196 | Goblet Squat | Barbell | Quadriceps | load_reps | Pass | Equipment correction: tagged Barbell; ACE describes a vertically held dumbbell. Add explicit dumbbell/kettlebell protocols. |
| ex197 | Dumbbell Front Squat | Dumbbell | Quadriceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex198 | Zercher Squat | Barbell | Quadriceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex199 | Pause Squat | Barbell | Quadriceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex200 | Box Squat | Barbell | Quadriceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex201 | Safety Bar Squat | Barbell | Quadriceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex202 | Leg Press Calf Raise | Machine | Calves | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex203 | Single-Leg Leg Press | Machine | Quadriceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex204 | Horizontal Leg Press | Machine | Quadriceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex205 | Single-Leg Extension | Machine | Quadriceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex046 | Leg Extension Machine | Machine | Quadriceps | load_reps | Pass | Alias of Leg Extension |
| ex207 | Seated Leg Curl | Machine | Hamstrings | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex208 | Lying Leg Curl | Machine | Hamstrings | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex209 | Standing Leg Curl | Machine | Hamstrings | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex210 | Single-Leg Seated Curl | Machine | Hamstrings | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex211 | Nordic Hamstring Curl | Bodyweight | Hamstrings | reps | Pass | Tracking-only; excluded from strength ranking as declared. |
| ex212 | Glute-Ham Raise | Bodyweight | Hamstrings | reps | Pass | Tracking-only; excluded from strength ranking as declared. |
| ex213 | Good Morning | Barbell | Hamstrings | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex214 | Dumbbell Romanian Deadlift | Dumbbell | Hamstrings | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex215 | Single-Leg Romanian Deadlift | Barbell | Hamstrings | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex216 | Stiff-Leg Deadlift | Barbell | Hamstrings | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex217 | Cable Pull-Through | Cable / rope | Hamstrings | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex218 | Smith Machine Romanian Deadlift | Smith machine | Hamstrings | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex219 | Reverse Lunge | Bodyweight | Quadriceps | reps | Pass | Tracking-only; excluded from strength ranking as declared. |
| ex220 | Dumbbell Reverse Lunge | Dumbbell | Quadriceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex221 | Smith Machine Lunge | Smith machine | Quadriceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex203 | Single-Leg Press | Machine | Quadriceps | load_reps | Pass | Alias of Single-Leg Leg Press |
| ex223 | Sissy Squat | Bodyweight | Quadriceps | reps | Pass | Tracking-only; excluded from strength ranking as declared. |
| ex224 | Spanish Squat | Barbell | Quadriceps | load_reps | Pass | Content review: tagged Barbell with normal loaded-squat protocol; define the supported band-assisted version. |
| ex225 | Wall Sit | Bodyweight | Quadriceps | duration | Pass | Tracking-only; excluded from strength ranking as declared. |
| ex226 | Step-Up Machine | Machine | Quadriceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex227 | Leg Press (High Feet) | Machine | Quadriceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex228 | Leg Press (Low Feet) | Machine | Quadriceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex229 | Cable Glute Kickback | Cable / rope | Glutes | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex230 | Machine Glute Kickback | Machine | Glutes | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex230 | Glute Kickback Machine | Machine | Glutes | load_reps | Pass | Alias of Machine Glute Kickback |
| ex232 | Smith Machine Hip Thrust | Smith machine | Glutes | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex233 | Barbell Glute Bridge | Barbell | Glutes | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex234 | Dumbbell Glute Bridge | Dumbbell | Glutes | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex235 | Single-Leg Hip Thrust | Bodyweight | Glutes | reps | Pass | Tracking-only; excluded from strength ranking as declared. |
| ex236 | Glute Drive Machine | Machine | Glutes | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex237 | Hip Thrust Machine | Machine | Glutes | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex217 | Cable Pull Through | Cable / rope | Hamstrings | load_reps | Pass | Alias of Cable Pull-Through |
| ex239 | 45-Degree Hip Extension (Glute Focus) | Machine | Glutes | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex240 | Hip Abduction Machine (Leaning Forward) | Machine | Glutes | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex241 | Standing Cable Hip Abduction | Cable / rope | Glutes | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex242 | Cable Hip Extension | Cable / rope | Glutes | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex243 | Frog Pump | Bodyweight | Glutes | reps | Pass | Tracking-only; excluded from strength ranking as declared. |
| ex244 | Banded Glute Bridge | Resistance band | Glutes | band_reps | Pass | Tracking-only; excluded from strength ranking as declared. |
| ex048 | Standing Calf Raise Machine | Machine | Calves | load_reps | Pass | Alias of Standing Calf Raise |
| ex246 | Donkey Calf Raise | Machine | Calves | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex247 | Single-Leg Calf Raise | Bodyweight | Calves | reps | Pass | Tracking-only; excluded from strength ranking as declared. |
| ex248 | Smith Machine Calf Raise | Smith machine | Calves | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex249 | Tibialis Raise | Bodyweight | Tibialis | reps | Pass | Tracking-only; excluded from strength ranking as declared. |
| ex250 | Tibialis Raise Machine | Machine | Tibialis | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex251 | Seated Tibialis Raise | Machine | Tibialis | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex252 | Reverse Crunch | Bodyweight | Abs | reps | Pass | Tracking-only; excluded from strength ranking as declared. |
| ex253 | Decline Sit-Up | Bodyweight | Abs | reps | Pass | Tracking-only; excluded from strength ranking as declared. |
| ex254 | Weighted Decline Sit-Up | Bodyweight | Abs | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex255 | Sit-Up | Bodyweight | Abs | reps | Pass | Tracking-only; excluded from strength ranking as declared. |
| ex256 | Crunch | Bodyweight | Abs | reps | Pass | Tracking-only; excluded from strength ranking as declared. |
| ex257 | Bicycle Crunch | Bodyweight | Abs | reps | Pass | Tracking-only; excluded from strength ranking as declared. |
| ex258 | Russian Twist | Bodyweight | Abs | reps | Pass | Tracking-only; excluded from strength ranking as declared. |
| ex259 | Cable Woodchop | Cable / rope | Abs | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex260 | High-to-Low Woodchop | Cable / rope | Abs | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex261 | Low-to-High Woodchop | Cable / rope | Abs | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex262 | Pallof Press | Cable / rope | Abs | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex263 | Cable Pallof Press | Cable / rope | Abs | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex264 | Hanging Knee Raise | Bodyweight | Abs | reps | Pass | Tracking-only; excluded from strength ranking as declared. |
| ex265 | Captain’s Chair Knee Raise | Bodyweight | Abs | reps | Pass | Tracking-only; excluded from strength ranking as declared. |
| ex266 | Captain’s Chair Leg Raise | Bodyweight | Abs | reps | Pass | Tracking-only; excluded from strength ranking as declared. |
| ex267 | Toes-to-Bar | Bodyweight | Abs | reps | Pass | Tracking-only; excluded from strength ranking as declared. |
| ex268 | Dragon Flag | Bodyweight | Abs | reps | Pass | Tracking-only; excluded from strength ranking as declared. |
| ex269 | Side Plank | Bodyweight | Abs | duration | Pass | Tracking-only; excluded from strength ranking as declared. |
| ex270 | Weighted Plank | Bodyweight | Abs | duration | Pass | Tracking-only; excluded from strength ranking as declared. |
| ex271 | Dead Bug | Bodyweight | Abs | reps | Pass | Tracking-only; excluded from strength ranking as declared. |
| ex272 | Bird Dog | Bodyweight | Abs | reps | Pass | Tracking-only; excluded from strength ranking as declared. |
| ex273 | Hollow Body Hold | Bodyweight | Abs | duration | Pass | Tracking-only; excluded from strength ranking as declared. |
| ex274 | L-Sit | Bodyweight | Abs | duration | Pass | Tracking-only; excluded from strength ranking as declared. |
| ex275 | Mountain Climber | Bodyweight | Abs | reps | Pass | Tracking-only; excluded from strength ranking as declared. |
| ex276 | Cable Side Bend | Cable / rope | Abs | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex277 | Dumbbell Side Bend | Dumbbell | Abs | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex278 | Ab Crunch Machine | Machine | Abs | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex279 | Rotary Torso Machine | Machine | Abs | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex280 | Wrist Curl | Dumbbell | Forearms | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex281 | Reverse Wrist Curl | Dumbbell | Forearms | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex282 | Dumbbell Wrist Curl | Dumbbell | Forearms | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex283 | Behind-the-Back Wrist Curl | Dumbbell | Forearms | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex284 | Wrist Roller | Barbell | Forearms | load_reps | Pass | Protocol review: repetitions need a defined counting convention (rotations or full roll-up/down). |
| ex285 | Farmer’s Carry | Barbell | Forearms | load_distance | Pass | Content review: tagged Barbell; distinguish carry handles, total/per-hand load, and the existing dumbbell variant. |
| ex286 | Dumbbell Farmer Carry | Dumbbell | Forearms | load_distance | Pass | Tracking-only; excluded from strength ranking as declared. |
| ex287 | Barbell Hold | Barbell | Forearms | duration | Pass | Tracking-only; excluded from strength ranking as declared. |
| ex288 | Plate Pinch Hold | Weight plate | Forearms | duration | Pass | Tracking-only; excluded from strength ranking as declared. |
| ex289 | Dead Hang | Bodyweight | Forearms | duration | Pass | Tracking-only; excluded from strength ranking as declared. |
| ex290 | Towel Hang | Bodyweight | Forearms | duration | Pass | Tracking-only; excluded from strength ranking as declared. |
| ex291 | Power Clean | Barbell | Quadriceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex292 | Hang Power Clean | Barbell | Quadriceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex293 | Clean Pull | Barbell | Quadriceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex294 | Snatch-Grip Deadlift | Barbell | Glutes | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex295 | Barbell Thruster | Barbell | Quadriceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex296 | Dumbbell Thruster | Dumbbell | Quadriceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex297 | Kettlebell Swing | Kettlebell | Glutes | load_reps | Pass | Tracking-only; excluded from strength ranking as declared. |
| ex298 | Turkish Get-Up | Kettlebell | Quadriceps | load_reps | Pass | Content review: Quadriceps/olympic-family routing; clarify whole-body/stability movement. |
| ex299 | Sled Push | Sled | Quadriceps | load_distance | Pass | Tracking-only; excluded from strength ranking as declared. |
| ex300 | Sled Drag | Sled | Quadriceps | load_distance | Pass | Tracking-only; excluded from strength ranking as declared. |
| ex301 | Battle Ropes | Battle ropes | Quadriceps | duration | Pass | Content review: primary Quadriceps; contribution map excludes shoulders/arms/core; note says hold rather than active duration. |
| ex302 | Cable Crossover | Cable / rope | Chest | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex303 | Standing Cable Crossover | Cable / rope | Chest | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex304 | Machine Incline Press | Machine | Chest | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex305 | Converging Chest Press | Machine | Chest | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex306 | Iso-Lateral Chest Press | Machine | Chest | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex062 | Cable Lateral Raise (Behind Body) | Cable / rope | Side delts | load_reps | Pass | Alias of Behind-the-Body Cable Lateral Raise |
| ex344 | Cable Lateral Raise (Lean-Away) | Cable / rope | Side delts | load_reps | Pass | Alias of Lean-Away Cable Lateral Raise |
| ex309 | Machine Reverse Fly | Machine | Rear delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex310 | Rear Delt Cable Crossover | Cable / rope | Rear delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex027 | Face Pull (Rope) | Cable / rope | Rear delts | load_reps | Pass | Alias of Face Pull |
| ex312 | Cable External Rotation | Cable / rope | Rear delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex313 | Dumbbell External Rotation | Dumbbell | Rear delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex314 | Dual-Cable Curl | Cable / rope | Biceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex315 | Cable Preacher Curl | Cable / rope | Biceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex100 | Machine Preacher Curl | Machine | Biceps | load_reps | Pass | Alias of Preacher Curl Machine |
| ex317 | EZ-Bar Preacher Curl | EZ-bar | Biceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex318 | Single-Arm Preacher Curl | Machine | Biceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex319 | Standing Cable Chest Press | Cable / rope | Chest | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex320 | Single-Arm Standing Cable Chest Press | Cable / rope | Chest | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex321 | Seated Cable Chest Press | Cable / rope | Chest | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex322 | Single-Arm Seated Cable Chest Press | Cable / rope | Chest | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex323 | Incline Cable Chest Press | Cable / rope | Chest | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex324 | Decline Cable Chest Press | Cable / rope | Chest | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex325 | Split-Stance Cable Chest Press | Cable / rope | Chest | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex326 | Alternating Cable Chest Press | Cable / rope | Chest | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex327 | Mid-Height Cable Fly | Cable / rope | Chest | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex328 | Single-Arm Cable Fly | Cable / rope | Chest | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex329 | Standing Single-Arm Cable Fly | Cable / rope | Chest | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex330 | Seated Cable Fly | Cable / rope | Chest | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex331 | Low Cable Crossover | Cable / rope | Chest | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex332 | High Cable Crossover | Cable / rope | Chest | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex333 | Single-Arm Cable Crossover | Cable / rope | Chest | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex334 | Cable Squeeze Press | Cable / rope | Chest | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex335 | Cable Press-Around | Cable / rope | Chest | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex336 | Standing Cable Pec Fly | Cable / rope | Chest | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex337 | Cable Chest Press with Pause | Cable / rope | Chest | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex338 | Cable Shoulder Press | Cable / rope | Front delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex339 | Single-Arm Cable Shoulder Press | Cable / rope | Front delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex340 | Half-Kneeling Single-Arm Cable Shoulder Press | Cable / rope | Front delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex341 | Single-Arm Cable Front Raise | Cable / rope | Front delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex342 | Seated Cable Front Raise | Cable / rope | Front delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex062 | Behind-the-Back Cable Lateral Raise | Cable / rope | Side delts | load_reps | Pass | Alias of Behind-the-Body Cable Lateral Raise |
| ex344 | Lean-Away Cable Lateral Raise | Cable / rope | Side delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex345 | Seated Cable Lateral Raise | Cable / rope | Side delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex346 | Single-Arm Seated Cable Lateral Raise | Cable / rope | Side delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex074 | Cable Y-Raise | Cable / rope | Side delts | load_reps | Pass | Alias of Cable Y Raise |
| ex348 | Single-Arm Cable Y-Raise | Cable / rope | Side delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex349 | Wide-Grip Cable Upright Row | Cable / rope | Side delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex350 | Cable Rear Delt Row | Cable / rope | Rear delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex351 | Cross-Body Cable Rear Delt Fly | Cable / rope | Rear delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex352 | High Cable Rear Delt Fly | Cable / rope | Rear delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex353 | Low Cable Rear Delt Fly | Cable / rope | Rear delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex027 | Rope Face Pull | Cable / rope | Rear delts | load_reps | Pass | Alias of Face Pull |
| ex355 | Wide-Grip Cable Face Pull | Cable / rope | Rear delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex356 | Face Pull with External Rotation | Cable / rope | Rear delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex357 | Cable Shrug | Cable / rope | Upper back | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex358 | Single-Arm Cable Shrug | Cable / rope | Upper back | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex111 | Rope Cable Triceps Pushdown | Cable / rope | Triceps | load_reps | Pass | Alias of Rope Triceps Pushdown |
| ex360 | EZ-Bar Cable Pushdown | Cable / rope | Triceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex112 | Straight-Bar Cable Pushdown | Cable / rope | Triceps | load_reps | Pass | Alias of Straight-Bar Pushdown |
| ex362 | Single-Arm Reverse-Grip Cable Pushdown | Cable / rope | Triceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex363 | Cross-Body Cable Triceps Extension | Cable / rope | Triceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex364 | Single-Arm Overhead Cable Triceps Extension | Cable / rope | Triceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex365 | Straight-Bar Overhead Cable Extension | Cable / rope | Triceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex366 | Seated Cable Triceps Extension | Cable / rope | Triceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex367 | Cable Triceps Kickback | Cable / rope | Triceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex368 | Single-Arm Cable Triceps Kickback | Cable / rope | Triceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex369 | Lying Cable Triceps Extension | Cable / rope | Triceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex370 | High-Pulley Triceps Extension | Machine | Triceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex371 | Cable Triceps Press | Cable / rope | Triceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex372 | Reverse-Grip Rope Pushdown | Cable / rope | Triceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex373 | Kneeling Single-Arm Lat Pulldown | Machine | Lats | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex374 | V-Bar Lat Pulldown | Machine | Lats | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex375 | Rope Lat Pulldown | Cable / rope | Lats | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex376 | Single-Arm Straight-Arm Pulldown | Machine | Lats | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex377 | High-to-Low Cable Row | Cable / rope | Upper back | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex378 | Low-to-High Cable Row | Cable / rope | Upper back | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex379 | Single-Arm Seated Cable Row | Cable / rope | Upper back | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex380 | Chest-Supported Cable Row | Cable / rope | Upper back | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex381 | Rope Seated Cable Row | Cable / rope | Upper back | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex382 | Kneeling Cable Row | Cable / rope | Upper back | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex383 | Standing Cable Row | Cable / rope | Upper back | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex384 | High Cable Row | Cable / rope | Upper back | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex385 | Low Cable Row | Cable / rope | Upper back | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex386 | Rope Cable Pullover | Cable / rope | Lats | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex387 | Single-Arm Cable Pullover | Cable / rope | Lats | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex388 | Cable Reverse Fly | Cable / rope | Rear delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex389 | Standing Cable Reverse Fly | Cable / rope | Rear delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex390 | Single-Arm Cable Reverse Fly | Cable / rope | Rear delts | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex391 | Cable Lat Prayer | Cable / rope | Lats | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex392 | Kneeling Cable Lat Prayer | Cable / rope | Lats | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex393 | Cable Straight-Arm Row | Cable / rope | Upper back | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex394 | Cross-Body Single-Arm Cable Row | Cable / rope | Upper back | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex395 | Standing Cable Curl | Cable / rope | Biceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex396 | Seated Cable Curl | Cable / rope | Biceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex397 | Single-Arm Cable Curl with Supination | Cable / rope | Biceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex398 | Cross-Body Cable Curl | Cable / rope | Biceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex399 | High-Pulley Cable Curl | Cable / rope | Biceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex400 | Low-Pulley Cable Curl | Cable / rope | Biceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex401 | Behind-the-Body Cable Curl | Cable / rope | Biceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex402 | Rope Cable Curl | Cable / rope | Biceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex403 | Wide-Grip Cable Curl | Cable / rope | Biceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex404 | Reverse-Grip Cable Curl | Cable / rope | Biceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex405 | Single-Arm Reverse Cable Curl | Cable / rope | Biceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex406 | Cable Spider Curl | Cable / rope | Biceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex314 | Dual-Cable Biceps Curl | Cable / rope | Biceps | load_reps | Pass | Alias of Dual-Cable Curl |
| ex408 | Alternating Cable Curl | Cable / rope | Biceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex409 | Cable Drag Curl | Cable / rope | Biceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex410 | Kneeling Cable Curl | Cable / rope | Biceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex411 | Cable Squat | Cable / rope | Quadriceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex412 | Cable Front Squat | Cable / rope | Quadriceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex413 | Cable Reverse Lunge | Cable / rope | Quadriceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex414 | Cable Split Squat | Cable / rope | Quadriceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex415 | Cable Bulgarian Split Squat | Cable / rope | Quadriceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex416 | Cable Step-Up | Cable / rope | Quadriceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex417 | Cable Leg Extension | Cable / rope | Quadriceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex418 | Seated Cable Leg Extension | Cable / rope | Quadriceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex419 | Standing Cable Hamstring Curl | Cable / rope | Hamstrings | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex420 | Single-Leg Cable Hamstring Curl | Cable / rope | Hamstrings | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex421 | Kneeling Cable Leg Curl | Cable / rope | Hamstrings | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex422 | Cable Hip Abduction | Cable / rope | Glutes | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex423 | Cable Hip Adduction | Cable / rope | Adductors | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex424 | Standing Cable Hip Adduction | Cable / rope | Adductors | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex425 | Bent-Knee Cable Glute Kickback | Cable / rope | Glutes | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex426 | Diagonal Cable Glute Kickback | Cable / rope | Glutes | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex427 | Cable Romanian Deadlift | Cable / rope | Hamstrings | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex428 | Cable Good Morning | Cable / rope | Hamstrings | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex429 | Cable Calf Raise | Cable / rope | Calves | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex430 | Single-Leg Cable Calf Raise | Cable / rope | Calves | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex431 | Cable Lateral Lunge | Cable / rope | Quadriceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex432 | Cable Curtsy Lunge | Cable / rope | Quadriceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex433 | Cable Reverse Step-Up | Cable / rope | Quadriceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex434 | Cable Hip Hinge | Cable / rope | Hamstrings | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex435 | Cable Kickstand RDL | Cable / rope | Hamstrings | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex436 | Kneeling Cable Crunch | Cable / rope | Abs | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex437 | Standing Cable Crunch | Cable / rope | Abs | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex438 | High-Pulley Cable Crunch | Cable / rope | Abs | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex439 | Rope Cable Crunch | Cable / rope | Abs | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex440 | Kneeling Rope Crunch | Cable / rope | Abs | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex260 | Cable Woodchop High-to-Low | Cable / rope | Abs | load_reps | Pass | Alias of High-to-Low Woodchop |
| ex261 | Cable Woodchop Low-to-High | Cable / rope | Abs | load_reps | Pass | Alias of Low-to-High Woodchop |
| ex443 | Half-Kneeling Cable Chop | Cable / rope | Abs | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex444 | Tall-Kneeling Cable Chop | Cable / rope | Abs | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex445 | Half-Kneeling Pallof Press | Cable / rope | Abs | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex446 | Single-Arm Pallof Press | Cable / rope | Abs | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex447 | Standing Cable Side Bend | Cable / rope | Abs | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex448 | Seated Cable Rotation | Cable / rope | Abs | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex449 | Standing Cable Rotation | Cable / rope | Abs | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex450 | Cable Lift | Cable / rope | Abs | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex451 | Half-Kneeling Cable Lift | Cable / rope | Abs | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex452 | Cable Reverse Crunch | Cable / rope | Abs | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex453 | Cable Oblique Crunch | Cable / rope | Abs | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex454 | Cable Dead Bug | Cable / rope | Abs | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex455 | Anti-Rotation Cable Hold | Cable / rope | Abs | duration | Pass | Tracking-only; excluded from strength ranking as declared. |
| ex456 | Split-Stance Pallof Press | Cable / rope | Abs | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex457 | Tall-Kneeling Anti-Rotation Press | Machine | Abs | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex458 | Triceps Extension | Machine | Triceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex459 | Triceps Press | Machine | Triceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex460 | Cable Triceps Extension | Cable / rope | Triceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex461 | Rope Triceps Extension | Cable / rope | Triceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex462 | Single-Arm Triceps Extension | Machine | Triceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex463 | Reverse-Grip Triceps Extension | Machine | Triceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex464 | Cross-Body Triceps Extension | Machine | Triceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex465 | Machine Triceps Extension | Machine | Triceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex466 | Machine Triceps Press | Machine | Triceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex467 | Close-Grip Push-Up | Bodyweight | Triceps | reps | Pass | Instruction bug: added-weight instruction displayed on reps-only form without a weight field. |
| ex468 | Dip Machine | Machine | Triceps | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex469 | Close-Grip Bench Press | Barbell | Triceps | load_reps | Pass | Benchmark review: triceps-isolation family anchors; compound pressing equivalence unvalidated. |
| ex470 | Sumo Deadlift | Barbell | Glutes | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex471 | Trap Bar Deadlift | Barbell | Glutes | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
| ex472 | Machine Row | Machine | Upper back | load_reps | Pass | No additional record-specific defect confirmed in this pass; benchmark remains provisional. |
