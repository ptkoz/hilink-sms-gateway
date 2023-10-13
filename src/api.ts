import { format, parse } from "date-fns";
import { parsePhoneNumber } from "awesome-phonenumber";

export enum MessageDirection {
    INBOUND = 1,
    OUTBOUND = 2,
}

export interface Message {
    index?: string;
    timestamp: Date;
    direction: MessageDirection;
    phoneNumber?: string;
    interlocutorId: string;
    content: string;
    pending?: boolean;
}

export interface Conversation {
    lastMessageTimestamp: Date;
    phoneNumber?: string;
    interlocutorId: string;
    messages: Message[];
}

async function handleResponse(response: Response) {
    if (!response.ok) {
        throw new Error(response.statusText);
    }

    const document = new DOMParser().parseFromString(await response.text(), "application/xml");
    const errorNode = document.querySelector("parsererror");
    if (errorNode) {
        throw new Error(errorNode.textContent ? errorNode.textContent : "Parsing error");
    }

    return document;
}

function ensureInt(value: number | string | undefined | null): number {
    if (value === undefined || value === null) {
        return 0;
    }

    if (typeof value === "number") {
        return value;
    }

    const parsedValue = parseInt(value);
    return isNaN(parsedValue) ? 0 : parsedValue;
}

export async function getMessageCount(direction?: MessageDirection) {
    const response = await fetch("https://sms.wro.tuxlan.es/api/sms/sms-count").then(handleResponse);

    let totalCount = 0;

    if (!direction || direction === MessageDirection.INBOUND) {
        totalCount +=
            ensureInt(response.querySelector("LocalInbox")?.textContent) +
            ensureInt(response.querySelector("SimInbox")?.textContent);
    }

    if (!direction || direction === MessageDirection.OUTBOUND) {
        totalCount +=
            ensureInt(response.querySelector("LocalOutbox")?.textContent) +
            ensureInt(response.querySelector("SimOutbox")?.textContent);
    }

    return totalCount;
}

async function getMessages(direction: MessageDirection) {
    const now = new Date();
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
            const phone = message.querySelector("Phone")?.textContent ?? "";
            const parsedPhone = parsePhoneNumber(phone, { regionCode: "PL" });

            messages.push({
                direction,
                index: message.querySelector("Index")?.textContent ?? "",
                timestamp: parse(message.querySelector("Date")?.textContent ?? "", "yyyy-MM-dd HH:mm:ss", now),
                phoneNumber: parsedPhone.valid ? parsedPhone.number.e164 : undefined,
                interlocutorId: parsedPhone.valid ? parsedPhone.number.national : phone,
                content: message.querySelector("Content")?.textContent ?? "",
            });
        }
    }

    return messages;
}

export async function getConversations() {
    const map: Record<string, Conversation> = {};

    for (const direction of [MessageDirection.INBOUND, MessageDirection.OUTBOUND]) {
        for (const message of await getMessages(direction)) {
            let conversation = map[message.interlocutorId] as Conversation|undefined;
            if (!conversation) {
                conversation = {
                    phoneNumber: message.phoneNumber,
                    interlocutorId: message.interlocutorId,
                    lastMessageTimestamp: message.timestamp,
                    messages: [message],
                };
                map[message.interlocutorId] = conversation;
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
