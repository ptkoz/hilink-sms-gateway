import { MessageDirection } from "../types.ts";
import { handleResponse } from "./fetchHelpers.ts";
import { extractInt } from "./xmlHelpers.ts";

/**
 * Get the number of messages stored in HiLink modem. May be narrowed down to only received or sent messages.
 */
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
