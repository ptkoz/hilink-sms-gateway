import {
    Box,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
} from "@mui/material";
import MessageIcon from "@mui/icons-material/Chat";
import CreateIcon from "@mui/icons-material/Create";
import { Conversation } from "../types.ts";

export interface MenuProps {
    conversations: Conversation[];
    selectedInterlocutorId: string | null;
    isMobileOpen: boolean;

    onConversationCreate(): void;

    onMobileClose(): void;

    onSelectInterlocutor(id: string): void;
}

function Menu({
    conversations,
    selectedInterlocutorId,
    onSelectInterlocutor,
    isMobileOpen,
    onMobileClose,
    onConversationCreate,
}: MenuProps) {
    const content = (
        <div>
            <Toolbar sx={{ justifyContent: "flex-end" }} variant="dense">
                <IconButton onClick={() => {
                    onConversationCreate();
                    onMobileClose();
                }}>
                    <CreateIcon />
                </IconButton>
            </Toolbar>
            <List>
                {conversations.map((c) => (
                    <ListItem key={c.interlocutor.id} disablePadding={true}>
                        <ListItemButton
                            onClick={() => {
                                onSelectInterlocutor(c.interlocutor.id);
                                onMobileClose();
                            }}
                            selected={c.interlocutor.id === selectedInterlocutorId}
                        >
                            <ListItemIcon>
                                <MessageIcon />
                            </ListItemIcon>
                            <ListItemText
                                primary={c.interlocutor.id}
                                primaryTypographyProps={{ sx: { fontWeight: 300 } }}
                                secondary={c.messages.at(-1)?.content}
                                secondaryTypographyProps={{ noWrap: true, textOverflow: "ellipsis" }}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            {conversations.length === 0 && <Typography sx={{ textAlign: "center" }}>Brak konwersacji</Typography>}
        </div>
    );

    return (
        <Box component="nav" sx={{ width: { md: 350 }, flexShrink: { md: 0 } }}>
            <Drawer
                variant="temporary"
                open={isMobileOpen}
                onClose={onMobileClose}
                ModalProps={{
                    keepMounted: true, // Better open performance on mobile.
                }}
                sx={{
                    "display": { xs: "block", md: "none" },
                    "& .MuiDrawer-paper": { boxSizing: "border-box", width: 350 },
                }}
            >
                {content}
            </Drawer>
            <Drawer
                variant="permanent"
                sx={{
                    "display": { xs: "none", md: "block" },
                    "& .MuiDrawer-paper": { boxSizing: "border-box", width: 350 },
                }}
                PaperProps={{
                    sx: {
                        background: "linear-gradient(rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0.09))",
                        border: 0,
                    },
                }}
                open
            >
                {content}
            </Drawer>
        </Box>
    );
}

export default Menu;
