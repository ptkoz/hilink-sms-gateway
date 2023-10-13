import { format } from "date-fns";
import { Conversation, Message, MessageDirection } from "./types.ts";
import { handleResponse } from "./api/fetchHelpers.ts";
import { extractInt, extractString, extractTimestamp } from "./api/xmlHelpers.ts";
import { parseInterlocutor } from "./api/parseInterlocutor.ts";

export async function getMessageCount(direction?: MessageDirection) {
    const response = await fetch("https://sms.wro.tuxlan.es/api/sms/sms-count").then(handleResponse);

    let totalCount = 0;
    if (!direction || direction === MessageDirection.INBOUND) {
        totalCount += extractInt(response, "LocalInbox") + extractInt(response, "SimInbox");
    }

    if (!direction || direction === MessageDirection.OUTBOUND) {
        totalCount += extractInt(response, "LocalOutbox") + extractInt(response, "SimOutbox");
    }

    return totalCount;
}

async function getMessages(direction: MessageDirection) {
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

export async function getConversations() {
    const map: Record<string, Conversation> = {};

    for (const direction of [MessageDirection.INBOUND, MessageDirection.OUTBOUND]) {
        for (const message of await getMessages(direction)) {
            let conversation = map[message.interlocutor.id] as Conversation|undefined;
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

export function startConversationPolling(handleNewConversations: (conversations: Conversation[]) => void) {
    let keepRunning = true;
    let totalNumber = 0;

    const receive = async () => {
        if (!keepRunning) {
            return;
        }

        const updatedNumber = await getMessageCount();
        if (updatedNumber !== totalNumber) {
            handleNewConversations(await getConversations());
            totalNumber = updatedNumber;
        }

        setTimeout(() => receive().catch((e) => console.error(e)), 3000);
    };

    receive().catch((e) => console.error(e));

    return () => {
        keepRunning = false;
    };
}

export async function sendMessage(to: string, content: string) {
    await fetch("https://sms.wro.tuxlan.es/api/sms/send-sms", {
        method: "POST",
        headers: {
            "Content-Type": "application/xml",
            "Accept": "application/xml",
        },
        body: `<?xml version: "1.0" encoding="UTF-8"?><request><Index>-1</Index><Phones><Phone>${to}</Phone></Phones><Sca></Sca><Content>${content}</Content><Length>${
            content.length
        }</Length><Reserved>1</Reserved><Date>${format(new Date(), "yyyy-MM-dd HH:mm:ss")}</Date></request>`,
    }).then(handleResponse);
}

export async function deleteConversation(conversation: Conversation) {
    const indexes = conversation.messages.reduce((carry, msg) => {
        return msg.index ? carry + `<Index>${msg.index}</Index>` : carry;
    }, "");

    await fetch("https://sms.wro.tuxlan.es/api/sms/delete-sms", {
        method: "POST",
        headers: {
            "Content-Type": "application/xml",
            "Accept": "application/xml",
        },
        body: `<?xml version: "1.0" encoding="UTF-8"?><request>${indexes}</request>`,
    }).then(handleResponse);
}
