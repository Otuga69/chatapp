import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import type { ClientResponseError } from 'pocketbase';

export const actions: Actions = {
    updateProfile: async ({ request, locals }) => {
        if (!locals.pb.authStore.model?.id) {
            return fail(401, { fail: true, message: 'Not authorized' });
        }

        try {
            const userId = locals.pb.authStore.model.id;
            const formData = await request.formData();

            // Log raw form data for debugging
            console.log('Raw form data received:', Object.fromEntries(formData.entries()));

            // Retrieve and validate fields
            const name = formData.get('name');
            const birthDate = formData.get('birth_date');
            const avatarFile = formData.get('avatar');

            // Validate name (required, lowercase letters/numbers only per PocketBase)
            if (!name || typeof name !== 'string' || !name.trim()) {
                console.log('Name validation failed - value:', name, 'Type:', typeof name);
                return fail(400, {
                    fail: true,
                    message: 'Name is required and cannot be blank.'
                });
            }
            const namePattern = /^[a-z0-9]+$/; // Match PocketBase's validation pattern
            if (!namePattern.test(name.trim().toLowerCase())) {
                return fail(400, {
                    fail: true,
                    message: 'Name must contain only lowercase letters and numbers (e.g., "john123").'
                });
            }

            // Validate birth date
            if (!birthDate || typeof birthDate !== 'string' || !birthDate.trim()) {
                return fail(400, {
                    fail: true,
                    message: 'Birth date is required and cannot be blank.'
                });
            }
            const date = new Date(birthDate);
            if (isNaN(date.getTime())) {
                return fail(400, {
                    fail: true,
                    message: 'Invalid birth date format.'
                });
            }

            // Prepare update data
            const updateData = new FormData();
            updateData.append('name', name.trim().toLowerCase()); // Ensure lowercase for pattern match
            updateData.append('DOB', birthDate);

            // Handle avatar (optional, but validate if provided)
            if (avatarFile && avatarFile instanceof File && avatarFile.size > 0) {
                if (!avatarFile.type.startsWith('image/')) {
                    return fail(400, {
                        fail: true,
                        message: 'Avatar must be a valid image file.'
                    });
                }
                updateData.append('avatar', avatarFile);
            }

            // Debug logging
            console.log('Update attempt for user:', userId);
            console.log('Form data for update:', {
                name: updateData.get('name'),
                birthDate: updateData.get('DOB'),
                hasAvatar: updateData.has('avatar')
            });

            // Perform the update
            const updatedUser = await locals.pb.collection('users').update(userId, updateData);

            // Refresh auth store
            await locals.pb.collection('users').authRefresh();

            return {
                success: true,
                data: updatedUser
            };

        } catch (err: any) {
            const errorObj = err as ClientResponseError;
            console.error('Profile update error:', {
                message: errorObj.message,
                data: errorObj.data,
                status: errorObj.status,
                url: errorObj.url,
                response: errorObj.response
            });

            let errorMessage = 'Failed to update profile';
            if (errorObj.data?.data) {
                const errors = [];
                if (errorObj.data.data.DOB) errors.push(`Birth Date: ${errorObj.data.data.DOB.message}`);
                if (errorObj.data.data.name) errors.push(`Name: ${errorObj.data.data.name.message}`);
                if (errorObj.data.data.avatar) errors.push(`Avatar: ${errorObj.data.data.avatar.message}`);
                if (errors.length > 0) {
                    errorMessage = errors.join(', ');
                }
            }

            return fail(400, {
                fail: true,
                message: errorMessage
            });
        }
    }
};