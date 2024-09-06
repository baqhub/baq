import {DateServicesProvider} from "@baqhub/ui/date/dateServicesProvider.js";
import {LayerManager} from "@baqhub/ui/layers/layerManager.js";
import {StrictMode} from "react";
import ReactDOM from "react-dom/client";
import {App} from "./components/app.js";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <LayerManager>
      <DateServicesProvider locale="en-us">
        <App />
      </DateServicesProvider>
    </LayerManager>
  </StrictMode>
);
