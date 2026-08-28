import { bindEventHandlers } from "./js/controllers/actions.js";
import { initializeFormulario } from "./js/services/formulario-service.js";
import { hideSyncLoadingOverlay, renderApp, showSyncLoadingOverlay } from "./js/ui/view.js";

async function bootstrap() {
  bindEventHandlers();
  renderApp();
  showSyncLoadingOverlay();
  try {
    await initializeFormulario();
  } finally {
    hideSyncLoadingOverlay();
  }
  renderApp();
}

bootstrap();
