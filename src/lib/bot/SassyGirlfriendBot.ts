// src/lib/bot/SassyGirlfriendBot.ts
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
        } catch (error) {
            console.log('Creating new bot state for user:', userId);
            // Create new state if none exists
            const newState = {
                user: userId, // This should match PocketBase field reference
                sassLevel: Math.random() * 0.5 + 0.5,
                patience: Math.random() * 0.6 + 0.2,
                sweetness: Math.random() * 0.4 + 0.3,
                mood: ['irritated', 'playful', 'sarcastic', 'dramatic', 'passive-aggressive'][
                    Math.floor(Math.random() * 5)
                ] as 'irritated' | 'playful' | 'sarcastic' | 'dramatic' | 'passive-aggressive',
                lastInteraction: new Date().toISOString()
            };

            const record = await pb.collection('bot_states').create(newState);
            return {
                userId,
                sassLevel: record.sassLevel,
                patience: record.patience,
                sweetness: record.sweetness,
                mood: record.mood,
                lastInteraction: record.lastInteraction
            };
        }
    }

    async sendMessage(userId: string, message: string): Promise<string> {
        try {
            // Get bot's personality state for this user
            const state = await this.getPersonalityState(userId);

            // Get recent conversation history
            const history = await pb.collection('chat_messages').getList(1, 5, {
                filter: `user="${userId}"`,
                sort: '-created'
            });

            // Generate response using the model
            const prompt = this.generatePrompt(state, history.items, message);
            console.log('Sending prompt to Gemini:', prompt);
            
            const response = await this.model.generateContent(prompt);
            const responseText = response.response.text();
            console.log('Received response from Gemini:', responseText);

            const botResponse = this.addPersonality(responseText, state);

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
            throw new Error(`Failed to process message: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

User: ${userInput}

Keep your response concise, under 100 words. Be funny, slightly sassy, and include subtle hints of your current mood. Respond directly without mentioning that you are an AI.`;
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

        // Keep values within bounds
        state.sassLevel = Math.max(0.1, Math.min(1.0, state.sassLevel));
        state.patience = Math.max(0.1, Math.min(1.0, state.patience));
        state.sweetness = Math.max(0.1, Math.min(1.0, state.sweetness));

        // Occasionally change mood
        if (Math.random() < 0.2) {
            const moods: Array<'irritated' | 'playful' | 'sarcastic' | 'dramatic' | 'passive-aggressive'> = 
                ['irritated', 'playful', 'sarcastic', 'dramatic', 'passive-aggressive'];
            state.mood = moods[Math.floor(Math.random() * moods.length)];
        }

        state.lastInteraction = new Date().toISOString();

        try {
            // Update in database - need to search for the record first
            const record = await pb.collection('bot_states').getFirstListItem(`user="${state.userId}"`);
            await pb.collection('bot_states').update(record.id, {
                sassLevel: state.sassLevel,
                patience: state.patience,
                sweetness: state.sweetness,
                mood: state.mood,
                lastInteraction: state.lastInteraction
            });
        } catch (error) {
            console.error('Failed to update bot state:', error);
        }
    }
}