<script lang="ts">
    import { goto } from '$app/navigation';
    import * as config from '$lib/config';
    import { Avatar } from '@skeletonlabs/skeleton';
    import { page } from '$app/stores';
    import { PUBLIC_POCKETBASE_URL } from '$env/static/public';

    $: user = $page.data.user;
    $: isAuthenticated = Boolean(user);
    
    // Get the full avatar URL from PocketBase
    $: avatarUrl = user?.avatar 
        ? `${PUBLIC_POCKETBASE_URL}/api/files/${user.collectionId}/${user.id}/${user.avatar}`
        : undefined;
</script>

<div class="bg-surface-100-800-token border-b border-surface-500/30">
    <nav class="container mx-auto p-4 flex items-center justify-between">
        <a href="/" class="text-2xl font-bold text-primary-500">
            {config.title}
        </a>
      
        <ul class="flex gap-8">
            <li>
                <a href="/about" class="text-surface-600-300-token hover:text-primary-500">About</a>
            </li>
            <li>
                <a href="/contact" class="text-surface-600-300-token hover:text-primary-500">Contact</a>
            </li>
            <li>
                <a href="/rss.xml" target="_blank" class="text-surface-600-300-token hover:text-primary-500">RSS</a>
            </li>
        </ul>
        
        <div class="flex gap-4">
            {#if isAuthenticated}
                <button 
                    class="btn-icon hover:variant-soft-primary" 
                    on:click={() => goto('/dashboard')}
                >
                    <Avatar 
                        src={avatarUrl}
                        initials={user.username?.[0]?.toUpperCase() || 'U'} 
                        background="bg-primary-500" 
                        width="w-10" 
                        border="border-2 border-surface-300-600-token" 
                    />
                </button>
            {:else}
                <a href="/login" class="btn variant-filled-primary">Login</a>
                <a href="/signup" class="btn variant-ghost-surface">Sign Up</a>
            {/if}
        </div>
    </nav>
</div>

<style>
    .container {
      max-width: 800px;
      margin-inline: auto;
      padding-block: 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
  }
</style>
