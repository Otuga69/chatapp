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

<div class="p-4 bg-slate-800">
<form on:submit|preventDefault={handleSubmit} class="flex gap-2">
  <input
    type="text"
    bind:value={messageText}
    placeholder="Type a message..."
    class="flex-1 bg-slate-700 text-white rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
    {disabled}
  />
  <button
    type="submit"
    class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
    {disabled}
  >
    Send
  </button>
</form>
</div>