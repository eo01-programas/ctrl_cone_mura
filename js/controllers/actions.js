import {
  appendDetailSlot,
  changeDate,
  changeDetailSlot,
  changeDirectProduction,
  changeEficiencia,
  changeMachine,
  changeObservacion,
  changeTurn,
  clearCapture,
  discardDetailSlot,
  saveAndValidateCapture
} from "../services/formulario-service.js";
import { getState } from "../core/store.js";
import { hideSyncLoadingOverlay, renderApp, showSyncLoadingOverlay, showToast } from "../ui/view.js";

let bound = false;

async function handleAction(target) {
  const button = target.closest("[data-action]");
  if (!button) return false;

  const { action, machineId, index } = button.dataset;

  if (action === "select-machine") {
    changeMachine(machineId);
    renderApp();
    return true;
  }

  if (action === "add-slot") {
    appendDetailSlot();
    renderApp();
    return true;
  }

  if (action === "remove-slot") {
    discardDetailSlot(Number(index));
    renderApp();
    return true;
  }

  if (action === "clear-form") {
    clearCapture();
    renderApp();
    showToast("Campos reiniciados");
    return true;
  }

  if (action === "save-and-validate") {
    renderApp();
    showSyncLoadingOverlay();
    let saved;
    try {
      saved = await saveAndValidateCapture();
    } finally {
      hideSyncLoadingOverlay();
    }
    renderApp();
    // saveAndValidateCapture ya distingue validacion vs error de backend y deja
    // el motivo especifico en state.submitFeedback.message (tambien visible en
    // la tarjeta persistente de la pagina) -- el toast lo repite en corto en
    // vez de un generico "No se pudo guardar" que ocultaria la razon real.
    const feedback = getState().submitFeedback;
    showToast(saved ? "Se guardó exitosamente" : (feedback.message || "No se pudo guardar"));
    return true;
  }

  return false;
}

function handleInput(target) {
  const field = target.dataset.input;
  if (!field) return false;

  if (field === "date") changeDate(target.value);
  if (field === "machine") changeMachine(target.value);
  if (field === "turn") changeTurn(target.value);
  if (field === "direct-production") changeDirectProduction(target.value);
  if (field === "eficiencia") changeEficiencia(target.value);
  if (field === "observacion") changeObservacion(target.value);
  if (field === "detail-slot") changeDetailSlot(Number(target.dataset.index), target.value);
  return true;
}

export function bindEventHandlers() {
  if (bound) return;
  bound = true;

  document.addEventListener("click", async (event) => {
    await handleAction(event.target);
  });

  document.addEventListener("input", (event) => {
    handleInput(event.target);
  });

  document.addEventListener("change", (event) => {
    if (handleInput(event.target)) {
      renderApp();
    }
  });
}
