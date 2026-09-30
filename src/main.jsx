import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import Admin from "./admin/Admin.jsx";
import { AudioProvider } from "./context/AudioContext.jsx";
import "./index.css";

const path = window.location.pathname;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AudioProvider>
      {path === "/admin" ? <Admin /> : <App />}
    </AudioProvider>
  </React.StrictMode>
);
