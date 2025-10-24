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
                { id: 'smb1', text: '' }
            ]
        }
    ]
}