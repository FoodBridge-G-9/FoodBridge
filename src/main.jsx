
import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import "leaflet/dist/leaflet.css";
import App from "./App.jsx";
import { store } from "./app/store";
import { ThemeProvider } from "./context/ThemeContext";
import "./style.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
      <ThemeProvider>
        <App />
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);

