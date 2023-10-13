import { Conversation } from "./api.ts";
import {
    Box,
    Divider,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
} from "@mui/material";
import Message from "@mui/icons-material/Chat";

export interface MenuProps {
    isMobileOpen: boolean;
    onClose: () => void;
    selected: string;
    onSelect: (id: string) => void;
    conversations: Conversation[];
}

function Menu({ conversations, isMobileOpen, onClose, selected, onSelect }: MenuProps) {
    const selectClose = (id: string) => {
        onSelect(id);
        onClose();
    };

    const content = (
        <div>
            <Toolbar />
            <Divider />
            <List>
                {conversations.map((c) => (
                    <ListItem key={c.interlocutorId} disablePadding={true}>
                        <ListItemButton onClick={() => selectClose(c.interlocutorId)} selected={c.interlocutorId === selected}>
                            <ListItemIcon>
                                <Message />
                            </ListItemIcon>
                            <ListItemText
                                primary={c.interlocutorId}
                                primaryTypographyProps={{sx: {fontWeight: 300}}}
                                secondary={c.messages.at(-1)?.content}
                                secondaryTypographyProps={{ noWrap: true, textOverflow: "ellipsis" }}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </div>
    );

    return (
        <Box component="nav" sx={{ width: { md: 350 }, flexShrink: { md: 0 } }}>
            {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
            <Drawer
                variant="temporary"
                open={isMobileOpen}
                onClose={onClose}
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
                open
            >
                {content}
            </Drawer>
        </Box>
    );
}

export default Menu;
