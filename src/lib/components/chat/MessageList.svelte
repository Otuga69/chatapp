<script lang="ts">
  import { messages, currentUser } from '$lib/stores/auth';
 
</script>

<div class="space-y-4">
  {#each $messages as message}
    <div class="flex items-start gap-2 {message.sender.id === $currentUser?.id ? 'justify-end' : ''}">
      <img
        src={message.sender.avatar}
        alt={message.sender.name}
        class="w-8 h-8 rounded-full"
      />
      <div class="max-w-[70%] bg-slate-700 rounded-lg p-3">
        <div class="font-medium text-white">{message.sender.name}</div>
        <div class="text-slate-300">{message.content}</div>
        <div class="text-xs text-slate-400 mt-1">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  {/each}
</div>