import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { setDefaultOptions } from "date-fns";
import { pl } from "date-fns/locale";

setDefaultOptions({
    locale: pl,
});

const root = document.getElementById("root");

if (root) {
    ReactDOM.createRoot(root).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
    );
}
