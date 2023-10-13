import { createTheme, ThemeProvider } from "@mui/material";
import { PropsWithChildren } from "react";

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
    typography: {
        fontWeightLight: "100",
        fontWeightMedium: "300",
        fontWeightRegular: "500",
        fontWeightBold: "900",
    }
});

function Theme({ children }: PropsWithChildren) {
    return (
        <ThemeProvider theme={darkTheme}>
            {children}
        </ThemeProvider>
    );
}

export default Theme;
