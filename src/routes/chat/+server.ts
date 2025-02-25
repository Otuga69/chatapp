import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { pb } from '$lib/pb.server';

export const GET: RequestHandler = async () => {
  try {
    if (!pb.authStore.isValid || !pb.authStore.model) {
      return json({ 
        messages: [],
        user: null
      });
    }

    // Fetch messages for the current user
    const records = await pb.collection('chat_messages').getList(1, 50, {
      filter: `user="${pb.authStore.model.id}"`,
      sort: 'created'
    });
    
    const messages = records.items.map(record => ({
      id: record.id,
      content: record.content,
      sender: record.isBot ? {
        id: 'bot',
        name: 'SassyGirlfriendBot',
        avatar: '/avatars/bot.png'
      } : {
        id: pb.authStore.model?.id || 'unknown',
        name: pb.authStore.model?.name || 'User',
        avatar: pb.authStore.model?.avatar || '/avatars/default.png'
      },
      timestamp: new Date(record.created).toISOString()
    }));

    return json({
      messages,
      user: {
        id: pb.authStore.model.id,
        name: pb.authStore.model.name || 'User',
        avatar: pb.authStore.model.avatar || '/avatars/default.png'
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return json({ 
      messages: [],
      user: null
    });
  }
}