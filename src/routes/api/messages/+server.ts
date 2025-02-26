import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals }) => {
  try {
    if (!locals.pb.authStore.isValid || !locals.pb.authStore.model) {
      return json({ 
        messages: [],
        user: null
      });
    }

    const userId = locals.pb.authStore.model.id;

    // Fetch messages for the current user
    const records = await locals.pb.collection('chat_messages').getList(1, 50, {
      filter: `user="${userId}"`,
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
        id: locals.pb.authStore.model?.id || 'unknown',
        name: locals.pb.authStore.model?.name || 'User',
        avatar: locals.pb.authStore.model?.avatar || '/avatars/default.png'
      },
      timestamp: record.created
    }));

    return json({
      messages,
      user: {
        id: locals.pb.authStore.model.id,
        name: locals.pb.authStore.model.name || 'User',
        avatar: locals.pb.authStore.model.avatar || '/avatars/default.png'
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return json({ 
      messages: [],
      user: null,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }
}