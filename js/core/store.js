import { INITIAL_DETAIL_SLOT_COUNT } from "./constants.js";

function todayISO() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function buildDetailSlots(count = INITIAL_DETAIL_SLOT_COUNT) {
  return Array.from({ length: count }, () => "");
}

const state = {
  loading: true,
  isSubmitting: false,
  notice: "",
  error: "",
  submitFeedback: {
    type: "",
    message: ""
  },
  sourceLabel: "-",
  currentUser: "",
  catalogoMaquinas: [],
  catalogoTurnos: [],
  selectedDate: todayISO(),
  selectedMachineId: "",
  selectedTurnId: "",
  detailSlots: buildDetailSlots(),
  directProduction: "",
  eficiencia: "",
  observacion: "",
  preview: null,
  lastValidatedAt: ""
};

export function getState() {
  return state;
}

export function setLoading(value) {
  state.loading = Boolean(value);
}

export function setSubmitting(value) {
  state.isSubmitting = Boolean(value);
}

export function setNotice(message) {
  state.notice = String(message || "");
}

export function setError(message) {
  state.error = String(message || "");
}

export function setSubmitFeedback(type, message) {
  state.submitFeedback = {
    type: String(type || ""),
    message: String(message || "")
  };
}

export function clearMessages() {
  state.error = "";
}

export function hydrateBootstrap(bootstrap) {
  state.catalogoMaquinas = Array.isArray(bootstrap.catalogoMaquinas) ? bootstrap.catalogoMaquinas : [];
  state.catalogoTurnos = Array.isArray(bootstrap.catalogoTurnos) ? bootstrap.catalogoTurnos : [];
  state.sourceLabel = String(bootstrap.sourceLabel || "-");
  state.currentUser = String(bootstrap.currentUser || "");

  const activeMachine = state.catalogoMaquinas.find((machine) => machine.estado === "ACTIVO");
  const firstTurn = state.catalogoTurnos[0];

  if (!state.selectedMachineId || !state.catalogoMaquinas.some((machine) => machine.id_maquina === state.selectedMachineId && machine.estado === "ACTIVO")) {
    state.selectedMachineId = activeMachine ? activeMachine.id_maquina : "";
  }

  if (!state.selectedTurnId || !state.catalogoTurnos.some((turn) => turn.id_turno === state.selectedTurnId)) {
    state.selectedTurnId = firstTurn ? firstTurn.id_turno : "";
  }
}

export function setSelectedMachine(machineId) {
  state.selectedMachineId = String(machineId || "");
  resetCaptureFields();
}

export function setSelectedTurn(turnId) {
  state.selectedTurnId = String(turnId || "");
  state.preview = null;
}

export function setSelectedDate(date) {
  state.selectedDate = String(date || "");
  state.preview = null;
}

export function setDirectProduction(value) {
  state.directProduction = String(value ?? "");
  state.preview = null;
}

export function setEficiencia(value) {
  state.eficiencia = String(value ?? "");
  state.preview = null;
}

export function setObservacion(value) {
  state.observacion = String(value ?? "");
  state.preview = null;
}

export function setDetailSlot(index, value) {
  if (index < 0 || index >= state.detailSlots.length) return;
  state.detailSlots[index] = String(value ?? "");
  state.preview = null;
}

export function addDetailSlot() {
  state.detailSlots.push("");
  state.preview = null;
}

export function removeDetailSlot(index) {
  if (state.detailSlots.length <= INITIAL_DETAIL_SLOT_COUNT) return;
  state.detailSlots.splice(index, 1);
  state.preview = null;
}

export function setPreview(preview) {
  state.preview = preview;
  state.lastValidatedAt = new Date().toISOString();
}

export function clearPreview() {
  state.preview = null;
}

export function resetCaptureFields() {
  state.detailSlots = buildDetailSlots();
  state.directProduction = "";
  state.eficiencia = "";
  state.observacion = "";
  state.preview = null;
}
