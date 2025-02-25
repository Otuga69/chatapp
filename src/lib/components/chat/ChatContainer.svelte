<!-- src/lib/components/chat/ChatContainer.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import type { Message, User } from '$lib/types/chat';
  import { messages, currentUser, contacts } from '$lib/stores/auth';
  import MessageList from './MessageList.svelte';
  import ContactList from './ContactList.svelte';
  import MessageInput from './MessageInput.svelte';

  let selectedContact: User | null = null;
  let messageText = '';

  onMount(() => {
    // Initialize contacts with the bot
    contacts.set([{
      id: 'bot',
      name: 'SassyGirlfriendBot',
      avatar: '/avatars/bot.png'
    }]);
  });

  function selectContact(contact: User) {
    selectedContact = contact;
    // Clear messages when switching contacts (optional)
    if (contact.id !== (selectedContact?.id || '')) {
      messages.set([]);
    }
  }

  async function handleSendMessage(text: string) {
    if (!text.trim() || !$currentUser || !selectedContact) return;

    const newMessage: Message = {
      id: crypto.randomUUID(),
      content: text,
      sender: $currentUser,
      timestamp: new Date()
    };

    messages.update(msgs => [...msgs, newMessage]);

    // Only send to the bot if the selected contact is the bot
    if (selectedContact.id === 'bot') {
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ message: text })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch bot response');
        }

        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }

        const botMessage: Message = {
          id: crypto.randomUUID(),
          content: data.response,
          sender: {
            id: 'bot',
            name: 'SassyGirlfriendBot',
            avatar: '/avatars/bot.png'
          },
          timestamp: new Date()
        };
        messages.update(msgs => [...msgs, botMessage]);
      } catch (error) {
        console.error('Error getting bot response:', error);
        const errorMessage: Message = {
          id: crypto.randomUUID(),
          content: 'Oops, I had trouble responding. Try again? *sigh*',
          sender: {
            id: 'bot',
            name: 'SassyGirlfriendBot',
            avatar: '/avatars/bot.png'
          },
          timestamp: new Date()
        };
        messages.update(msgs => [...msgs, errorMessage]);
      }
    }

    messageText = '';
  }
</script>

<div class="flex h-screen bg-slate-900">
  <aside class="w-64 bg-slate-800 p-4">
    <div class="mb-4">
      <input
        type="text"
        placeholder="Search..."
        class="w-full bg-slate-700 text-white rounded p-2"
      />
    </div>
    <ContactList onContactSelect={selectContact} />
  </aside>

  <main class="flex-1 flex flex-col pb-6">
    {#if selectedContact}
      <header class="p-4 bg-slate-700 text-white font-medium">
        {selectedContact.name}
      </header>
      <div class="flex-1 overflow-y-auto p-4">
        <MessageList />
      </div>
      <MessageInput {handleSendMessage} />
    {:else}
      <div class="flex-1 flex items-center justify-center text-slate-400">
        Select a contact to start chatting
      </div>
    {/if}
  </main>
</div>

<style>
  /* Ensure the input area stays at the bottom and is visible */
  main {
    padding-bottom: 1.5rem; /* Prevent flex from overriding height */
  }
  .h-screen {
          height: 50vh;
}
</style>