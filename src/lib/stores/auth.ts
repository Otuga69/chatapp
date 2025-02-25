import { writable, type Writable } from 'svelte/store';
import type { Message, User } from '$lib/types/chat';

export const messages: Writable<Message[]> = writable([]);
export const currentUser: Writable<User | null> = writable(null);
export const contacts: Writable<User[]> = writable([]);

// Client-side function to send a message via API
export async function sendMessageToBot(message: string): Promise<string> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Failed to send message:', error);
    return "Oops, I had trouble responding. Try again? *sigh*";
  }
}

