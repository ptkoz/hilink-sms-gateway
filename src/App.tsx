import Theme from "./layout/Theme.tsx";
import { useCallback, useEffect, useRef, useState } from "react";
import { Box, CssBaseline } from "@mui/material";
import { Conversation, Message, MessageDirection } from "./types.ts";
import Menu from "./layout/Menu.tsx";
import Header from "./layout/Header.tsx";
import ConversationContent from "./layout/ConversationContent.tsx";
import DeleteConversationDialog from "./layout/DeleteConversationDialog.tsx";
import NewConversationDialog from "./layout/NewConversationDialog.tsx";
import { parseInterlocutor } from "./api/parseInterlocutor.ts";
import { sendMessage } from "./api/sendMessage.ts";
import { deleteConversation } from "./api/deleteConversation.ts";
import { startConversationPolling } from "./api/startConversationPolling.ts";

function App() {
    const conversationEndRef = useRef<HTMLDivElement>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedInterlocutorId, setSelectedInterlocutorId] = useState<null | string>(null);
    const [isMobileOpen, setMobileOpen] = useState(false);
    const [isDeleteOpen, setDeleteOpen] = useState(false);
    const [isCreateOpen, setCreateOpen] = useState(false);

    const currentConversation = conversations.find((c) => c.interlocutor.id === selectedInterlocutorId);

    useEffect(() => {
        return startConversationPolling(setConversations);
    }, []);

    useEffect(() => {
        if (selectedInterlocutorId === null && conversations.length > 0) {
            setSelectedInterlocutorId(conversations[0].interlocutor.id);
        }

        conversationEndRef.current?.scrollIntoView();
    }, [conversations, selectedInterlocutorId]);

    const handleSend = useCallback(
        (phone: string, msg: string) => {
            const interlocutor = parseInterlocutor(phone);
            if (!interlocutor.phoneNumber) {
                return false;
            }

            sendMessage(interlocutor.phoneNumber, msg).catch((e) => console.error(e));

            const sentMessage: Message = {
                direction: MessageDirection.OUTBOUND,
                interlocutor,
                content: msg,
                timestamp: new Date(),
                pending: true,
            };

            const newConversations = conversations.slice();
            const index = newConversations.findIndex((c) => c.interlocutor.id === interlocutor.id);
            if (index !== -1) {
                newConversations[index]?.messages.push(sentMessage);
            } else {
                newConversations.unshift({
                    interlocutor,
                    lastMessageTimestamp: sentMessage.timestamp,
                    messages: [sentMessage],
                });
            }

            setConversations(newConversations);
            setSelectedInterlocutorId(interlocutor.id);
            return true;
        },
        [conversations],
    );

    const handleDeleteConfirm = useCallback(() => {
        if (currentConversation) {
            deleteConversation(currentConversation).catch((e) => console.error(e));

            const currentIndex = conversations.findIndex(
                (c) => c.interlocutor.id === currentConversation.interlocutor.id,
            );
            if (currentIndex > 0) {
                setSelectedInterlocutorId(conversations[currentIndex - 1].interlocutor.id);
            } else if (currentIndex < conversations.length - 1) {
                setSelectedInterlocutorId(conversations[currentIndex + 1].interlocutor.id);
            } else {
                setSelectedInterlocutorId(null);
            }

            setConversations(conversations.filter((c) => c.interlocutor.id !== currentConversation.interlocutor.id));
        }
        setDeleteOpen(false);
    }, [currentConversation, conversations]);

    const handleDeleteCancel = useCallback(() => setDeleteOpen(false), []);
    const handleDeleteOpen = useCallback(() => setDeleteOpen(true), []);
    const handleMobileOpen = useCallback(() => setMobileOpen(true), []);
    const handleMobileClose = useCallback(() => setMobileOpen(false), []);
    const handleCreateOpen = useCallback(() => setCreateOpen(true), []);
    const handleCreateClose = useCallback(() => setCreateOpen(false), []);

    return (
        <Theme>
            <CssBaseline />
            <Box sx={{ display: "flex", maxWidth: "1100px", minWidth: "350px" }}>
                <Header
                    onMobileMenuOpen={handleMobileOpen}
                    currentInterlocutorId={selectedInterlocutorId}
                    onDeleteConversation={handleDeleteOpen}
                />
                <Menu
                    isMobileOpen={isMobileOpen}
                    onMobileClose={handleMobileClose}
                    selectedInterlocutorId={selectedInterlocutorId}
                    onSelectInterlocutor={setSelectedInterlocutorId}
                    conversations={conversations}
                    onConversationCreate={handleCreateOpen}
                />
                {currentConversation && (
                    <ConversationContent
                        conversation={currentConversation}
                        conversationEndRef={conversationEndRef}
                        onSend={handleSend}
                    />
                )}
            </Box>
            <NewConversationDialog open={isCreateOpen} onClose={handleCreateClose} onSend={handleSend} />
            {currentConversation && (
                <DeleteConversationDialog
                    open={isDeleteOpen}
                    onDeleteCancel={handleDeleteCancel}
                    conversationToDelete={currentConversation}
                    onDeleteConfirm={handleDeleteConfirm}
                />
            )}
        </Theme>
    );
}

export default App;
