import { Box, FormControl, IconButton, InputAdornment, OutlinedInput, Toolbar } from "@mui/material";
import Send from "@mui/icons-material/Send";
import { ChangeEvent, FormEvent, useState } from "react";

interface OutboundInputProps {
    onSend(phoneNumber: string, message: string): void;
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
    }

    const handleSend = () => {
        const messageToSend = value[phoneNumber];
        if (messageToSend && messageToSend.length > 0) {
            onSend(phoneNumber, messageToSend);
            setValue({
                ...value,
                [phoneNumber]: "",
            });
        }
    };

    return (
        <form onSubmit={handleSubmit}>
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
                <Toolbar>
                    <FormControl fullWidth variant="outlined">
                        <OutlinedInput
                            id="type-message"
                            value={value[phoneNumber] ?? ""}
                            onChange={handleChange}
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
                    </FormControl>
                </Toolbar>
            </Box>
        </form>
    );
}

export default OutboundInput;
