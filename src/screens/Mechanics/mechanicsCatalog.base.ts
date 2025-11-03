import {MechanicsCatalog} from '@/types/mechanic';

export const BASE_MECHANICS_CATALOG: MechanicsCatalog = {
    version: 1,
    items: [
        // Group: STANCE
        {
            id: 'stance',
            kind: 'title',
            title: 'Static Stance',
            group: 'stance',
            bullets: [
                { id: 'sb1', text: 'Feet no wider than shoulder width apart, weight on the toes.' },
                { id: 'sb2', text: 'Elbows resting on/protecting ribs, while hands remain at cheek level/higher.' },
                { id: 'sb3', text: 'Chin must be tucked into neck/ chest area at all times, while eyes look up at opponent.' }
            ]
        },
        {
            id: 'static_movement',
            kind: 'title',
            title: 'Static Movement',
            group: 'stance',
            bullets: [
                { id: 'smb1', text: 'Defense and punches in a static stance both start from the floor up.' },
                { id: 'smb2', text: 'Pivot your foot/feet, transfer your weight, bend your knee/knees, rotate your hips and shoulders.' },
                { id: 'smb3', text: 'Without stiffening up, stance must stay compact and tight throughout every movement.' }
            ]
        },
        // Group: FOOTWORK
        {
            id: 'shuffling',
            kind: 'title',
            title: 'Shuffling',
            group: 'footwork',
            category: ['footwork', 'long_range_boxing', 'pressure'],
            bullets: [
                { id: 'shb1', text: 'Small steps to ensure you\'re ready to fire or defend at all times.'  },
                { id: 'shb2', text: 'Feet remain the same distance apart at all times with every step taken.' },
                { id: 'shb3', text: 'Without dragging feet, steps must be natural and low to the ground for speed.' },
                { id: 'shb4', text: 'Every step must allow you to return back to your stance immediately.' },
                { id: 'shb5', text: 'Feet must never cross.' }
            ]
        },
        {
            id: 'lateral_movement',
            kind: 'title',
            title: 'Lateral Movement',
            group: 'footwork',
            category: ['footwork', 'long_range_boxing'],
            bullets: [
                { id: 'lmb1', text: 'First step is always the movement you going in.' },
                { id: 'lmb2', text: 'Step with your left to go left, step with your right to go right.' },
                { id: 'lmb3', text: 'Every change of direction must be one quick and smooth motion.' },
                { id: 'lmb4', text: 'Circle your opponent, not the ring.' }
            ]
        },
        {
            id: 'forward_movement',
            kind: 'title',
            title: 'Forward Movement',
            group: 'footwork',
            category: ['pressure', 'work_rate'],
            bullets: [
                { id: 'fm1', text: 'Moving forward in boxing is different from normally. Step with front foot on toes first. Never heel first.' },
                { id: 'fm2', text: 'Don\'t drag your feet, but keep steps short and low to the ground.' },
                { id: 'fm3', text: 'Always lead with caution.  Slip your head, rear hand parry, or lead catch every forward step.' },
                { id: 'fm4', text: 'Don\'t let back leg drag. Follow up with back foot on every step to keep legs & feet the same distance.' },
                { id: 'fm5', text: 'Whenever not defending, feint or double/triple jab as you move forward to keep opponent responsible.' }
            ]
        },
        {
            id: 'pivot_lead_side',
            kind: 'title',
            title: 'Pivot to Lead Side',
            group: 'footwork',
            category: ['footwork', 'counterpunching', "placement", 'placement_timing'],
            bullets: [
                { id: 'pls1', text: 'Before starting movement, get in a philly shell like position: rear hand guarding chin,' +
                        'chin tucked in to lead shoulder, and lead hand/forearm protecting body'},
                { id: 'pls2', text: 'Take a small step to lead side on toes with heel raised, lift and shift weight to back foot.' },
                { id: 'pls3', text: 'Rotations are roughly best at 45, 90, or even 180 degrees, but always in one fluid motion.' },
                { id: 'pls4', text: 'Chains well into rear hand straights.' }
            ]
        },
        {
            id: 'pivot_rear_side',
            kind: 'title',
            title: 'Pivot to Rear Side',
            group: 'footwork',
            category: ['footwork', 'defense', 'counterpunching', 'placement', 'placement_timing'],
            bullets: [
                { id: 'prs1', text: 'Philly shell start. Guard chin with rear hand, left hand/forearm guarding body.' },
                { id: 'prs2', text: 'One of the rare occasions when you cross your feet, so this must be executed with proper timing.' },
                { id: 'prs3', text: 'Step to the rear side with the front foot on toes with heel raised.' },
                { id: 'prs4', text: 'lift and shit weight to back foot after making the proper rotation.' },
                { id: 'prs5', text: 'Chains well into lead hooks.' }
            ]
        },
        // Group: DEFENSE
        {
            id: 'blocking',
            kind: 'title',
            title: 'Blocking',
            group: 'defense',
            category: ['counterpunching', 'defense', 'pressure', 'work_rate'],
            bullets: [
                { id: 'blb1', text: 'Do not view your main block defense as a large shield raising your hands, but as ' +
                        'smaller gauntlets on your gloves, forearms, and shoulders.' },
                { id: 'blb2', text: 'Do not look to defend multiple punches with one block position, ' +
                        'but block each punch individually in blocking combos.' },
            ]
        },
        {
            id: 'head_movement',
            kind: 'title',
            title: 'Head Movement',
            group: 'defense',
            bullets: [
                { id: 'hmd1', text: 'Bend you knees to move your head off the center line, not your waist and back.' },
                { id: 'hmd2', text: 'You must always be in position to either move your head again or punch after the movement\'s done.' },
                { id: 'hmd3', text: 'Fluid hips, powerful legs, and a strong core are essential in good head movement. ' +
                        'Proper training is essential.' }
            ]
        },
        {
            id: 'lead_slip',
            kind: 'title',
            title: 'Lead Slip',
            movements: ['slip_left', 'slip_right'],
            group: 'defense',
            category: ['defense', 'long_range_boxing', "pressure", 'counterpunching'],
            bullets: [
                { id: 'ls1', text: 'Slipping to the lead side feels a little awkward for beginners, so it must be diligently ' +
                        'trained to build the muscle memory.'},
                { id: 'ls2', text: 'Crucial for opposite stance opponents.' },
                { id: 'ls3', text: 'Pull lead shoulder back, bend lower back knee and pivot back foot. Same mechanics as the ' +
                        'rear hand straight/ cross punch.' },
                { id: 'ls4', text: 'Slight level change with hips and move head off center line.' },
                { id: 'ls5', text: 'Chains well into upjabs, lead hooks, rolling to the rear side, or simultaneously shooting' +
                        'the rear straight.' }
            ]
        },
        {
            id: 'rear_slip',
            kind: 'title',
            title: 'Rear Slip',
            movements: ['slip_left', 'slip_right'],
            group: 'defense',
            category: ['defense', 'counterpunching', 'pressure'],
            bullets: [
                { id: 'rs1', text: 'A more natural movement, so be careful not to overuse, especially after finding success.' },
                { id: 'rs2', text: 'Similar body mechanics to the jab. Pull rear shoulder back, snap lead shoulder to protect chin, and' +
                        'bend knees.' },
                { id: 'rs3', text: 'Slight level change in hips and move head off center line.' },
                { id: 'rs4', text: 'Chains well into rear hand straights and uppercuts. Works really well with simultaneous jabs.' }
            ]
        },
        {
            id: 'roll_lead',
            kind: 'title',
            title: 'Roll/ Weave Lead Side',
            movements: ['roll_right', 'roll_left'],
            group: 'defense',
            category: ['defense', 'placement_timing', 'counterpunching', 'work_rate'],
            bullets: [
                { id: 'rl1', text: 'Awkward feel. Transfer weight onto lead leg before starting movement.' },
                { id: 'rl2', text: 'Similar mechanics to throwing the rear straight.' },
                { id: 'rl3', text: 'Bend + lower rear knee and pivot back foot while changing levels with hips.' },
                { id: 'rl4', text: 'Form a U-shape with head.' },
                { id: 'rl5', text: 'Chains well into lead hooks to the body or head.' },
                { id: 'rl6', text: 'Good escape after throwing lead hook or uppercut.' }
            ]
        },
        {
            id: 'roll_rear',
            kind: 'title',
            title: 'Roll/ Weave Rear Side',
            movements: ['roll_left', 'roll_right'],
            group: 'defense',
            category: ['defense', 'counterpunching', "placement_timing"],
            bullets: [
                { id: 'rr1', text: 'Often synonymous with term "weave", so clarify which terminology you reference with your coach.' },
                { id: 'rr2', text: 'Similar mechanics to the rear slip and the jab.' },
                { id: 'rr3', text: 'Bend knees and change levels with hips while making a U-shape with your head.' },
                { id: 'rr4', text: 'Situationally works better on the inside to counter and chain into hooks and body shots' },
                { id: 'rr5', text: 'Good escape when used after throwing the rear straight.' }
            ]
        },
        {
            id: 'catch_lead',
            kind: 'title',
            title: 'Catch Lead Side',
            movements: ['catch_left', 'catch_right'],
            group: 'defense',
            category: ['defense', 'counterpunching', 'pressure', 'placement_timing'],
            bullets: [
                { id: 'cl1', text: 'Similar mechanics to the jab. Transfer weight to back leg. Pull rear shoulder.' },
                { id: 'cl2', text: 'For more protection slip to the rear at the same time, with both hands up to temples.' },
                { id: 'cl3', text: 'Train to reduce head trauma as much as possible and stiffen catch arm inches away from head instead of directly in contact.' },
                { id: 'cl4', text: 'Chains well with rear hand straights or rear hand catches.' }
            ]
        },
        {
            id: 'catch_rear',
            kind: 'title',
            title: 'Catch Rear Side',
            movements: ['catch_right', 'catch_left'],
            group: "defense",
            category: ['defense', 'counterpunching', 'pressure', 'work_rate'],
            bullets: [
              { id: 'cr1', text: 'Similar mechanics to the rear hand straight. Bend and lower your back knee, and pivot your back foot.' },
              { id: 'cr2', text: 'Take head off centerline and keep both hands to temples. Don\'t let your head extend past your lead knee.' },
              { id: 'cr3', text: 'Stiffen your rear hand an inch or 2 away from your head. Only let your hand keep in contact with your head as a last resort' },
              { id: 'cr4', text: 'Chains well into lead hooks, body hooks and upjab+flurry combos.' },
              { id: 'cr5', text: 'Chain catches and straight punches during forward movement.' }
          ]
        },
        {
            id: 'catch_body_shots',
            kind: 'title',
            title: 'Catch Body Shots',
            movements: ['sit_left', 'sit_right'],
            group: 'defense',
            category: ['defense', "placement_timing", "pressure"],
            bullets: [
                { id: 'sl1', text: 'High guard up and hands remain at cheeks to temple in case you make a wrong read.' },
                { id: 'sl2', text: 'Change levels and squat to catch the punch at your shoulder-elbow range.' },
                { id: 'sl3', text: 'Do not simply drop your elbows. It leaves your head wide open.' },
                { id: 'sl4', text: 'Chains well into hook flurries to digging to the body and rolling out.' }
            ]
        },
        {
            id: 'parry',
            kind: 'title',
            title: 'Parry',
            movements: ['parry_left', 'parry_right'],
            group: 'defense',
            bullets: [
                { id: 'p1', text: 'You must be fully relaxed in your stance and look for the punch.' },
                { id: 'p2', text: 'Allow yourself to catch the punch like a baseball. Do not over reach or let your hand leave your face.' },
                { id: 'p3', text: 'Can be used before after or even during multiple types of jabs for countering opportunities.' }
            ]
        },

        // Group: PUNCHES
        {
            id: 'general',
            kind: 'title',
            title: 'General',
            group: 'punches',
            bullets: [
                { id: 'dp1', text: 'Straight punches fill in the long/mid range. Hooks and uppercuts fill the inside.' },
                { id: 'dp2', text: 'The opposite hand must always be up and ready to guard when firing every punch.' },
                { id: 'dp3', text: 'Hand must immediately snapback to face after every punch' }
            ]
        },
        {
            id: 'jab',
            kind: 'movement',
            movement: 'jab',
            group: 'punches',
            bullets: [
                { id: 'jp3', text: 'Your stance must be completely bladed to your opponent.' },
                { id: 'jp4', text: 'Spring off your backfoot to full extension of the arm down the center line' },
                { id: 'jp1', text: 'Rear hand must be up to defend when throwing.' },
                { id: 'jp2', text: 'Lead shoulder aligns ontop the hip, and top of the foot while protecting the lead side of chin.' },
                { id: 'jp5', text: 'Eye must line up with shoulder + arm to aim properly at target' },
                { id: 'jp6', text: 'Jab hand must snap back to guard face immediately at extension for more snap + protection' },
            ],
        },
        {
            id: 'upjab',
            kind: 'movement',
            movement: 'upjab',
            group: 'punches',
            bullets: [
                { id: 'up1', text: 'Head must be off centerline before throwing, preferably to the lead side.' },
                { id: 'up2', text: 'Rear hand is covering mouth/nose area to guard straight punches while ready to slide' +
                        'to temple to block hooks.' },
                { id: 'up3', text: 'Lead/jab hand is in Philly Shell position with chin tucked in to shoulder and hand ' +
                        'resting on hip.' },
                { id: 'up4', text: 'Punch is shot with same fundamental mechanics as jab, but off the hip from opponent\'s ' +
                        'blind spot and launching off the hip gives slight spring.' },
                { id: 'up5', text: 'Works best with combinations and double triple jabs.' }
            ]
        },
        {
            id: 'straight',
            kind: 'movement',
            movement: 'straight',
            group: 'punches',
            bullets: [
                { id: 'sp1', text: 'Lead hand stays guarding the chin/nose area ready to catch.' },
                { id: 'sp2', text: 'Pull lead shoulder back, drop hips, transfer weight to front foot.' },
                { id: 'sp3', text: 'Pivot rear foot and lower rear knee. Align rear shoulder above hip and knee.' },
                { id: 'sp4', text: 'Tuck chin in rear shoulder and extend arm to full extension and turn knuckle.' },
                { id: 'sp5', text: 'Align eyes with rear shoulder and aim to land with first two knuckles.' },
                { id: 'sp6', text: 'Snap rear hand back to face to guard.' },
                { id: 'sp7', text: 'Chains well with rolling to the rear, throwing straight flurries, or lead hooks.' }
            ]
        },
        {
            id: 'lead_hook',
            kind: 'title',
            title: 'Lead Hook',
            movements: ['left_hook', 'right_hook'],
            group: 'punches',
            bullets: [
                { id: 'lh1', text: 'Stay responsible with rear hand to face/temple ready to catch or parry.' },
                { id: 'lh2', text: 'Transfer weight onto back foot, lower hips, and sit slightly.' },
                { id: 'lh3', text: 'Create a 90 degree angle with your elbow and align elbow/forearm with shoulder perfectly horizontal.' },
                { id: 'lh4', text: 'Thumb up grants more power and damage. Thumb neutral allows hook to follow if opponent dodges.' },
                { id: 'lh5', text: 'Follow through and use the momentum of the punch to circle hand back to guard.' }
            ]
        },
        {
            id: 'rear_hook',
            kind: 'title',
            title: 'Rear Hook',
            movements: ['left_hook', "right_hook"],
            group: 'punches',
            bullets: [
                { id: 'rh1', text: 'Use very seldomly being that the punch leaves you more open than any other punch.' },
                { id: 'rh2', text: 'Best used when opponent has their back to the ropes.' },
                { id: 'rh3', text: 'Transfer weight on to front foot and keep lead hand responsible to face.' },
                { id: 'rh4', text: 'Punch is not a forward motion, but coming from the side to the middle.' },
                { id: 'rh5', text: 'Roll to rear side to exit and be ready to attack/defend immediately.' }
            ]
        },
        {
            id: 'lead_uppercut',
            kind: 'title',
            title: 'Lead Uppercut',
            movements: ['left_uppercut', 'right_uppercut'],
            group: 'punches',
            bullets: [
                { id: 'lu1', text: 'Slip/roll to the left and keep head off centerline. Keep head to temple' },
                { id: 'lu2', text: 'Transfer weight to back leg and pull rear shoulder back ' },
                { id: 'lu3', text: 'Follow up immediately with either a rear straight, rear catch, or roll your head to the lead.' }
            ]
        },
        {
            id: 'rear_uppercut',
            kind: 'title',
            title: 'Rear Uppercut',
            movements: ['left_uppercut', 'right_uppercut'],
            group: 'punches',
            bullets: [
                { id: 'ru1', text: 'Plant feet, and start with keeping both hands responsible' },
                { id: 'ru2', text: 'Pull lead shoulder and throw punch right up the middle. Follow through with hip rotation.' },
                { id: 'ru3', text: 'Punch can be doubled up, mixed high/low, into combos. Just stay responsible and be careful of counters.' }
            ]
        },
        {
            id: 'stab',
            kind: 'movement',
            movement: 'stab',
            group: 'punches',
            bullets: [
                { id: 'stp1', text: 'Keep rear hand responsible in front of your face/ ready to catch to the temple during whole move.' },
                { id: 'stp2', text: 'Bend at the hips and the knees without widening stance to change levels.' },
                { id: 'stp3', text: 'Same mechanics as the jab. Spring off the back foot, align shoulder with eyes, and pull rear shoulder to snap.' },
                { id: 'stp5', text: 'Keep head off centerline by slipping to the rearside throughout punch to remain responsible' },
                { id: 'stp4', text: 'In the proper situation, you can take a step forward to increase range. Just don\'t lunge.' }
            ]
        },
        {
            id: 'body_straight',
            kind: 'movement',
            movement: 'body_straight',
            group: 'punches',
            bullets: [
                { id: 'str1', text: 'Keep lead hand responsible by temple.' },
                { id: 'str2', text: 'Change levels by bending at hips and knees without widening stance.' },
                { id: 'str3', text: 'Transfer weight to front foot, pivot back foot and turn hips' },
                { id: 'str4', text: 'Make sure head doesn\'t go over lead knee.' },
                { id: 'str5', text: 'Chains well with rolling head to the lead side to remain responsible.' }
            ]
        },
        {
            id: 'lead_shovel_hook',
            kind: 'title',
            title: 'Lead Shovel Hook',
            movements: ['left_shovel_hook', 'right_shovel_hook'],
            group: 'punches',
            bullets: [
                { id: 'lsh1', text: 'Sit down, change levels and plant feet before throwing any body hook or uppercut.' },
                { id: 'lsh2', text: 'Slip, roll, or combo into the rear side in order for proper positioning.' },
                { id: 'lsh3', text: 'Transfer weight to back foot and pull rear shoulder back.' },
                { id: 'lsh4', text: 'Keep rear hand responsible and shoot the punch at an upward diagonal trajectory.' },
                { id: 'lsh5', text: 'Chains well into rear shovel hook, lead hook to the head, or rolling to the leadside.' }
            ]
        },
        {
            id: 'rear_shovel_hook',
            kind: 'title',
            title: 'Rear Shovel Hook',
            movements: ['left_shovel_hook', 'right_shovel_hook'],
            group: 'punches',
            bullets: [
                { id: 'rs1', text: 'Sitting and changing levels is crucial in providing the position and power behind body hooks and uppercuts.' },
                { id: 'rs2', text: 'Punch is best and safest used after either a stab or lead body hook in flurries.' },
                { id: 'rs3', text: 'Also situationally effective in repetition for orthodox fighters when opponent is bladed up on the inside' },
                { id: 'rs4', text: 'Keep lead hand responsible, transfer weight onto front foot, pivot back foot and turn hip into punch.' }
            ]
        },
        {
            id: 'body_rear_uppercut',
            kind: 'title',
            title: 'Body Rear Uppercut',
            movements: ['body_left_uppercut', 'body_right_uppercut'],
            group: 'punches',
            bullets: [
                { id: 'bru1', text: 'Change levels and sit down with lead hand responsible to temple.' },
                { id: 'bru2', text: 'Transfer weight onto front foot, pull lead shoulder back, and pivot right foot.' },
                { id: 'bru3', text: 'Shoot punch up the middle and follow through.' },
                { id: 'bru4', text: 'Chains well into lead hook or rolling out to the rear side.' }
            ]
        }
    ]
}