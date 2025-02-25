<script lang="ts">
    import '../app.postcss';
    import { currentUser } from '$lib/stores/auth';
    import type { LayoutData } from './$types';
    import Header from './header.svelte';
    
    
    
</script>

<div class="h-full min-h-screen bg-surface-50-900-token">
    
    <main class="container mx-auto p-4">
        <slot />
    </main>
</div>

<style lang="postcss">
    :global(html, body) {
        @apply h-full overflow-hidden;
    }
</style>

