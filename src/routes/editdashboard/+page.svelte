<script lang="ts">
    import { Stepper, Step, FileButton } from '@skeletonlabs/skeleton';
    import { page } from '$app/stores';
    import { enhance } from '$app/forms';
    import type { ActionData } from './$types';
    import { PUBLIC_POCKETBASE_URL } from '$env/static/public';
    import { onMount } from 'svelte';

    interface User {
        id: string;
        collectionId: string;
        name?: string;
        DOB?: string;
        avatar?: string;
        username: string;
        created?: string;
        updated?: string;
    }

    export let form: ActionData;

    // Form state
    let name = '';
    let birthDate = '';
    let avatarFile: File | null = null;
    let user: User;
    let nameError = '';
    let birthDateError = '';

    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/gif', 'image/webp'];

    // Reactive user data initialization
    $: {
        user = $page.data.user as User;
        if (user && !name && !birthDate) {
            name = user.name || '';
            birthDate = user.DOB || '';
        }
    }

    // Avatar URL
    $: avatarUrl = user?.avatar
        ? `${PUBLIC_POCKETBASE_URL}/api/files/${user.collectionId}/${user.id}/${user.avatar}`
        : null;

    // Client-side validation
    $: isFormValid = name.trim().length > 0 && birthDate.trim().length > 0 && !nameError && !birthDateError;

    function validateName() {
        if (!name.trim()) {
            nameError = 'Name is required and cannot be blank.';
        } else {
            const namePattern = /^[a-z0-9]+$/;
            if (!namePattern.test(name.trim().toLowerCase())) {
                nameError = 'Name must contain only lowercase letters and numbers (e.g., "john123").';
            } else {
                nameError = '';
            }
        }
        return nameError === '';
    }

    function validateBirthDate() {
        if (!birthDate.trim()) {
            birthDateError = 'Birth date is required and cannot be blank.';
        } else {
            const date = new Date(birthDate);
            if (isNaN(date.getTime())) {
                birthDateError = 'Invalid birth date format.';
            } else {
                birthDateError = '';
            }
        }
        return birthDateError === '';
    }

    function handleFileSelect(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];

        if (!file) return;

        if (file.size > MAX_FILE_SIZE) {
            alert('File size must be less than 5MB');
            input.value = '';
            return;
        }

        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            alert('Invalid file type. Please select a valid image file (JPG, PNG, SVG, GIF, WEBP)');
            input.value = '';
            return;
        }

        avatarFile = file;
    }

    function resetForm() {
        name = user?.name || '';
        birthDate = user?.DOB || '';
        avatarFile = null;
        nameError = '';
        birthDateError = '';
    }
</script>

<div class="container mx-auto p-4 max-w-2xl">
    {#if form?.fail}
        <div class="alert variant-filled-error mb-4">
            {form.message}
        </div>
    {:else if form?.success}
        <div class="alert variant-filled-success mb-4">
            Profile updated successfully!
        </div>
    {/if}

    <form
        method="POST"
        action="?/updateProfile"
        enctype="multipart/form-data"
        use:enhance={() => {
            return async ({ update }) => {
                // Client-side validation before submission
                if (!validateName()) {
                    form = { fail: true, message: nameError };
                    return;
                }
                if (!validateBirthDate()) {
                    form = { fail: true, message: birthDateError };
                    return;
                }

                const formElement = document.querySelector('form');
                if (!formElement) return;

                const formData = new FormData(formElement);
                formData.set('name', name.trim().toLowerCase()); // Ensure lowercase for pattern match
                formData.set('birth_date', birthDate);
                if (avatarFile) {
                    formData.set('avatar', avatarFile);
                }

                // Log form data before sending
                console.log('Form data being sent:', {
                    name: formData.get('name'),
                    birthDate: formData.get('birth_date'),
                    hasAvatar: formData.has('avatar')
                });

                await update();
            };
        }}
    >
        <div class="card variant-glass-surface p-4">
            <Stepper>
                <Step>
                    <svelte:fragment slot="header">Profile Setup</svelte:fragment>
                    <div class="p-4">
                        <h3 class="h3 mb-4">Complete Your Profile</h3>
                        <div class="space-y-4">
                            <div class="flex flex-col gap-2">
                                <span class="label">
                                    Profile Picture
                                    {#if !avatarUrl && !avatarFile}
                                        <span class="text-error-500">*</span>
                                    {/if}
                                </span>
                                <div class="flex items-center gap-4">
                                    {#if avatarFile}
                                        <img
                                            src={URL.createObjectURL(avatarFile)}
                                            alt="Avatar preview"
                                            class="w-16 h-16 rounded-full object-cover"
                                        />
                                    {:else if avatarUrl}
                                        <img
                                            src={avatarUrl}
                                            alt="Current avatar"
                                            class="w-16 h-16 rounded-full object-cover"
                                        />
                                    {:else}
                                        <div
                                            class="w-16 h-16 rounded-full bg-surface-300-600-token flex items-center justify-center"
                                        >
                                            <span class="text-2xl">{user?.username?.[0]?.toUpperCase() || 'U'}</span>
                                        </div>
                                    {/if}

                                    <FileButton
                                        name="avatar"
                                        button="btn variant-soft-primary"
                                        accept={ALLOWED_MIME_TYPES.join(',')}
                                        on:change={handleFileSelect}
                                    >
                                        Upload
                                    </FileButton>
                                    <small class="text-surface-600-300-token">Max size: 5MB</small>
                                </div>
                                {#if !avatarUrl && !avatarFile}
                                    <small class="text-error-500">Avatar is required if not already set</small>
                                {/if}
                            </div>

                            <label class="label">
                                <span>Name <span class="text-error-500">*</span></span>
                                <input
                                    type="text"
                                    bind:value={name}
                                    class="input"
                                    name="name" 
                                    placeholder="Your name (e.g., john123)"
                                    required
                                    on:blur={validateName}
                                />
                                {#if nameError}
                                    <small class="text-error-500">{nameError}</small>
                                {/if}
                            </label>

                            <label class="label">
                                <span>Birth Date <span class="text-error-500">*</span></span>
                                <input
                                    type="date"
                                    bind:value={birthDate}
                                    class="input"
                                    name="birth_date"
                                    required
                                    on:blur={validateBirthDate}
                                />
                                {#if birthDateError}
                                    <small class="text-error-500">{birthDateError}</small>
                                {/if}
                            </label>
                        </div>
                    </div>
                </Step>

                <Step>
                    <svelte:fragment slot="header">Finish</svelte:fragment>
                    <div class="p-4 space-y-4">
                        <button
                            type="submit"
                            class="btn variant-filled-primary w-full"
                            disabled={!isFormValid}
                        >
                            Save Changes
                        </button>
                        <button
                            type="button"
                            class="btn variant-soft-surface w-full"
                            on:click={resetForm}
                        >
                            Reset
                        </button>
                    </div>
                </Step>
            </Stepper>
        </div>
    </form>

    <button
        type="button"
        class="btn mt-4"
        on:click={() => {
            const form = document.querySelector('form');
            if (form) form.requestSubmit();
        }}
        disabled={!isFormValid}
    >
        Next →
    </button>
</div>