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
      const errorData = await response.json();
      console.error('API error response:', errorData);
      throw new Error(`API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Failed to send message:', error);
    throw error; // Propagate error for better handling in components
  }
}

// Load messages from server
export async function loadMessages(): Promise<void> {
  try {
    const response = await fetch('/api/messages');
    
    if (!response.ok) {
      throw new Error(`Failed to load messages: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.user) {
      currentUser.set(data.user);
    }
    
    if (data.messages) {
      // Format dates properly
      const formattedMessages = data.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
      messages.set(formattedMessages);
    }
  } catch (error) {
    console.error('Error loading messages:', error);
    messages.set([]);
  }
}

