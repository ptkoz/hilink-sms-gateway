import { Conversation } from "../types.ts";
import { Box, Toolbar } from "@mui/material";
import OutboundInput from "./OutboundInput.tsx";
import { Ref } from "react";
import MessageView from "./MessageView.tsx";

export interface ConversationContentProps {
    conversation: Conversation;
    conversationEndRef: Ref<HTMLDivElement>;

    onSend(phoneNumber: string, msg: string): boolean;
}

/**
 * A component displaying sent & received messages in a form of a chat.
 */
function ConversationContent({ conversation, onSend, conversationEndRef }: ConversationContentProps) {
    return (
        <Box component="main" sx={{ flexGrow: 1, p: 3, width: { md: `calc(100% - 350px)` } }}>
            <Toolbar />
            {conversation.messages.map((msg, key) => (
                <MessageView {...msg} key={key} />
            ))}
            <Toolbar />
            {conversation.interlocutor.phoneNumber && (
                <Box
                    sx={{
                        position: "fixed",
                        bottom: 0,
                        padding: "0 0 0.5em",
                        width: { xs: "100%", md: "calc(100% - 350px)" },
                        left: { xs: "0", md: "350px" },
                        bgcolor: "background.default",
                    }}
                >
                    <OutboundInput onSend={onSend} phoneNumber={conversation.interlocutor.phoneNumber} />
                </Box>
            )}
            <div ref={conversationEndRef} />
        </Box>
    );
}

export default ConversationContent;
