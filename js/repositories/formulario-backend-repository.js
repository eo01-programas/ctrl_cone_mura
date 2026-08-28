import { FORMULARIO_RUNTIME_CONFIG } from "../core/config.js";

function notConfiguredError() {
  return new Error("Backend del Formulario CONERAS no configurado.");
}

async function callBackend_(action, { method = "GET", body } = {}) {
  const backend = FORMULARIO_RUNTIME_CONFIG.backend;
  if (!backend.enabled || !backend.baseUrl) throw notConfiguredError();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), backend.timeoutMs || 20000);

  try {
    let url = backend.baseUrl;
    const options = { method, signal: controller.signal };

    if (method === "GET") {
      const params = new URLSearchParams({ action });
      if (backend.token) params.set("token", backend.token);
      url = `${backend.baseUrl}?${params.toString()}`;
    } else {
      const payload = { action, token: backend.token || undefined, ...body };
      options.body = JSON.stringify(payload);
    }

    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`Formulario backend respondio ${response.status}.`);
    const json = await response.json();
    if (!json.ok) throw new Error((json.error && json.error.message) || "El backend devolvio un error.");
    return json;
  } finally {
    clearTimeout(timer);
  }
}

function buildCreationChange(record) {
  const field = record.tipo_registro === "PRODUCCION" ? "produccion_kg" : "eficiencia_pct";
  const value = record.tipo_registro === "PRODUCCION" ? record.produccion_kg : record.eficiencia_pct;

  return {
    id_cambio: "",
    id_registro: record.id_registro || "",
    id_maquina: record.id_maquina,
    fecha_registrada: record.fecha_registrada,
    accion: "CREAR",
    campo_modificado: field,
    valor_anterior: "",
    valor_nuevo: value == null ? "" : String(value),
    usuario_cambio: record.usuario_registro || "",
    fecha_cambio: "",
    motivo: record.observacion || ""
  };
}

function buildEfficiencyEditChange(previousRecord, nextRecord) {
  return {
    id_cambio: "",
    id_registro: nextRecord.id_registro || "",
    id_maquina: nextRecord.id_maquina,
    fecha_registrada: nextRecord.fecha_registrada,
    accion: "EDITAR",
    campo_modificado: "eficiencia_pct",
    valor_anterior: previousRecord && previousRecord.eficiencia_pct != null ? String(previousRecord.eficiencia_pct) : "",
    valor_nuevo: nextRecord.eficiencia_pct != null ? String(nextRecord.eficiencia_pct) : "",
    usuario_cambio: nextRecord.usuario_registro || "",
    fecha_cambio: "",
    motivo: nextRecord.observacion || ""
  };
}

function findExistingEfficiency(records, efficiencyRecord) {
  return (records || []).find((record) => (
    record.id_maquina === efficiencyRecord.id_maquina &&
    record.fecha_registrada === efficiencyRecord.fecha_registrada &&
    record.id_turno === efficiencyRecord.id_turno &&
    record.tipo_registro === "EFICIENCIA" &&
    record.estado_registro !== "ELIMINADO"
  )) || null;
}

async function appendChanges_(changes) {
  if (!changes.length) return [];
  const json = await callBackend_("coneras_appendCambios", {
    method: "POST",
    body: { changes }
  });
  return json.changes || [];
}

async function upsertRecord_(record) {
  const json = await callBackend_("coneras_upsertRegistro", {
    method: "POST",
    body: { record }
  });
  return json.record;
}

async function submitCaptureWithPublishedBackend_(submissionPayload) {
  const bootstrap = await loadBootstrapData();
  const records = Array.isArray(submissionPayload.records) ? submissionPayload.records : [];
  const productionRecords = records.filter((record) => record.tipo_registro === "PRODUCCION");
  const efficiencyRecord = records.find((record) => record.tipo_registro === "EFICIENCIA") || null;

  if (!efficiencyRecord) {
    throw new Error("No se encontro la eficiencia del turno para guardar.");
  }

  const machine = (bootstrap.catalogoMaquinas || []).find((item) => item.id_maquina === efficiencyRecord.id_maquina) || null;
  const turn = (bootstrap.catalogoTurnos || []).find((item) => item.id_turno === efficiencyRecord.id_turno) || null;
  const existingEfficiency = findExistingEfficiency(bootstrap.registros, efficiencyRecord);

  const savedRecords = [];
  const changes = [];
  let insertedCount = 0;
  let updatedCount = 0;

  for (const productionRecord of productionRecords) {
    const savedRecord = await upsertRecord_(productionRecord);
    savedRecords.push(savedRecord);
    changes.push(buildCreationChange(savedRecord));
    insertedCount += 1;
  }

  const efficiencyToSave = existingEfficiency
    ? {
        ...efficiencyRecord,
        id_registro: existingEfficiency.id_registro,
        fecha_creacion: existingEfficiency.fecha_creacion || ""
      }
    : efficiencyRecord;

  const savedEfficiency = await upsertRecord_(efficiencyToSave);
  savedRecords.push(savedEfficiency);

  if (existingEfficiency) {
    changes.push(buildEfficiencyEditChange(existingEfficiency, savedEfficiency));
    updatedCount += 1;
  } else {
    changes.push(buildCreationChange(savedEfficiency));
    insertedCount += 1;
  }

  await appendChanges_(changes);

  return {
    machineId: machine ? machine.id_maquina : efficiencyRecord.id_maquina,
    machineName: machine ? machine.nombre_maquina : (submissionPayload.summary && submissionPayload.summary.machineName) || efficiencyRecord.id_maquina,
    turnId: turn ? turn.id_turno : efficiencyRecord.id_turno,
    turnName: turn ? turn.nombre : (submissionPayload.summary && submissionPayload.summary.turnName) || efficiencyRecord.id_turno,
    date: efficiencyRecord.fecha_registrada,
    insertedCount,
    updatedCount,
    savedRecords
  };
}

export async function loadBootstrapData() {
  const json = await callBackend_("coneras_bootstrap", { method: "GET" });
  if (!json.coneras) {
    throw new Error("El backend respondio sin el bloque CONERAS.");
  }
  return json.coneras;
}

export async function submitCapture(submissionPayload) {
  try {
    const json = await callBackend_("coneras_submitFormulario", {
      method: "POST",
      body: { capture: submissionPayload }
    });

    return json.submission || null;
  } catch (error) {
    if (String(error.message || "").includes("Unsupported action: coneras_submitFormulario")) {
      return submitCaptureWithPublishedBackend_(submissionPayload);
    }
    throw error;
  }
}
