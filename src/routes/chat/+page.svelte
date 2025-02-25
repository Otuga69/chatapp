<script lang="ts">
  import { onMount } from 'svelte';
  import { messages, currentUser, contacts, sendMessageToBot } from '$lib/stores/auth';
  import type { Message, User } from '$lib/types/chat';
  import { ChatContainer } from '$lib/components/chat';

  let isLoading = false;

  onMount(async () => {
    // Initialize with a default user for now
    // The actual user data will be loaded from the server
    currentUser.set({
      id: 'user1',
      name: 'User',
      avatar: '/avatars/default.png'
    });

    // Set up the bot contact
    contacts.set([{
      id: 'bot',
      name: 'SassyGirlfriendBot',
      avatar: '/avatars/bot.png'
    }]);

    // Load messages (via server endpoint)
    try {
      const response = await fetch('/api/messages');
      if (response.ok) {
        const data = await response.json();
        messages.set(data.messages);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  });
</script>

<div class="flex flex-col h-full">
  <ChatContainer />
</div>