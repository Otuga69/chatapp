import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async () => {
    return {
        user: {
            id: '1',
            name: 'Current User',
            avatar: '/avatars/bot.png'
        }
    };
};