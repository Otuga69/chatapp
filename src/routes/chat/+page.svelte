// src/routes/chat/+page.svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { pb } from '$lib/pb.server';  // Updated import path
  import { currentUser } from '$lib/stores/auth';
  import type { Message } from '$lib/types/chat';

  let messages: Message[] = [];
  let messageInput = '';
  let isLoading = false;

  // Initialize messages when component mounts
  onMount(async () => {
    if (pb.authStore.isValid) {
      try {
        // Fetch existing messages for the current user
        const records = await pb.collection('chat_messages').getList(1, 50, {
          filter: `user = "${pb.authStore.model.id}"`,
          sort: 'created',
          expand: 'user'
        });
        
        messages = records.items.map(record => ({
          id: record.id,
          content: record.content,
          isBot: record.isBot,
          timestamp: record.created
        }));
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    }
  });

  async function handleSendMessage() {
    if (!messageInput.trim() || !pb.authStore.isValid || isLoading) return;

    isLoading = true;
    const userMessage = messageInput;
    messageInput = '';

    try {
      // Add user message to UI immediately
      messages = [...messages, {
        id: 'temp-' + Date.now(),
        content: userMessage,
        isBot: false,
        timestamp: new Date().toISOString()
      }];

      // Send message to bot through API
      const response = await fetch('/chat', {  // Updated API endpoint
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });

      if (!response.ok) {
        throw new Error('Failed to get bot response');
      }

      const data = await response.json();

      // Add bot response to UI
      messages = [...messages, {
        id: 'bot-' + Date.now(),
        content: data.response,
        isBot: true,
        timestamp: new Date().toISOString()
      }];
    } catch (error) {
      console.error('Chat error:', error);
      // Show error message in UI
      messages = [...messages, {
        id: 'error-' + Date.now(),
        content: "Oops, something went wrong! Try again? *sigh*",
        isBot: true,
        timestamp: new Date().toISOString()
      }];
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="flex flex-col h-full">
  <!-- Chat messages container -->
  <div class="flex-1 overflow-y-auto p-4 space-y-4">
    {#each messages as message (message.id)}
      <div class="flex {message.isBot ? 'justify-start' : 'justify-end'}">
        <div class="max-w-[70%] rounded-lg p-3 {message.isBot ? 
          'bg-slate-700 text-white' : 
          'bg-blue-500 text-white'}">
          {message.content}
        </div>
      </div>
    {/each}
  </div>

  <!-- Message input -->
  <div class="border-t border-slate-700 p-4">
    <form on:submit|preventDefault={handleSendMessage} class="flex gap-2">
      <input
        type="text"
        bind:value={messageInput}
        placeholder="Type a message..."
        class="flex-1 rounded-lg bg-slate-700 text-white p-2"
        disabled={!pb.authStore.isValid || isLoading}
      />
      <button
        type="submit"
        class="bg-blue-500 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        disabled={!pb.authStore.isValid || isLoading}
      >
        {isLoading ? 'Sending...' : 'Send'}
      </button>
    </form>
  </div>
</div>