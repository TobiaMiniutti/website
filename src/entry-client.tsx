import React from "react";
import { hydrateRoot } from "react-dom/client";
import { App } from "./App";
import { initializeConsentDefaults } from "./lib/consent";
import "./styles.css";

initializeConsentDefaults();
document.documentElement.classList.remove("no-js");
hydrateRoot(document.getElementById("root")!, <React.StrictMode><App url={window.location.pathname} /></React.StrictMode>);
