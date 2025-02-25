import { writable } from 'svelte/store';
import type { Message, User } from '$lib/types/chat';

export const messages = writable<Message[]>([]);
export const currentUser = writable<User[]>([]);
export const contacts = writable<User[]>([]);

