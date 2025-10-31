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
              { id: 'cr1', text: '' },
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
    ]
}