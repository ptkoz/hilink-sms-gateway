export enum MessageDirection {
    INBOUND = 1,
    OUTBOUND = 2,
}

export interface Interlocutor {
    id: string;
    phoneNumber?: string;
}

export interface Message {
    direction: MessageDirection;
    interlocutor: Interlocutor;
    timestamp: Date;
    content: string;
    index?: string;
    pending?: boolean;
}

export interface Conversation {
    interlocutor: Interlocutor;
    lastMessageTimestamp: Date;
    messages: Message[];
}
