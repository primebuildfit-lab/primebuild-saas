import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./theme.css";
import { App } from "./App";
import { PwaRuntime } from "./PwaRuntime";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <PwaRuntime />
  </StrictMode>,
);
