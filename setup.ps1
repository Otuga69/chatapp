# Create base directories
New-Item -Path "src/lib/components/chat" -ItemType Directory -Force
New-Item -Path "src/lib/stores" -ItemType Directory -Force
New-Item -Path "src/lib/types" -ItemType Directory -Force
New-Item -Path "src/lib/utils" -ItemType Directory -Force
New-Item -Path "src/routes" -ItemType Directory -Force

# Create component files
@"
<script lang="ts">
  import type { Message, User } from '$lib/types/chat';
  import { messages, currentUser } from '$lib/stores/chat';
  import MessageList from './MessageList.svelte';
  import ContactList from './ContactList.svelte';
  import MessageInput from './MessageInput.svelte';
</script>
"@ | Out-File -FilePath "src/lib/components/chat/ChatContainer.svelte" -Encoding UTF8

@"
<script lang="ts">
  import { messages, currentUser } from '$lib/stores/chat';
</script>
"@ | Out-File -FilePath "src/lib/components/chat/MessageList.svelte" -Encoding UTF8

@"
<script lang="ts">
  import { contacts } from '$lib/stores/chat';
</script>
"@ | Out-File -FilePath "src/lib/components/chat/ContactList.svelte" -Encoding UTF8

@"
<script lang="ts">
  export let handleSendMessage: (text: string) => void;
</script>
"@ | Out-File -FilePath "src/lib/components/chat/MessageInput.svelte" -Encoding UTF8

# Create barrel file for components
@"
export { default as ChatContainer } from './ChatContainer.svelte';
export { default as MessageList } from './MessageList.svelte';
export { default as ContactList } from './ContactList.svelte';
export { default as MessageInput } from './MessageInput.svelte';
"@ | Out-File -FilePath "src/lib/components/chat/index.ts" -Encoding UTF8

# Create types
@"
export interface Message {
    id: string;
    content: string;
    sender: User;
    timestamp: Date;
}

export interface User {
    id: string;
    name: string;
    avatar: string;
}
"@ | Out-File -FilePath "src/lib/types/chat.ts" -Encoding UTF8

# Create stores
@"
import { writable } from 'svelte/store';
import type { Message, User } from '$lib/types/chat';

export const messages = writable<Message[]>([]);
export const currentUser = writable<User | null>(null);
export const contacts = writable<User[]>([]);
"@ | Out-File -FilePath "src/lib/stores/chat.ts" -Encoding UTF8

# Create route files
@"
<script lang="ts">
    import '../app.postcss';
    import { currentUser } from '$lib/stores/chat';
</script>

<slot />
"@ | Out-File -FilePath "src/routes/chat/+layout.svelte" -Encoding UTF8

@"
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async () => {
    return {
        user: {
            id: '1',
            name: 'Current User',
            avatar: '/avatars/default.png'
        }
    };
};
"@ | Out-File -FilePath "src/routes/chat/+layout.ts" -Encoding UTF8

@"
<script lang="ts">
    import { ChatContainer } from '$lib/components/chat';
</script>

<ChatContainer />
"@ | Out-File -FilePath "src/routes/chat/+page.svelte" -Encoding UTF8

# Create PostCSS config
