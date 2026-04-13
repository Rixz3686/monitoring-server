import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { CssBaseline } from "@mui/material";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:3002";
axios.defaults.withCredentials = true;

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <CssBaseline />
      <App />
    </React.StrictMode>,
  );
}
