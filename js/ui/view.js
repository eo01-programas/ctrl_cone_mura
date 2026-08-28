import { INITIAL_DETAIL_SLOT_COUNT } from "../core/constants.js";
import { getState } from "../core/store.js";
import { MACHINE_CAPTURE_TYPES, MACHINE_STATUS } from "../domain/contracts.js";

function appRoot() {
  return document.getElementById("app");
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function fmtTurnName(turn) {
  if (!turn) return "-";
  return turn.nombre || turn.id_turno || "-";
}

function fmtDate(isoDate) {
  if (!isoDate) return "-";
  const [year, month, day] = String(isoDate).split("-");
  if (!year || !month || !day) return isoDate;
  return `${day}/${month}/${year}`;
}

function selectedMachineFrom(state) {
  return state.catalogoMaquinas.find((machine) => machine.id_maquina === state.selectedMachineId) || null;
}

function selectedTurnFrom(state) {
  return state.catalogoTurnos.find((turn) => turn.id_turno === state.selectedTurnId) || null;
}

function renderTurnOptions(state) {
  return state.catalogoTurnos.map((turn) => `
    <option value="${escapeHtml(turn.id_turno)}" ${turn.id_turno === state.selectedTurnId ? "selected" : ""}>
      ${escapeHtml(turn.nombre)} (${escapeHtml(turn.hora_inicio)} - ${escapeHtml(turn.hora_fin)})
    </option>
  `).join("");
}

function renderMachineOptions(state) {
  return state.catalogoMaquinas.map((machine) => `
    <option
      value="${escapeHtml(machine.id_maquina)}"
      ${machine.id_maquina === state.selectedMachineId ? "selected" : ""}
      ${machine.estado === MACHINE_STATUS.BLOQUEADO ? "disabled" : ""}
    >
      ${escapeHtml(machine.nombre_maquina)}${machine.estado === MACHINE_STATUS.BLOQUEADO ? " - BLOQUEADO" : ""}
    </option>
  `).join("");
}

function renderDetailSlotRows(state) {
  return state.detailSlots.map((slot, index) => `
    <div class="slot-row">
      <input
        class="input"
        type="number"
        min="0"
        step="0.01"
        placeholder="0.00"
        value="${escapeHtml(slot)}"
        data-input="detail-slot"
        data-index="${index}"
      >
      <button
        class="slot-row__remove"
        type="button"
        data-action="remove-slot"
        data-index="${index}"
        ${state.detailSlots.length <= INITIAL_DETAIL_SLOT_COUNT ? "disabled" : ""}
        title="Quitar casilla"
      >
        X
      </button>
    </div>
  `).join("");
}

function renderCapturePanel(state, machine, turn) {
  if (!machine) {
    return `
      <div class="capture-form__section">
        <h3>Captura</h3>
        <p>Selecciona una maquina activa para continuar.</p>
      </div>
    `;
  }

  if (machine.tipo_captura === MACHINE_CAPTURE_TYPES.DETALLE) {
    return `
      <div class="capture-form">
        <section class="capture-form__section">
          <div class="capture-grid">
            <div class="capture-field">
              <label>Maquina</label>
              <input class="input" value="${escapeHtml(machine.nombre_maquina)}" readonly>
            </div>
            <div class="capture-field">
              <label>Turno</label>
              <input class="input" value="${escapeHtml(fmtTurnName(turn))}" readonly>
            </div>
          </div>
        </section>

        <section class="capture-form__section">
          <div class="capture-header">
            <h3>Produccion por turno</h3>
            <span class="badge badge--blue">${state.detailSlots.length} casillas</span>
          </div>
          <p>Las casillas vacias se ignoran al guardar.</p>
          <div class="detail-slots">${renderDetailSlotRows(state)}</div>
        </section>

        <section class="capture-form__section">
          <div class="capture-grid">
            <div class="capture-field">
              <label>Eficiencia (%)</label>
              <input
                class="input"
                type="number"
                min="0"
                max="100"
                step="0.01"
                placeholder="0"
                value="${escapeHtml(state.eficiencia)}"
                data-input="eficiencia"
              >
            </div>
            <div class="capture-field">
              <label>Observacion</label>
              <textarea class="textarea" data-input="observacion" placeholder="Opcional">${escapeHtml(state.observacion)}</textarea>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  return `
    <div class="capture-form">
      <section class="capture-form__section">
        <div class="capture-grid">
          <div class="capture-field">
            <label>Maquina</label>
            <input class="input" value="${escapeHtml(machine.nombre_maquina)}" readonly>
          </div>
          <div class="capture-field">
            <label>Turno</label>
            <input class="input" value="${escapeHtml(fmtTurnName(turn))}" readonly>
          </div>
        </div>
      </section>

      <section class="capture-form__section">
        <div class="capture-grid">
          <div class="capture-field">
            <label>Produccion (kg)</label>
            <input
              class="input"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value="${escapeHtml(state.directProduction)}"
              data-input="direct-production"
            >
          </div>
          <div class="capture-field">
            <label>Eficiencia (%)</label>
            <input
              class="input"
              type="number"
              min="0"
              max="100"
              step="0.01"
              placeholder="0"
              value="${escapeHtml(state.eficiencia)}"
              data-input="eficiencia"
            >
          </div>
        </div>
      </section>

      <section class="capture-form__section">
        <div class="capture-grid capture-grid--single">
          <div class="capture-field">
            <label>Observacion del turno</label>
            <textarea class="textarea" data-input="observacion" placeholder="Opcional">${escapeHtml(state.observacion)}</textarea>
          </div>
        </div>
      </section>
    </div>
  `;
}

export function renderApp() {
  const root = appRoot();
  if (!root) return;

  const state = getState();
  const machine = selectedMachineFrom(state);
  const turn = selectedTurnFrom(state);
  const submitFeedbackClass = state.submitFeedback.type === "success"
    ? "notice-card--success"
    : state.submitFeedback.type === "error"
      ? "notice-card--error"
      : "notice-card--info";

  root.innerHTML = `
    <main class="app-shell">
      <section class="hero">
        <div>
          <p class="eyebrow">Aplicacion de Registro</p>
          <h1>Formulario CONERAS</h1>
        </div>
      </section>

      ${state.notice ? `
        <section class="notice-card notice-card--info">
          <strong>Estado</strong>
          <div>${escapeHtml(state.notice)}</div>
        </section>
      ` : ""}

      ${state.submitFeedback.message ? `
        <section class="notice-card ${submitFeedbackClass}">
          <strong>${state.submitFeedback.type === "success" ? "Exito" : state.submitFeedback.type === "error" ? "Error" : "Resultado"}</strong>
          <div>${escapeHtml(state.submitFeedback.message)}</div>
        </section>
      ` : ""}

      ${state.error ? `
        <section class="notice-card notice-card--warning">
          <strong>Validacion</strong>
          <div>${escapeHtml(state.error)}</div>
        </section>
      ` : ""}

      <section class="workspace">
        <section class="panel">
          <div class="fields">
            <div class="field">
              <label for="workDate">Fecha operativa</label>
              <input class="input" id="workDate" type="date" value="${escapeHtml(state.selectedDate)}" data-input="date">
            </div>

            <div class="field">
              <label for="workMachine">Maquina</label>
              <select class="select" id="workMachine" data-input="machine">
                ${renderMachineOptions(state)}
              </select>
            </div>

            <div class="field">
              <label for="workTurn">Turno</label>
              <select class="select" id="workTurn" data-input="turn">
                ${renderTurnOptions(state)}
              </select>
            </div>
          </div>
        </section>

        <div class="capture-side">
          <section class="capture-card">
            <div class="capture-card__head">
              <div>
                <p class="eyebrow">Captura</p>
              </div>
              <span class="badge ${machine && machine.estado === MACHINE_STATUS.BLOQUEADO ? "badge--amber" : "badge--green"}">
                ${escapeHtml(machine ? machine.estado : "-")}
              </span>
            </div>

            <div class="capture-layout">
              ${renderCapturePanel(state, machine, turn)}
            </div>

            <div class="actions">
              <button class="btn btn--primary" type="button" data-action="save-and-validate" ${state.isSubmitting ? "disabled" : ""}>
                ${state.isSubmitting ? "Guardando..." : "Guardar y Validar"}
              </button>
              ${machine && machine.tipo_captura === MACHINE_CAPTURE_TYPES.DETALLE ? `
                <button class="btn btn--ghost" type="button" data-action="add-slot" ${state.isSubmitting ? "disabled" : ""}>Agregar casilla</button>
              ` : ""}
              <button class="btn" type="button" data-action="clear-form" ${state.isSubmitting ? "disabled" : ""}>Limpiar campos</button>
            </div>
          </section>
        </div>
      </section>
    </main>

    <div class="toast" id="toast" aria-live="polite"></div>
  `;
}

export function hideSyncLoadingOverlay() {
  const overlay = document.getElementById("syncLoadingOverlay");
  if (overlay) overlay.classList.add("hide");
}

export function showSyncLoadingOverlay() {
  const overlay = document.getElementById("syncLoadingOverlay");
  if (overlay) overlay.classList.remove("hide");
}

let toastTimer = null;

export function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("is-visible");

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2200);
}
