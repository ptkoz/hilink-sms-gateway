import { parsePhoneNumber } from "awesome-phonenumber";
import { Interlocutor } from "../types.ts";

/**
 * Creates interlocutor object out of Phone Number
 */
export function parseInterlocutor(phone: string): Interlocutor {
    const parsedPhone = parsePhoneNumber(phone, { regionCode: "PL" });

    return {
        id: parsedPhone.valid ? parsedPhone.number.national : phone,
        phoneNumber: parsedPhone.valid ? parsedPhone.number.e164 : undefined
    }
}
