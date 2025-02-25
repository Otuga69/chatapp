﻿export interface User {
    id: string;
    name: string;
    avatar: string;
}

export interface Message {
    id: string;
    content: string;
    isBot: boolean;
    timestamp: string;
}

