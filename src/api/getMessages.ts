import { Message, MessageDirection } from "../types.ts";
import { getMessageCount } from "./getMessageCount.ts";
import { handleResponse } from "./fetchHelpers.ts";
import { extractString, extractTimestamp } from "./xmlHelpers.ts";
import { parseInterlocutor } from "./parseInterlocutor.ts";

/**
 * Loads all messages from HiLink modem in 50-message chunks (max the modem can return in single
 * request).
 */
export async function getMessages(direction: MessageDirection) {
    const noMessagesPerRequest = 50;
    const count = await getMessageCount(direction);
    const pages = Math.ceil(count / noMessagesPerRequest);
    const messages: Message[] = [];

    for (let i = 1; i <= pages; i++) {
        const response = await fetch("https://sms.wro.tuxlan.es/api/sms/sms-list", {
            method: "POST",
            headers: {
                "Content-Type": "application/xml",
                "Accept": "application/xml",
            },
            body: `<?xml version="1.0" encoding="UTF-8"?><request><PageIndex>${i}</PageIndex><ReadCount>${noMessagesPerRequest}</ReadCount><BoxType>${direction}</BoxType><SortType>0</SortType><Ascending>0</Ascending><UnreadPreferred>0</UnreadPreferred></request>`,
        }).then(handleResponse);

        for (const message of response.querySelectorAll("Message")) {
            messages.push({
                direction,
                index: extractString(message, "Index"),
                timestamp: extractTimestamp(message, "Date"),
                interlocutor: parseInterlocutor(extractString(message, "Phone", "Nieznany")),
                content: extractString(message, "Content", ""),
            });
        }
    }

    return messages;
}
