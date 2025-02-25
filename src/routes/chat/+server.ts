// src/routes/api/chat/+server.ts
import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { pb } from '$lib/pb.server';
import { SassyGirlfriendBot } from '$lib/bot/SassyGirlfriendBot';
import { env } from '$env/dynamic/private';

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    // Ensure user is authenticated
    if (!locals.pb.authStore.isValid || !locals.pb.authStore.model) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('Google API key is not configured');
    }

    const { message } = await request.json();
    if (!message || typeof message !== 'string') {
      return json({ error: 'Invalid message' }, { status: 400 });
    }

    const userId = locals.pb.authStore.model.id;
    const bot = new SassyGirlfriendBot(apiKey);

    // Use sendMessage() instead of generateResponse()
    const response = await bot.sendMessage(userId, message);

    // No need to manually create chat messages since sendMessage() handles that
    return json({ response });

  } catch (error) {
    console.error('Error processing bot response:', error);
    return json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
};