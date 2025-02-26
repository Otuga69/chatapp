<script lang="ts">
  import { onMount } from 'svelte';
  import { messages, currentUser, contacts, loadMessages } from '$lib/stores/auth';
  import { ChatContainer } from '$lib/components/chat';

  let isLoading = true;

  onMount(async () => {
    try {
      // Set up the bot contact
      contacts.set([{
        id: 'bot',
        name: 'SassyGirlfriendBot',
        avatar: '/avatars/bot.png'
      }]);

      // Load messages (via server endpoint)
      await loadMessages();
    } catch (error) {
      console.error('Failed to initialize chat:', error);
    } finally {
      isLoading = false;
    }
  });
</script>

{#if isLoading}
  <div class="flex h-screen items-center justify-center bg-slate-900 text-white">
    <p>Loading chat...</p>
  </div>
{:else}
  <div class="flex flex-col h-full">
    <ChatContainer />
  </div>
{/if}