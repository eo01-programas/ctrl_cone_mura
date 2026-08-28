import { normalizeBootstrapPayload, buildSubmissionDraft } from "../adapters/formulario-adapters.js";
import { FALLBACK_BOOTSTRAP } from "../core/constants.js";
import { resolveCurrentUser } from "../core/session.js";
import {
  addDetailSlot,
  clearMessages,
  clearPreview,
  getState,
  hydrateBootstrap,
  removeDetailSlot,
  resetCaptureFields,
  setDetailSlot,
  setDirectProduction,
  setEficiencia,
  setError,
  setLoading,
  setNotice,
  setObservacion,
  setPreview,
  setSubmitting,
  setSelectedDate,
  setSelectedMachine,
  setSelectedTurn,
  setSubmitFeedback
} from "../core/store.js";
import { loadBootstrapData, submitCapture } from "../repositories/formulario-repository.js";

function getSelectedMachine() {
  const state = getState();
  return state.catalogoMaquinas.find((machine) => machine.id_maquina === state.selectedMachineId) || null;
}

function getSelectedTurn() {
  const state = getState();
  return state.catalogoTurnos.find((turn) => turn.id_turno === state.selectedTurnId) || null;
}

export async function initializeFormulario() {
  setLoading(true);
  clearMessages();
  setNotice("");

  try {
    const payload = normalizeBootstrapPayload(await loadBootstrapData());
    hydrateBootstrap(payload);
    setNotice("Catalogos cargados desde el backend actual de CONERAS.");
  } catch (error) {
    hydrateBootstrap(normalizeBootstrapPayload(FALLBACK_BOOTSTRAP));
    setNotice(`No fue posible leer el backend. Se cargo un catalogo local para seguir con la maqueta. Detalle: ${error.message}`);
  } finally {
    setLoading(false);
  }
}

export function changeMachine(machineId) {
  clearMessages();
  clearPreview();
  setSubmitFeedback("", "");
  setSelectedMachine(machineId);
}

export function changeTurn(turnId) {
  clearMessages();
  setSubmitFeedback("", "");
  setSelectedTurn(turnId);
}

export function changeDate(date) {
  clearMessages();
  setSubmitFeedback("", "");
  setSelectedDate(date);
}

export function changeDirectProduction(value) {
  clearMessages();
  setSubmitFeedback("", "");
  setDirectProduction(value);
}

export function changeEficiencia(value) {
  clearMessages();
  setSubmitFeedback("", "");
  setEficiencia(value);
}

export function changeObservacion(value) {
  clearMessages();
  setSubmitFeedback("", "");
  setObservacion(value);
}

export function changeDetailSlot(index, value) {
  clearMessages();
  setSubmitFeedback("", "");
  setDetailSlot(index, value);
}

export function appendDetailSlot() {
  clearMessages();
  setSubmitFeedback("", "");
  addDetailSlot();
}

export function discardDetailSlot(index) {
  clearMessages();
  setSubmitFeedback("", "");
  removeDetailSlot(index);
}

export function clearCapture() {
  clearMessages();
  setSubmitFeedback("", "");
  resetCaptureFields();
}

export function prepareSubmissionDraft() {
  clearMessages();

  try {
    const state = getState();
    const machine = getSelectedMachine();
    const turn = getSelectedTurn();
    const usuario = resolveCurrentUser(state.currentUser);

    const draft = buildSubmissionDraft({
      machine,
      turn,
      date: state.selectedDate,
      detailSlots: state.detailSlots,
      directProduction: state.directProduction,
      eficiencia: state.eficiencia,
      observacion: state.observacion,
      usuario
    });

    setPreview(draft);
    return draft;
  } catch (error) {
    setError(error.message);
    return null;
  }
}

function buildSuccessMessage(submission) {
  const result = submission || {};
  const inserted = Number(result.insertedCount || 0);
  const updated = Number(result.updatedCount || 0);
  const machineName = result.machineName || "la maquina";
  const turnName = result.turnName || "turno";
  const date = result.date || "";

  if (updated > 0) {
    return `Registro guardado para ${machineName} (${turnName}${date ? `, ${date}` : ""}). Se insertaron ${inserted} fila(s) y se actualizo ${updated} eficiencia existente.`;
  }

  return `Registro guardado para ${machineName} (${turnName}${date ? `, ${date}` : ""}). Se insertaron ${inserted} fila(s) correctamente.`;
}

export async function saveAndValidateCapture() {
  clearMessages();
  setSubmitFeedback("", "");

  const draft = prepareSubmissionDraft();
  if (!draft) {
    // prepareSubmissionDraft ya dejo el motivo puntual (ej. "La eficiencia debe
    // estar entre 0 y 100.") en state.error via setError(); se reusa aca para
    // que el toast diga que fallo en vez de un generico "revisa el formulario".
    const reason = getState().error || "No se pudo guardar. Revisa la validacion del formulario.";
    setSubmitFeedback("error", reason);
    return false;
  }

  setSubmitting(true);
  try {
    const submission = await submitCapture(draft);
    resetCaptureFields();
    setSubmitFeedback("success", buildSuccessMessage(submission));
    return true;
  } catch (error) {
    setSubmitFeedback("error", error.message || "No se pudo guardar en Google Sheets.");
    return false;
  } finally {
    setSubmitting(false);
  }
}
