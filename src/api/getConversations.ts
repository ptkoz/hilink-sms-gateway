import { Conversation, MessageDirection } from "../types.ts";
import { getMessages } from "./getMessages.ts";

/**
 * Fetches all messages from HiLink modem and parses them into conversations.
 */
export async function getConversations() {
    const map: Record<string, Conversation> = {};

    for (const direction of [MessageDirection.INBOUND, MessageDirection.OUTBOUND]) {
        for (const message of await getMessages(direction)) {
            let conversation = map[message.interlocutor.id] as Conversation | undefined;
            if (!conversation) {
                conversation = {
                    interlocutor: message.interlocutor,
                    lastMessageTimestamp: message.timestamp,
                    messages: [message],
                };
                map[message.interlocutor.id] = conversation;
            } else {
                conversation.messages.push(message);
                if (message.timestamp > conversation.lastMessageTimestamp) {
                    conversation.lastMessageTimestamp = message.timestamp;
                }
            }
        }
    }

    const conversations = Object.values(map).sort(
        (a, b) => b.lastMessageTimestamp.getTime() - a.lastMessageTimestamp.getTime(),
    );

    conversations.forEach((conversation) =>
        conversation.messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()),
    );

    return conversations;
}
