export interface User {
    id: string;
    name: string;
    avatar: string;
    username?: string;
    email?: string;
    collectionId?: string;
    created?: string;
    updated?: string;
}

export interface Message {
    id: string;
    content: string;
    sender: User;
    timestamp: Date | string;
    isBot?: boolean;
    conversationId?: string;
    status?: 'sent' | 'delivered' | 'read';
    attachments?: MessageAttachment[];
}

export interface MessageAttachment {
    id: string;
    type: 'image' | 'file' | 'audio' | 'video';
    url: string;
    filename: string;
    size?: number;
    mimeType?: string;
}

export interface ChatState {
    isLoading: boolean;
    error: string | null;
    selectedContact: User | null;
}

export interface BotState {
    userId: string;
    sassLevel: number;
    patience: number;
    sweetness: number;
    mood: 'irritated' | 'playful' | 'sarcastic' | 'dramatic' | 'passive-aggressive';
    lastInteraction: string;
}
