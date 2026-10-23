"""Model-specific content for the DynoX user manuals."""

DATE = '2026-10-23'
REV = '1.0'

ROUTE_COLORS = {
    'thrust': ('#1F5C99', 'Load-cell cables (thrust and torque)'),
    'torque': ('#3FA0E0', 'Torque load-cell cable'),
    'rpm': ('#2E9D57', 'RPM sensor cable'),
    'sensor': ('#8A4FBF', 'Vibration and temperature sensor cable'),
    'current': ('#E8630A', 'Current sensor signal cable'),
    'power': ('#C62828', 'Battery and ESC power leads'),
    'usb': ('#30353B', 'USB data cable to the PC'),
}

TORQUE_TABLE = [
    ['Fastener', 'Where used', 'Typical tightening'],
    ['M3 screws', 'Printed parts, sensor boards, DAQ enclosure', 'Hand tight, about 0.5 to 1 Nm. Do not crack the printed parts.'],
    ['M6 bolts', 'Motor to mounting plate, plate to bracket', 'About 8 Nm, with thread-locker on motor bolts'],
    ['M8 button-head bolts', 'Brackets into T-slot nuts', 'About 12 to 15 Nm into steel T-nuts; snug only (about 4 Nm) into printed T-nuts. Tighten evenly around each joint.'],
]

COMMON_SAFETY = {
    'People and protection': [
        'Read this manual completely before assembling or operating the stand.',
        'Wear safety glasses and gloves during assembly. Wear safety glasses and hearing protection during every test run.',
        'Tie back long hair and remove loose clothing, lanyards and jewellery before approaching a running motor.',
        'Never reach over, under or past a propeller while a battery is connected, even if the motor is stopped.',
    ],
    'Test area': [
        'Place the stand on a level, rigid floor or bench and anchor it with the supplied clamps before any powered test.',
        'Mark an exclusion zone around the stand. Nobody may stand in the plane of the propeller disc while a battery is connected.',
        'Keep the area clear of loose paper, tools, cable offcuts and anything that the propeller wash can lift.',
        'Test indoors or under cover. The sensors and the DAQ unit are not weatherproof: keep them away from rain, condensation and dust.',
    ],
    'Electrical and battery': [
        'Connect the battery last and disconnect it first. Keep the throttle at zero and the ESC disarmed while connecting.',
        'Use cables, connectors and fuses rated above the maximum test current. Check insulation before every session.',
        'Fit an emergency-stop or kill switch in the power line, within reach of the operator, and test it before each session.',
        'Charge, store and transport lithium batteries in fire-safe bags or containers, and never leave a charging battery unattended.',
        'When the operator works at a distance, only the digital data link and the emergency-stop loop should run to the operator station. Do not extend the analogue sensor cables.',
    ],
    'Operation': [
        'Never exceed the rated thrust of the stand. Stop the test if a reading approaches the limit.',
        'Before each run, check that every bolt is tight, the propeller is undamaged and balanced, and its hub bolts are secure.',
        'Start every new motor and propeller combination at low throttle and increase in steps while watching vibration and temperature.',
        'Stop immediately on unusual noise, rising vibration, smoke, or any reading that does not make sense.',
        'Do not lean on, lift or carry the stand by the sensing head. Loads on the head can permanently damage the load cells.',
    ],
}

TROUBLE = [
    ['Symptom', 'Likely cause', 'What to do'],
    ['Thrust reading drifts with the motor stopped', 'Load-cell cable under tension, or the load cells are still warming up', 'Re-route the cable with a loose service loop, wait 10 minutes after power-up, then zero again'],
    ['Readings are noisy or jumpy', 'Loose bolts, an unbalanced propeller, or signal cables running beside power leads', 'Retighten the frame, balance the propeller, separate signal cables from the power leads'],
    ['Torque reads a value with no load', 'Sensor block not square to the thrust axis, or the motor plate is touching the frame', 'Check alignment and clearances, then zero again'],
    ['RPM shows zero or jumps', 'Sensor not aimed at the blade path, or too far away', 'Re-aim the sensor and move it closer, keeping it clear of the blade tips'],
    ['DAQ unit not found by ROTRIX', 'USB cable, port or driver', 'Try another cable and port, check the driver, and restart ROTRIX'],
    ['The stand creeps or rocks during a run', 'Clamps not anchored, or the floor is uneven', 'Stop, level the base and anchor every clamp'],
]

MAINT = [
    ['When', 'Check'],
    ['Before every session', 'Bolts on the sensing head and motor; propeller condition and balance; cable routing and service loops; clamps anchored; emergency stop works'],
    ['Weekly in regular use', 'All frame bolts at the recommended torque; sensors clean; no cracks in brackets or printed parts'],
    ['Every month', 'Zero and span check of the thrust and torque readings with known weights; RPM check against a hand tachometer'],
    ['Every 6 months', 'Full calibration in ROTRIX; inspect cables and connectors; replace worn fasteners'],
    ['After a crash or overload', 'Stop testing. Inspect the load cells and brackets, then run a full calibration before further use'],
]

MODELS = {
    'compact-5': {
        'docid': 'DNX-RTS05-UM-2026-01',
        'rating': '5 kgf',
        'people': 'One person can assemble the stand; two people make it easier when standing the mast.',
        'intro': ('The RTS Compact 5 is a bench-top thrust stand for drone motors and propellers up to 5 kgf of thrust. '
                  'It measures thrust, torque, motor speed, current, voltage and vibration together, and streams the data to the '
                  'ROTRIX software for live monitoring, logging and performance reports.'),
        'specs': [
            ['Item', 'Specification'],
            ['Rated thrust', '0 to 5 kgf'],
            ['Measured parameters', 'Thrust, torque, RPM, voltage, current and vibration'],
            ['Force sensing', 'One thrust beam load cell and two torque beam load cells'],
            ['Speed sensing', 'Non-contact optical RPM sensor on an adjustable arm'],
            ['Electrical sensing', 'Inline current sensor module; voltage measured by the DAQ unit'],
            ['Data acquisition', 'ROTRIX DAQ unit with USB link to the PC'],
            ['Software', 'ROTRIX test control and logging; ROTRIDASH analytics (optional)'],
            ['Frame', '40-series aluminium extrusions with orange slot covers (REUDE standard)'],
            ['Footprint', 'About 600 × 205 mm (base rail with bench clamps)'],
            ['Thrust axis height', 'About 525 mm above the bench'],
            ['Reference propeller', 'About 340 mm (13 inch) folding propeller'],
        ],
        'tools': ['Hex keys 2.5, 4 and 5 mm', 'Spanner or socket set', 'Torque wrench (optional, recommended)',
                  'Spirit level and try square', 'Cable ties and a side cutter', 'Multimeter',
                  'Calibration weights (for example 0.5, 1 and 2 kg) with cord and a low-friction pulley'],
        'steps': [
            ('s1', 'Base rail, end stoppers and bench clamps', [
                'Slide T-nuts into the top slots of the base rail for the two cross members and the two base handles. Count them before closing the ends.',
                'Press an end stopper into each end of the rail.',
                'Place the rail on a flat, level bench with the clamps over each end.',
                'Fix both clamps to the bench and tighten evenly so the rail cannot move.'],
             'The T-nuts cannot be added once the stoppers and cross members close the slots.'),
            ('s2', 'Base cross members and base handles', [
                'Place the two 40 × 40 × 120 mm cross members on the base rail, one either side of where the mast will stand.',
                'Bolt them into the pre-loaded T-nuts, snug but not fully tight.',
                'Screw a carry handle onto the outer end of each cross member.'],
             None),
            ('s3', 'Mast and lower corner brackets', [
                'Load T-nuts into the mast for the current sensor module and the RPM wiring clips.',
                'Stand the 400 mm mast between the cross members.',
                'Fit a corner bracket on each side of the mast foot and bolt it to the mast and the cross member.',
                'Check the mast is vertical on two faces with the spirit level, then tighten all base bolts.'],
             'Check the mast is vertical before tightening. A leaning mast tilts the thrust axis and adds error to every reading.'),
            ('s4', 'Cross arm, upper corner brackets and top handles', [
                'Load T-nuts into the cross arm for the load-cell bracket and the RPM sensor arm.',
                'Fix the cross arm to the top of the mast with two corner brackets.',
                'Fit the two top handles.',
                'Check the cross arm is level.'],
             None),
            ('s5', 'Load-cell bracket, thrust load cell and torque cell holder', [
                'Bolt the load-cell bracket to the cross arm with two M8 screws.',
                'Fix the thrust load cell to the bracket with its arrow pointing in the thrust direction.',
                'Bolt the torque cell holder to the free end of the thrust load cell.'],
             'Handle load cells gently. Never use them as a handle and never apply more load by hand than the rated thrust.'),
            ('s6', 'Torque load cells, torque arms and motor mount plate', [
                'Fix one torque load cell to each side of the holder.',
                'Fit the 10 mm spacers and the L-shaped torque arms, and secure them with the M3 screws.',
                'Bolt the 100 × 100 mm motor mount plate to the torque arms.',
                'Check that the plate is square to the thrust axis and touches nothing but the torque arms.'],
             None),
            ('s7', 'Motor and propeller', [
                'Bolt the motor to the centre of the mount plate.',
                'Fit the propeller adapter and blades, with a nylon washer on each side of each blade.',
                'Tighten the shoulder screws evenly and check that the blades fold out freely.'],
             'Fit the propeller last, after all wiring is complete, and only when the battery is disconnected.'),
            ('s8', 'Sensors: RPM arm, vibration board and current sensor', [
                'Bolt the RPM sensor arm to the cross arm and aim the sensor at the rotating part of the motor or the blade path.',
                'Fix the vibration board on its four spacers on the back of the torque cell holder.',
                'Bolt the current sensor module to the side of the mast.'],
             None),
            ('s9', 'Orange slot cover strips (REUDE standard)', [
                'Check that every bolt in the frame is at its final torque and that all cables are routed.',
                'Press an orange cover strip into each open T-slot, starting at one end and working along by hand.',
                'Cut the strip flush at each bracket and at the profile ends with a sharp knife.',
                'Where a cable runs inside a slot, lay it in the slot first and press the cover over it.'],
             'Fit the covers last. They are easy to lift out later if you need to add a T-nut or re-route a cable.'),
        ],
        'head_caption': 'Exploded side view of the force-sensing head, motor and propeller.',
        'daq': {
            'intro': ('The Compact 5 uses the ROTRIX DAQ unit as a separate box that sits on the bench behind the stand. '
                      'All sensor cables run down the back of the mast to the base and across to the DAQ unit.'),
            'steps': [
                'Place the DAQ unit on the bench behind the stand, at least 300 mm from the propeller plane.',
                'Fit the current sensor board in its case on the mast, close the cover and screw it shut.',
                'Run the battery-to-ESC lead through the current sensor, with the arrow pointing from the battery to the ESC.',
                'Connect the thrust and torque load cells, RPM sensor, vibration board and current sensor to the matching inputs on the DAQ unit.',
                'Connect the DAQ unit to the PC with the USB cable.',
            ],
            'figure_caption': 'Current sensor module and sensor boards on the mast and head.',
        },
        'wiring': [
            ['Cable', 'From', 'Route', 'To'],
            ['Thrust and torque load cells', 'Sensing head', 'Loose service loop at the head, then down the rear face of the mast, tied every 150 mm', 'DAQ load-cell inputs'],
            ['RPM sensor', 'RPM arm', 'Along the cross arm, down the rear face of the mast', 'DAQ RPM input'],
            ['Vibration sensor', 'Back of the torque cell holder', 'Service loop, then down the mast with the load-cell cables', 'DAQ vibration input'],
            ['Current sensor signal', 'Current sensor module', 'Down the mast to the base', 'DAQ current input'],
            ['Power leads', 'Battery', 'Through the current sensor, up the front face of the mast, kept apart from the signal cables', 'ESC, then motor'],
            ['USB', 'DAQ unit', 'Along the bench, away from the power leads', 'PC'],
        ],
        'calib_load': '0.5, 1 and 2 kg',
        'max_display': '5 kgf',
    },
    'pro-20': {
        'docid': 'DNX-RTS20-UM-2026-01',
        'rating': '20 kgf',
        'people': 'At least three people are required: two to hold the pillars and one to fit brackets and bolts.',
        'intro': ('The RTS Pro 20 is a floor-standing thrust stand for heavy-lift drone propulsion up to 20 kgf of thrust. '
                  'A braced twin-pillar tower holds the motor about 1.1 m above the floor, clear of ground effect. '
                  'Factory-calibrated load cells measure thrust and torque together, while the ROTRIX DAQ unit records RPM, voltage, '
                  'current, vibration and temperature in sync and streams them to the ROTRIX software.'),
        'specs': [
            ['Item', 'Specification'],
            ['Rated thrust', '0 to 20 kgf'],
            ['Measured parameters', 'Thrust, torque, RPM, voltage, current, vibration and temperature'],
            ['Force sensing', 'Load-cell sensor block, ±0.5% of full scale'],
            ['Speed sensing', 'Optical IR sensor, 0 to 25,000 RPM, ±1%'],
            ['Electrical sensing', 'Voltage 3S to 12S; current 5 to 100 A'],
            ['Vibration and temperature', 'Vibration ±16 g; temperature -55 to 125 °C'],
            ['Data acquisition', 'ROTRIX DAQ unit, STM32 controller, signal conditioning, filtering and protection; USB link'],
            ['Software', 'ROTRIX test control and logging; ROTRIDASH analytics (optional)'],
            ['Frame', '40-series aluminium extrusions with orange slot covers (REUDE standard)'],
            ['Footprint', 'About 845 × 1,100 mm including stabiliser arms'],
            ['Thrust axis height', 'About 1,080 mm above the floor'],
            ['Reference propeller', 'About 1,030 mm (40 inch) two-blade'],
        ],
        'tools': ['Hex keys 4, 5 and 6 mm', 'Spanner or socket set', 'Torque wrench', 'Spirit level, try square and tape measure',
                  'Cable ties and a side cutter', 'Multimeter and clamp meter', 'Hand tachometer (for the RPM check)',
                  'Calibration weights (for example 2, 5 and 10 kg) with cord and a low-friction pulley',
                  'Masonry drill and M12 anchors for concrete floors'],
        'steps': [
            ('s1', 'Base cross-joints (SUB-ASSY-001)', [
                'Take one short profile, two 90° corner brackets, two T-nuts and two M8 bolts.',
                'Slide a T-nut into the top slot on each side of the profile, roughly where the brackets will sit.',
                'Hold a bracket flush against each side, line its hole up with the nut and fit the M8 bolt.',
                'Tighten until snug, check the brackets sit flush, then build a second identical joint.'],
             'Do not over-tighten. Excess torque can strip the T-nut or distort the bracket.'),
            ('s2', 'Base frame (SUB-ASSY-002)', [
                'Insert T-nuts into both base rails for every bracket that will land on them: the cross-joints, the pillar feet, the braces, the stabiliser arms and the clamps.',
                'Place a cross-joint between the rails at each end, symmetric and flush with the central slot.',
                'Bolt the cross-joint brackets into the rail nuts.',
                'Measure both diagonals of the frame. They should match within 2 mm. Adjust, then tighten.'],
             'Loading every T-nut now saves dismantling later. The T-nuts cannot be added once a slot is closed.'),
            ('s3', 'Stabiliser arms and floor clamps', [
                'Bolt a 300 mm stabiliser arm square to the outer face of each base rail, in line with the pillar positions.',
                'Move the frame to its final position on a level floor.',
                'Place the four rail-end clamps and the two arm-end clamps. Mark the anchor holes, but leave the clamps loose until Step 6.'],
             None),
            ('s4', 'Pillars (SUB-ASSY-003)', [
                'Insert T-nuts into both pillars for the braces, the bridges, the handles and the DAQ unit.',
                'With two people holding, stand both 1,000 mm pillars upright at the centre of the base.',
                'Fit four 90° corner brackets around each pillar foot (eight in total) with M8 bolts.',
                'Check that the pillars are vertical on two faces and parallel to each other, then tighten.'],
             'A pillar can topple before its brackets are tight. Keep two people holding the pillars until all eight brackets are bolted.'),
            ('s5', 'Diagonal braces (SUB-ASSY-004)', [
                'Fit a 45° end bracket at each end of every brace.',
                'Offer each front and rear brace in at 45° between the base rail and the pillar, and bolt both ends.',
                'Fit the two side braces between the stabiliser arms and the pillars in the same way.',
                'Tighten all brace bolts evenly, then recheck that the pillars are vertical.'],
             None),
            ('s6', 'Pillar bridges, handles and anchoring (SUB-ASSY-005)', [
                'Place the lower and upper 85 mm bridges between the pillars at their marked heights, level and centred.',
                'Fix each bridge with 90° corner brackets and M8 bolts.',
                'Screw a carry handle to the outer slot of each pillar.',
                'Tighten the whole frame to the recommended torque, then drill, anchor and tighten all six floor clamps.'],
             'Anchor the clamps only after the frame is fully squared and tightened.'),
            ('s7', 'Sensing head (SUB-ASSY-006)', [
                'Bolt the head mounting bracket onto the upper bridge and check that it is square to the pillars.',
                'Bolt the load-cell sensor block onto the bracket with the motor face pointing forward. Do not dismantle the block.',
                'Fit the motor mounting plate, with its sensor board, to the front of the sensor block.'],
             'The load-cell block is calibrated at the factory as one unit. Taking it apart voids the calibration.'),
            ('s8', 'Motor, propeller and RPM sensor', [
                'Bolt the motor to the mounting plate with M6 bolts and thread-locker, and check that the shaft is centred.',
                'Fix the RPM sensor arm on the propeller side and aim the sensor at the blade path.',
                'Fit the propeller hub and blades last, after wiring is complete and with the battery disconnected.'],
             None),
            ('s9', 'DAQ unit and sensing-head cover', [
                'Mount the DAQ unit on the rear face of the pillars at mid height.',
                'Complete the wiring in Section 7, then fit the sensing-head cover without trapping any cable.'],
             None),
            ('s10', 'Orange slot cover strips (REUDE standard)', [
                'Check that every bolt in the frame is at its final torque and that all cables are routed.',
                'Press an orange cover strip into each open T-slot, starting at one end and working along by hand.',
                'Cut the strip flush at each bracket and at the profile ends with a sharp knife.',
                'Where a cable runs inside a slot, lay it in the slot first and press the cover over it.'],
             'Fit the covers last. They are easy to lift out later if you need to add a T-nut or re-route a cable.'),
        ],
        'head_caption': 'Exploded side view of the sensing head, motor and propeller.',
        'daq': {
            'intro': ('The ROTRIX DAQ unit mounts on the rear face of the pillars, close to the sensing head and away from the propeller. '
                      'It reads every sensor in sync and sends the data to the PC over USB.'),
            'steps': [
                'Slide two T-nuts into the rear slot of each pillar at mid height.',
                'Bolt the DAQ unit to the pillars with its connector side facing up.',
                'Connect the load-cell sensor block, RPM sensor and motor-side sensor board to the matching DAQ inputs.',
                'Connect the voltage and current sensing to the battery-to-ESC power line as marked on the DAQ unit.',
                'Connect the DAQ unit to the PC with the USB cable and power it up.',
            ],
            'figure_caption': 'ROTRIX DAQ unit on the rear of the pillars, beneath the sensing head.',
        },
        'wiring': [
            ['Cable', 'From', 'Route', 'To'],
            ['Load-cell cables', 'Sensor block', 'Service loop at the head, then down the rear face of the left pillar, tied every 150 mm', 'DAQ load-cell inputs'],
            ['RPM sensor', 'RPM arm', 'Back along the head, down the left pillar', 'DAQ RPM input'],
            ['Vibration and temperature', 'Motor-side sensor board', 'Service loop under the head, down the left pillar', 'DAQ sensor inputs'],
            ['Power leads', 'Battery', 'Up the right pillar, through the current sensing, to the ESC beside the head', 'ESC, then motor'],
            ['USB', 'DAQ unit', 'Down the left pillar and along the floor to the operator station', 'PC'],
        ],
        'calib_load': '2, 5 and 10 kg',
        'max_display': '20 kgf',
    },
    'ultra-50': {
        'docid': 'DNX-RTS50-UM-2026-01',
        'rating': '50 kgf',
        'people': 'At least two people are required, and three when lifting the top beam onto the pillars.',
        'intro': ('The RTS Ultra 50 is a heavy-duty thrust stand for large drone motors up to 50 kgf of thrust. '
                  'A four-pillar box tower stands on a 900 mm base rail with four side outriggers and six diagonal braces, '
                  'giving a footprint about 1 m wide. The sensing head uses two 100 kg load cells and stainless-steel brackets, '
                  'with an adjustable X-pattern motor plate and a gooseneck RPM sensor holder. The ROTRIX DAQ unit sits on the '
                  'top beam beside the head and streams all readings to the ROTRIX software.'),
        'specs': [
            ['Item', 'Specification'],
            ['Rated thrust', '0 to 50 kgf'],
            ['Measured parameters', 'Thrust, torque, RPM, voltage, current, vibration and temperature'],
            ['Force sensing', 'Two 100 kg beam load cells, one for thrust and one for torque (2× overload margin)'],
            ['Motor interface', 'X-pattern 5 mm stainless plate, 125 × 125 mm, slotted adjustable arms, on 20 mm M6 spacers'],
            ['Speed sensing', 'Optical RPM sensor on a flexible gooseneck holder'],
            ['Electrical sensing', 'Inline current sensor module on the rear pillar; voltage measured by the DAQ'],
            ['Data acquisition', 'ROTRIX DAQ unit on the top beam; USB link'],
            ['Software', 'ROTRIX test control and logging; ROTRIDASH analytics (optional)'],
            ['Frame', '40-series aluminium extrusions with orange slot covers (REUDE standard)'],
            ['Footprint', 'About 1,000 × 900 mm'],
            ['Overall height', 'About 960 mm'],
            ['Thrust axis height', 'About 900 mm above the floor'],
        ],
        'tools': ['Hex keys 2.5, 5 and 6 mm', 'Spanner or socket set', 'Torque wrench', 'Spirit level, try square and tape measure',
                  'Cable ties, a side cutter and a sharp knife (for the slot covers)', 'Multimeter and clamp meter', 'Hand tachometer',
                  'Calibration weights (for example 5, 10 and 20 kg) with cord and a heavy-duty pulley',
                  'Masonry drill and M12 anchors for concrete floors'],
        'steps': [
            ('s1', 'Base rail', [
                'Load T-nuts into the 900 mm base rail at the four pillar positions and the two rear brace feet.',
                'Place the rail on a level, rigid floor with the long end towards the rear.'],
             'Load every T-nut the rail needs now. They cannot be added once brackets close the slots.'),
            ('s2', 'Four pillars', [
                'Load T-nuts into each pillar for the top-beam brackets, the braces and the current sensor module.',
                'Stand each 700 mm pillar on its position: two at the front and two at the rear.',
                'Fix each pillar foot to the base rail with 90° corner brackets and M8 button-head screws.',
                'Check every pillar is vertical in both directions, then tighten.'],
             None),
            ('s3', 'Side outriggers', [
                'Load T-nuts into the four 440 mm outriggers for the corner brackets and side braces.',
                'Bolt an outrigger to each side of the front and rear pillar feet with 90° corner brackets.',
                'Check that all four outriggers sit flat on the floor and square to the base rail.'],
             None),
            ('s4', 'Diagonal braces', [
                'Fit a 45° bracket at each end of all six braces.',
                'Bolt the four side braces between the outriggers and the pillars.',
                'Bolt the two rear braces between the rear of the base rail and the rear pillars.',
                'Tighten evenly, then recheck that all four pillars are vertical.'],
             None),
            ('s5', 'Top beam', [
                'Load T-nuts into the top beam for the sensing head, the DAQ unit and the pillar brackets.',
                'With two or three people, lower the 600 mm beam onto the four pillar tops, long overhang at the front.',
                'Fix it to each pillar with 90° corner brackets and check that it is level along its length.',
                'Anchor the base and outriggers to the floor (M12 anchors on concrete).'],
             'Lift the top beam with enough people. The stand must be anchored before any powered test.'),
            ('s6', 'Load-cell anchor gussets and thrust load cell', [
                'Bolt the four 5 mm stainless gussets to the top beam at the rear of the head position.',
                'Bolt the 100 kg thrust load cell upright onto the gussets with its two cap screws.',
                'Check that the arrow on the load cell points in the direction the thrust will push.'],
             None),
            ('s7', 'Torque holder, torque load cell and clamp bracket', [
                'Bolt the torque load-cell holder to the free end of the thrust load cell.',
                'Slide the 100 kg torque load cell into the holder and tighten its screws.',
                'Fit the stainless clamp bracket on the front end of the torque load cell, square to the thrust axis.'],
             'Never load the load cells by hand beyond the rated thrust, and never use the head as a lifting point.'),
            ('s8', 'Motor mount plate, vibration board and gooseneck sensor holder', [
                'Fix the X-pattern motor plate to the clamp bracket through the four 20 mm M6 spacers and the centre screw.',
                'Fit the vibration board on its spacers behind the motor plate.',
                'Clamp the gooseneck holder to the front of the top beam and fit the RPM sensor to it.',
                'Slide the plate arms to match the motor bolt circle, then bolt the motor on, centred on the plate.'],
             None),
            ('s9', 'ROTRIX DAQ unit', [
                'Bolt the DAQ unit to the rear of the top beam through two T-nuts, with its connectors facing the sensing head.',
                'Connect all sensor cables as described in Section 7.'],
             'The DAQ unit is supplied assembled and sealed. Do not open the enclosure.'),
            ('s10', 'Current sensor module', [
                'Fix the case base to the rear pillar.',
                'Place the current sensor board, close the cover and screw it shut.',
                'Run the battery-to-ESC lead through the sensor, with the arrow pointing from the battery to the ESC.'],
             None),
            ('s11', 'Orange slot cover strips (REUDE standard)', [
                'Check that every bolt in the frame is at its final torque and that all cables are routed.',
                'Press an orange cover strip into each open T-slot, starting at one end and working along by hand.',
                'Cut the strip flush at each bracket and at the profile ends with a sharp knife.',
                'Where a cable runs inside a slot, lay it in the slot first and press the cover over it.'],
             'Fit the covers last. They are easy to lift out later if you need to add a T-nut or re-route a cable.'),
        ],
        'head_caption': 'Exploded side view of the sensing head on the top beam.',
        'daq': {
            'intro': ('On the Ultra 50 the ROTRIX DAQ unit mounts on the rear of the top beam, '
                      'so the load-cell cables stay short and away from the propeller. It is supplied as one sealed unit.'),
            'steps': [
                'Slide two T-nuts into the rear slot of the top beam.',
                'Bolt the DAQ unit to the beam with its connectors facing the sensing head.',
                'Connect the thrust and torque load cells, the RPM sensor, the vibration board and the current sensor.',
                'Connect the DAQ unit to the PC with the USB cable.',
            ],
            'figure_caption': 'ROTRIX DAQ unit on the rear of the top beam, behind the sensing head.',
        },
        'wiring': [
            ['Cable', 'From', 'Route', 'To'],
            ['Thrust load cell', 'Upright 100 kg cell', 'Short service loop at the cell, along the top beam to the rear', 'DAQ thrust input'],
            ['Torque load cell', 'Horizontal 100 kg cell', 'Service loop at the holder, along the top beam beside the thrust cable', 'DAQ torque input'],
            ['RPM sensor', 'Gooseneck holder', 'Along the gooseneck, then in the top-beam slot under the slot cover', 'DAQ RPM input'],
            ['Vibration sensor', 'Board behind the motor plate', 'Service loop, then along the top beam', 'DAQ vibration input'],
            ['Current sensor signal', 'Module on the rear pillar', 'Up the rear pillar slot to the top beam', 'DAQ current input'],
            ['Power leads', 'Battery at the rear', 'Through the current sensor, up the rear pillar, along the opposite side of the top beam', 'ESC, then motor'],
            ['USB', 'DAQ unit', 'Down the other rear pillar and along the floor to the operator station', 'PC'],
        ],
        'calib_load': '5, 10 and 20 kg',
        'max_display': '50 kgf',
    },
}
