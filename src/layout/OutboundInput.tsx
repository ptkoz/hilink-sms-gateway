import { IconButton, InputAdornment, OutlinedInput, Toolbar } from "@mui/material";
import Send from "@mui/icons-material/Send";
import { ChangeEvent, FormEvent, useState } from "react";

interface OutboundInputProps {
    onSend(phoneNumber: string, message: string): boolean;

    phoneNumber: string;
}

function OutboundInput({ onSend, phoneNumber }: OutboundInputProps) {
    const [value, setValue] = useState<Record<string, string | undefined>>({});
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setValue({
            ...value,
            [phoneNumber]: e.target.value,
        });
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        handleSend();
    };

    const handleSend = () => {
        const messageToSend = value[phoneNumber];
        if (messageToSend && messageToSend.length > 0 && onSend(phoneNumber, messageToSend)) {
            setValue({
                ...value,
                [phoneNumber]: "",
            });
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Toolbar>
                <OutlinedInput
                    id="type-message"
                    value={value[phoneNumber] ?? ""}
                    onChange={handleChange}
                    fullWidth={true}
                    endAdornment={
                        <InputAdornment position="end">
                            <IconButton
                                aria-label="toggle password visibility"
                                edge="end"
                                onClick={handleSend}
                                disabled={!value[phoneNumber]}
                            >
                                <Send />
                            </IconButton>
                        </InputAdornment>
                    }
                />
            </Toolbar>
        </form>
    );
}

export default OutboundInput;
