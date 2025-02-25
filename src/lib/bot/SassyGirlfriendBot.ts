// src/lib/chatbot/SassyGirlfriendBot.ts
import { pb } from '$lib/pb.server';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Type for storing bot's personality state per user
interface BotPersonalityState {
    userId: string;
    sassLevel: number;
    patience: number;
    sweetness: number;
    mood: 'irritated' | 'playful' | 'sarcastic' | 'dramatic' | 'passive-aggressive';
    lastInteraction: string;
}

export class SassyGirlfriendBot {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor(apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    }

    // Get or create personality state for a user
    private async getPersonalityState(userId: string): Promise<BotPersonalityState> {
        try {
            // Try to find existing state
            const record = await pb.collection('bot_states').getFirstListItem(`user="${userId}"`);
            return {
                userId,
                sassLevel: record.sassLevel,
                patience: record.patience,
                sweetness: record.sweetness,
                mood: record.mood,
                lastInteraction: record.lastInteraction
            };
        } catch {
            // Create new state if none exists
            const newState = {
                userId,
                sassLevel: Math.random() * 0.5 + 0.5,
                patience: Math.random() * 0.6 + 0.2,
                sweetness: Math.random() * 0.4 + 0.3,
                mood: ['irritated', 'playful', 'sarcastic', 'dramatic', 'passive-aggressive'][
                    Math.floor(Math.random() * 5)
                ] as 'irritated' | 'playful' | 'sarcastic' | 'dramatic' | 'passive-aggressive',
                lastInteraction: new Date().toISOString()
            };

            await pb.collection('bot_states').create(newState);
            return newState;
        }
    }

    async sendMessage(userId: string, message: string): Promise<string> {
        // Ensure user is authenticated
        if (!pb.authStore.isValid) {
            throw new Error('User must be authenticated to chat');
        }

        try {
            // Get bot's personality state for this user
            const state = await this.getPersonalityState(userId);

            // Get recent conversation history
            const history = await pb.collection('chat_messages').getList(1, 5, {
                filter: `user="${userId}"`,
                sort: '-created'
            });

            // Generate response using the model
            const response = await this.model.generateContent(
                this.generatePrompt(state, history.items, message)
            );

            const botResponse = this.addPersonality(response.response.text(), state);

            // Save both messages to database
            await pb.collection('chat_messages').create({
                user: userId,
                content: message,
                isBot: false,
                conversationId: userId // Using userId as conversation ID for simplicity
            });

            await pb.collection('chat_messages').create({
                user: userId,
                content: botResponse,
                isBot: true,
                conversationId: userId
            });

            // Update bot's state
            await this.updateBotState(state);

            return botResponse;
        } catch (error) {
            console.error('Chat error:', error);
            throw new Error('Failed to process message');
        }
    }

    private generatePrompt(
        state: BotPersonalityState,
        history: any[],
        userInput: string
    ): string {
        const recentConversations = history
            .map(msg => `${msg.isBot ? 'You' : 'User'}: ${msg.content}`)
            .reverse()
            .join('\n');

        return `You are a sassy girlfriend AI with a dynamic personality.
Current mood: ${state.mood}
Personality traits:
- Sass level: ${state.sassLevel.toFixed(2)}
- Patience: ${state.patience.toFixed(2)}
- Sweetness: ${state.sweetness.toFixed(2)}

Recent conversations:
${recentConversations}

User: ${userInput}`;
    }

    private addPersonality(content: string, state: BotPersonalityState): string {
        const petNames = ["honey", "sweetie", "babe", "dear"];
        const sassPatterns = [
            `*${['ugh', 'sigh', 'eye roll'][Math.floor(Math.random() * 3)]}*`,
            "... whatever 💅",
            "just saying 🙄"
        ];

        let response = content.trim();

        if (state.sassLevel > 0.7) {
            response = `Look, ${
                petNames[Math.floor(Math.random() * petNames.length)]
            }, ${response.toLowerCase()}`;
        }

        if (Math.random() < state.sassLevel) {
            response = `${response} ${
                sassPatterns[Math.floor(Math.random() * sassPatterns.length)]
            }`;
        }

        return response;
    }

    private async updateBotState(state: BotPersonalityState) {
        // Randomly adjust personality traits
        state.sassLevel += (Math.random() - 0.5) * 0.1;
        state.patience += (Math.random() - 0.5) * 0.1;
        state.sweetness += (Math.random() - 0.5) * 0.1;

        // Occasionally change mood
        if (Math.random() < 0.2) {
            const moods: Array<'irritated' | 'playful' | 'sarcastic' | 'dramatic' | 'passive-aggressive'> = 
                ['irritated', 'playful', 'sarcastic', 'dramatic', 'passive-aggressive'];
            state.mood = moods[Math.floor(Math.random() * moods.length)];
        }

        state.lastInteraction = new Date().toISOString();

        // Update in database
        await pb.collection('bot_states').update(state.userId, state);
    }
}