import { Conversation } from "../types.ts";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import DialogTransition from "./DialogTransition.tsx";

/**
 * A conformation dialog shown before deleting the whole conversation.
 */
function DeleteConversationDialog(props: {
    open: boolean;
    onDeleteCancel: () => void;
    conversationToDelete: Conversation;
    onDeleteConfirm: () => void;
}) {
    return (
        <Dialog open={props.open} onClose={props.onDeleteCancel} TransitionComponent={DialogTransition}>
            <DialogTitle>{`Usunąć całą konwersację z ${props.conversationToDelete.interlocutor.id}?`}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Czy na pewno chcesz usunąć wszystkie wiadomości w tej konwersacji?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onDeleteCancel}>Nie</Button>
                <Button onClick={props.onDeleteConfirm} autoFocus>
                    Tak
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default DeleteConversationDialog;
