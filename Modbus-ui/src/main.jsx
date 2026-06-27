import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./index.css";
import "./App.css";
import MachineProvider from "./Context/MachineProvider";



ReactDOM.createRoot(document.getElementById("root")).render(

    <React.StrictMode>

        <MachineProvider>

            <App />

        </MachineProvider>

    </React.StrictMode>

);