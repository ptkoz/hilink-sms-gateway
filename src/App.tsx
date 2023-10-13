import Theme from "./Theme.tsx";
import { Conversation, deleteConversation, MessageDirection, sendMessage, startConversationPolling } from "./api.ts";
import { useEffect, useRef, useState } from "react";
import {
    AppBar,
    Box,
    Button,
    CssBaseline,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Toolbar,
    Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DeleteIcon from "@mui/icons-material/Delete";
import Menu from "./Menu.tsx";
import MessageView from "./MessageView.tsx";
import OutboundInput from "./OutboundInput.tsx";

function App() {
    const conversationEndRef = useRef<HTMLDivElement>(null);
    const [selected, setSelected] = useState("");
    const [isMobileOpen, setMobileOpen] = useState(false);
    const [isDeleteOpen, setDeleteOpen] = useState(false);
    const [conversations, setConversations] = useState<Conversation[]>([]);

    useEffect(() => {
        return startConversationPolling(setConversations);
    }, []);

    useEffect(() => {
        if (selected === "" && conversations.length > 0) {
            setSelected(conversations[0].interlocutorId);
        }

        conversationEndRef.current?.scrollIntoView();
    }, [conversations, selected]);

    const handleSend = (phoneNumber: string, msg: string) => {
        sendMessage(phoneNumber, msg).catch((e) => console.error(e));

        const newConversations = conversations.slice();
        const index = newConversations.findIndex((c) => c.phoneNumber === phoneNumber);
        newConversations[index]?.messages.push({
            direction: MessageDirection.OUTBOUND,
            interlocutorId: phoneNumber,
            content: msg,
            timestamp: new Date(),
            pending: true,
        });
        setConversations(newConversations);
    };

    const current = conversations.find((c) => c.interlocutorId === selected);

    const handleDelete = () => {
        if (current) {
            deleteConversation(current).catch((e) => console.error(e));
            setConversations(conversations.filter(c => c.interlocutorId !== current.interlocutorId));
        }
        setDeleteOpen(false);
    };

    return (
        <Theme>
            <Box sx={{ display: "flex", maxWidth: "1300px" }}>
                <CssBaseline />
                <AppBar
                    position="fixed"
                    sx={{
                        width: { md: `calc(100% - 350px)` },
                        ml: { md: `350px` },
                    }}
                >
                    <Toolbar>
                        <IconButton
                            color="inherit"
                            edge="start"
                            onClick={() => setMobileOpen(!isMobileOpen)}
                            sx={{ mr: 2, display: { md: "none" } }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" noWrap component="div">
                            {selected}
                        </Typography>
                        {current && (
                            <IconButton color="inherit" edge="end" onClick={() => setDeleteOpen(true)}>
                                <DeleteIcon />
                            </IconButton>
                        )}
                    </Toolbar>
                </AppBar>
                <Menu
                    isMobileOpen={isMobileOpen}
                    onClose={() => setMobileOpen(false)}
                    selected={selected}
                    onSelect={setSelected}
                    conversations={conversations}
                />
                <Box component="main" sx={{ flexGrow: 1, p: 3, width: { md: `calc(100% - 350px)` } }}>
                    <Toolbar />
                    {current?.messages.map((msg, key) => <MessageView {...msg} key={key} />)}
                    <div ref={conversationEndRef} />
                    <Toolbar />
                    {current?.phoneNumber && <OutboundInput onSend={handleSend} phoneNumber={current.phoneNumber} />}
                </Box>
            </Box>
            <Dialog open={isDeleteOpen} onClose={() => setDeleteOpen(false)}>
                <DialogTitle>{`Usunąć całą konwersację z ${current?.interlocutorId}?`}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Czy na pewno chcesz usunąć wszystkie wiadomości w tej konwersacji?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteOpen(false)}>Nie</Button>
                    <Button onClick={handleDelete} autoFocus>
                        Tak
                    </Button>
                </DialogActions>
            </Dialog>
        </Theme>
    );
}

export default App;
