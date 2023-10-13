import { Message, MessageDirection } from "./api.ts";
import styled from "@emotion/styled";
import { CircularProgress, Typography } from "@mui/material";
import { format, formatDistance } from "date-fns";
import { useState } from "react";

interface DirectionProps {
    direction: MessageDirection;
}

const MessageBubble = styled.div`
    width: 49%;
    padding: 0.7em 0.7em 1.5em;
    border-radius: 15px;
    background: ${({ direction }: DirectionProps) => (direction === MessageDirection.INBOUND ? "#2d2d2f" : "#1d75fe")};
    margin-left: ${({ direction }: DirectionProps) => (direction === MessageDirection.INBOUND ? "0" : "auto")};
    margin-bottom: 1em;
    white-space: pre-wrap;
    position: relative;
`;

const TimestampText = styled.div`
    position: absolute;
    right: 0;
    bottom: 0;
    padding: 0 15px 0.3em;
    font-size: 0.8em;
    font-weight: 100;
    cursor: pointer;
`;

function MessageView({ content, timestamp, direction, pending }: Message) {
    const [showRelativeDate, setShowRelativeDate] = useState(true);

    return (
        <div>
            <MessageBubble direction={direction}>
                <Typography>{content}</Typography>
                <TimestampText title={format(timestamp, "PPp")} onClick={() => setShowRelativeDate(!showRelativeDate)}>
                    {pending && <CircularProgress size={"0.8em"} sx={{ mr: "0.5em"}} />}
                    {showRelativeDate
                        ? formatDistance(timestamp, new Date(), { addSuffix: true })
                        : format(timestamp, "PPp")}
                </TimestampText>
            </MessageBubble>
        </div>
    );
}

export default MessageView;
