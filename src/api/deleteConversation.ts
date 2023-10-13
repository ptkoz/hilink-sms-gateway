import { Conversation } from "../types.ts";
import { handleResponse } from "./fetchHelpers.ts";

/**
 * Deletes all messages in given conversation from HiLink modem storage.
 */
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
