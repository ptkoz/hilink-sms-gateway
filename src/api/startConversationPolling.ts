import { Conversation } from "../types.ts";
import { getMessageCount } from "./getMessageCount.ts";
import { getConversations } from "./getConversations.ts";

/**
 * Loads initial conversations and starts polling server for updates - if there are any, it loads them
 * automatically.
 *
 * @param handleNewConversations A handler that receives new conversations whenever they got updated
 * @return A function that - once called - stops the polling process.
 */
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
