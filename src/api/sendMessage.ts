import { format } from "date-fns";
import { handleResponse } from "./fetchHelpers.ts";

/**
 * Asks modem to send a new message to given phone number.
 */
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
