<!-- src/lib/components/chat/ContactList.svelte -->
<script lang="ts">
  import { contacts } from '$lib/stores/auth';

  export let onContactSelect: (contact: any) => void = () => {};
</script>

<div class="space-y-2">
  <h2 class="text-white font-medium mb-4">Contacts</h2>
  {#each $contacts as contact}
    <button
      on:click={() => onContactSelect(contact)}
      class="flex items-center gap-2 w-full p-2 rounded hover:bg-slate-700 transition-colors"
    >
      <img
        src={contact.avatar}
        alt={contact.name}
        class="w-8 h-8 rounded-full"
      />
      <span class="text-white">{contact.name}</span>
    </button>
  {/each}
</div>