import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { SassyGirlfriendBot } from '$lib/bot/SassyGirlfriendBot';
import { GEMINI_API_KEY } from '$env/static/private';
import { pb } from '$lib/pb.server';

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    // Check authentication
    if (!locals.pb.authStore.isValid || !locals.pb.authStore.model) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const userId = locals.pb.authStore.model.id;
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return json({ error: 'Invalid message format' }, { status: 400 });
    }

    // Initialize bot with API key
    const bot = new SassyGirlfriendBot(GEMINI_API_KEY);
    
    // Get response from bot
    const response = await bot.sendMessage(userId, message);
    
    return json({ response });
  } catch (error) {
    console.error('Chat API error:', error);
    return json({ 
      error: 'Failed to process message',
      response: "Oops, I had trouble responding. Try again? *sigh*" 
    }, { status: 500 });
  }
}