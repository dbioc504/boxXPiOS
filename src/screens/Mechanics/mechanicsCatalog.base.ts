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
            bullets: [
                { id: 'lmb1', text: 'First step is always the movement you going in.' },
                { id: 'lmb2', text: 'Step with your left to go left, step with your right to go right.' },
                { id: 'lmb3', text: 'Every change of direction must be one quick and smooth motion.' },
                { id: 'lmb4', text: 'Circle your opponent, not the ring.' }
            ]
        },
        // Group: DEFENSE
        {
            id: 'blocking',
            kind: 'title',
            title: 'Blocking',
            group: 'defense',
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
                { id: 'hmd2', text: 'You must always be in position to either move your head again or punch after the movement\'s done.' }
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
            ]
        }
    ]
}