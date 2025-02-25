import type { LayoutServerLoad } from './$types';

export const load = (async ({ locals }) => {
    return {
        user: locals.pb.authStore.isValid && locals.pb.authStore.model ? locals.pb.authStore.model : null
    };
}) satisfies LayoutServerLoad;