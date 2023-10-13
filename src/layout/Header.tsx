import { AppBar, IconButton, Toolbar, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DeleteIcon from "@mui/icons-material/Delete";

export interface HeaderProps {
    currentInterlocutorId: string|null;
    onMobileMenuOpen: () => void;
    onDeleteConversation: () => void;
}

function Header({ currentInterlocutorId, onMobileMenuOpen, onDeleteConversation }: HeaderProps) {
    return (
        <AppBar
            position="fixed"
            sx={{
                width: { md: `calc(100% - 350px)` },
                ml: { md: `350px` },
            }}
        >
            <Toolbar variant="dense">
                <IconButton
                    color="inherit"
                    edge="start"
                    onClick={onMobileMenuOpen}
                    sx={{ mr: 2, display: { md: "none" }, flex: "0 0 auto" }}
                >
                    <MenuIcon />
                </IconButton>
                <Typography variant="h6" noWrap component="div" sx={{ flex: "1 1 auto"}}>
                    {currentInterlocutorId ? `Konwersacja z ${currentInterlocutorId}` : "Wybierz konwersację"}
                </Typography>
                {currentInterlocutorId && (
                    <IconButton color="inherit" edge="end" onClick={onDeleteConversation} sx={{ flex: "0 0 auto"}}>
                        <DeleteIcon />
                    </IconButton>
                )}
            </Toolbar>
        </AppBar>
    );
}

export default Header;
