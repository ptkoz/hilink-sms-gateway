import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Toolbar } from "@mui/material";
import OutboundInput from "./OutboundInput.tsx";
import { ChangeEvent, useCallback, useState } from "react";
import DialogTransition from "./DialogTransition.tsx";

interface NewConversationDialogProps {
    open: boolean;

    onClose(): void;

    onSend(phone: string, message: string): boolean;
}

function NewConversationDialog({ open, onClose, onSend }: NewConversationDialogProps) {
    const [phone, setPhone] = useState("");

    const handleSend = useCallback((phone: string, message: string) => {
        if (!onSend(phone, message)) {
            return false;
        }

        onClose();
        setPhone("");
        return true;
    }, [onSend, onClose])

    return (
        <Dialog open={open} onClose={onClose} TransitionComponent={DialogTransition} fullWidth={true} maxWidth="sm">
            <DialogTitle>
                <Toolbar variant="dense">
                    <TextField
                        label="Numer odbiorcy"
                        type="tel"
                        variant="standard"
                        focused={true}
                        value={phone}
                        fullWidth={true}
                        onChange={useCallback(
                            (event: ChangeEvent<HTMLInputElement>) => setPhone(event.target.value),
                            [],
                        )}
                    />
                </Toolbar>
            </DialogTitle>
            <DialogContent>
                <OutboundInput onSend={handleSend} phoneNumber={phone} />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Zamknij</Button>
            </DialogActions>
        </Dialog>
    );
}

export default NewConversationDialog;
