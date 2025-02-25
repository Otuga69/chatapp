<script lang="ts">
    export let handleSendMessage: (text: string) => void;
    export let disabled = false;

    let messageText = '';

    function handleSubmit() {
        if (messageText.trim()) {
            handleSendMessage(messageText);
            messageText = '';
        }
    }
</script>

<div class="p-4 bg-slate-800 h-20"> <!-- Added 'h-20' for height of 5rem (80px) -->
  <form on:submit|preventDefault={handleSubmit} class="border-t border-surface-700 p-4 bg-surface-800">
    <div class="flex gap-2">
      <input
        type="text"
        bind:value={messageText}
        placeholder="Type a message..."
        class="flex-1 bg-surface-700 text-white rounded p-2 focus:ring-2 focus:ring-primary-500 focus:outline-none"
        {disabled}
      />
      <button
        type="submit"
        class="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 focus:ring-2 focus:ring-primary-500 focus:outline-none disabled:opacity-50"
        {disabled}
      >
        Send
      </button>
    </div>
  </form>
</div>