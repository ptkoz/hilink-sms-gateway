import styled from "@emotion/styled";
import { CircularProgress, Typography } from "@mui/material";
import { format, formatDistance } from "date-fns";
import { useEffect, useState } from "react";
import { Message, MessageDirection } from "../types.ts";

interface DirectionProps {
    direction: MessageDirection;
}

const MessageBubble = styled.div`
    width: 55%;
    min-width: 300px;
    padding: 0.7em;
    border-radius: 15px;
    background: ${({ direction }: DirectionProps) => (direction === MessageDirection.INBOUND ? "#2d2d2f" : "#1d75fe")};
    margin-left: ${({ direction }: DirectionProps) => (direction === MessageDirection.INBOUND ? "0" : "auto")};
    margin-bottom: 1em;
    white-space: pre-wrap;
    display: flex;
    flex-flow: row wrap;
    justify-content: flex-end;

    > p {
        flex: 1 1 auto;
        font-weight: 400;
        max-width: 100%;
        overflow: hidden;
    }
`;

const TimestampText = styled.div`
    font-size: 0.8em;
    font-weight: 100;
    cursor: pointer;
    flex: 0 0 auto;
    align-self: flex-end;
    justify-self: flex-end;
    text-align: right;
`;

function MessageView({ content, timestamp, direction, pending }: Message) {
    const [showRelativeDate, setShowRelativeDate] = useState(true);

    return (
        <div>
            <MessageBubble direction={direction}>
                <Typography>{content}</Typography>
                <TimestampText title={format(timestamp, "PPp")} onClick={() => setShowRelativeDate(!showRelativeDate)}>
                    {pending && <CircularProgress size={"0.8em"} sx={{ mr: "0.5em" }} />}
                    {showRelativeDate ? <Distance date={timestamp} /> : format(timestamp, "PPp")}
                </TimestampText>
            </MessageBubble>
        </div>
    );
}

function Distance({ date }: { date: Date }) {
    const [value, setValue] = useState(() => formatDistance(date, new Date(), { addSuffix: true }));

    useEffect(() => {
        const interval = setInterval(
            () => {
                setValue(formatDistance(date, new Date(), { addSuffix: true }));
            },
            60000, // every minute
        );

        return () => {
            clearInterval(interval);
        };
    }, [date]);

    return <>{value}</>;
}

export default MessageView;
