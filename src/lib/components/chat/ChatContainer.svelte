<script lang="ts">
  import { onMount } from 'svelte';
  import type { Message, User } from '$lib/types/chat';
  import { messages, currentUser, contacts, sendMessageToBot } from '$lib/stores/auth';
  import MessageList from './MessageList.svelte';
  import ContactList from './ContactList.svelte';
  import MessageInput from './MessageInput.svelte';

  let selectedContact: User | null = null;
  let isLoading = false;

  onMount(() => {
    // Auto-select the bot contact if available
    if ($contacts.length > 0) {
      selectContact($contacts[0]);
    }
  });

  function selectContact(contact: User) {
    selectedContact = contact;
  }

  async function handleSendMessage(text: string) {
    if (!text.trim() || !$currentUser || !selectedContact || isLoading) return;

    isLoading = true;

    // Add user message to UI
    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: text,
      sender: $currentUser,
      timestamp: new Date()
    };
    messages.update(msgs => [...msgs, userMessage]);

    // Only send to the bot if the selected contact is the bot
    if (selectedContact.id === 'bot') {
      try {
        const botResponse = await sendMessageToBot(text);
        
        const botMessage: Message = {
          id: crypto.randomUUID(),
          content: botResponse,
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
    
    isLoading = false;
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

  <main class="flex-1 flex flex-col">
    {#if selectedContact}
      <header class="p-4 bg-slate-700 text-white font-medium">
        {selectedContact.name}
      </header>
      <div class="flex-1 overflow-y-auto p-4">
        <MessageList />
      </div>
      <MessageInput handleSendMessage={handleSendMessage} disabled={isLoading} />
    {:else}
      <div class="flex-1 flex items-center justify-center text-slate-400">
        Select a contact to start chatting
      </div>
    {/if}
  </main>
</div>