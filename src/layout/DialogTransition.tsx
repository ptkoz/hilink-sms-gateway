import { TransitionProps } from "@mui/material/transitions";
import { Slide } from "@mui/material";
import { forwardRef, ReactElement, Ref } from "react";

/**
 * Transition used to show Dialogs
 */
const Transition = forwardRef(function Transition(
    props: TransitionProps & {
        children: ReactElement;
    },
    ref: Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default Transition;
