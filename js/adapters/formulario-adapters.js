import {
  ENTITY_FIELDS,
  MACHINE_CAPTURE_TYPES,
  MACHINE_STATUS,
  RECORD_STATUS,
  RECORD_TYPES
} from "../domain/contracts.js";

function pickFields(raw, fieldList) {
  return fieldList.reduce((acc, field) => {
    acc[field] = raw && field in raw ? raw[field] : "";
    return acc;
  }, {});
}

function toNumberOrNull(rawValue) {
  if (rawValue === "" || rawValue == null) return null;
  const value = Number(rawValue);
  return Number.isFinite(value) ? value : null;
}

function normalizeMachine(raw) {
  const source = pickFields(raw, ENTITY_FIELDS.catalogoMaquina);
  return {
    id_maquina: String(source.id_maquina || "").trim(),
    nombre_maquina: String(source.nombre_maquina || "").trim(),
    estado: String(source.estado || MACHINE_STATUS.ACTIVO).trim(),
    tipo_captura: String(source.tipo_captura || "").trim()
  };
}

function normalizeTurn(raw) {
  const source = pickFields(raw, ENTITY_FIELDS.catalogoTurno);
  return {
    id_turno: String(source.id_turno || "").trim(),
    nombre: String(source.nombre || "").trim(),
    hora_inicio: String(source.hora_inicio || "-").trim(),
    hora_fin: String(source.hora_fin || "-").trim(),
    suma_dia: Number(source.suma_dia || 0)
  };
}

export function normalizeBootstrapPayload(raw) {
  const payload = raw || {};
  return {
    catalogoMaquinas: Array.isArray(payload.catalogoMaquinas) ? payload.catalogoMaquinas.map(normalizeMachine) : [],
    catalogoTurnos: Array.isArray(payload.catalogoTurnos) ? payload.catalogoTurnos.map(normalizeTurn) : [],
    registros: Array.isArray(payload.registros) ? payload.registros : [],
    cambios: Array.isArray(payload.cambios) ? payload.cambios : [],
    currentUser: String(payload.currentUser || "").trim(),
    sourceLabel: String(payload.sourceLabel || "").trim()
  };
}

export function buildSubmissionDraft({ machine, turn, date, detailSlots, directProduction, eficiencia, observacion, usuario }) {
  if (!machine || !machine.id_maquina) throw new Error("Selecciona una maquina valida.");
  if (machine.estado === MACHINE_STATUS.BLOQUEADO) throw new Error("La maquina seleccionada esta bloqueada.");
  if (!turn || !turn.id_turno) throw new Error("Selecciona un turno valido.");
  if (!date) throw new Error("La fecha es obligatoria.");

  const eficienciaValue = toNumberOrNull(eficiencia);
  if (eficienciaValue == null || eficienciaValue < 0 || eficienciaValue > 100) {
    throw new Error("La eficiencia debe estar entre 0 y 100.");
  }

  const commonFields = {
    id_registro: "",
    id_maquina: machine.id_maquina,
    fecha_registrada: date,
    id_turno: turn.id_turno,
    observacion: String(observacion || "").trim(),
    usuario_registro: String(usuario || "").trim(),
    fecha_creacion: "",
    estado_registro: RECORD_STATUS.ACTIVO
  };

  let productionValues = [];

  if (machine.tipo_captura === MACHINE_CAPTURE_TYPES.DETALLE) {
    // La produccion puede ser 0 (maquina en mantenimiento ese turno). Las
    // casillas vacias siguen cayendo en null y se ignoran; un 0 escrito se
    // guarda como registro real. Negativo se descarta (input ya tiene min=0).
    productionValues = (detailSlots || [])
      .map(toNumberOrNull)
      .filter((value) => value != null && value >= 0);

    if (!productionValues.length) {
      throw new Error(`Ingresa al menos una produccion valida para ${machine.nombre_maquina}.`);
    }
  } else if (machine.tipo_captura === MACHINE_CAPTURE_TYPES.DIRECTO) {
    const directValue = toNumberOrNull(directProduction);
    if (directValue == null) {
      throw new Error("Ingresa una produccion valida para la maquina seleccionada.");
    }
    if (directValue < 0) {
      throw new Error("La produccion no puede ser negativa.");
    }
    productionValues = [directValue];
  } else {
    throw new Error("La maquina seleccionada aun no tiene captura habilitada.");
  }

  const productionRecords = productionValues.map((produccion_kg) => ({
    ...commonFields,
    produccion_kg,
    eficiencia_pct: null,
    tipo_registro: RECORD_TYPES.PRODUCCION
  }));

  const efficiencyRecord = {
    ...commonFields,
    produccion_kg: null,
    eficiencia_pct: eficienciaValue,
    tipo_registro: RECORD_TYPES.EFICIENCIA
  };

  const records = [...productionRecords, efficiencyRecord];

  return {
    records,
    summary: {
      machineName: machine.nombre_maquina,
      captureType: machine.tipo_captura,
      turnName: turn.nombre,
      date,
      productionCount: productionRecords.length,
      efficiencyCount: 1,
      totalRecords: records.length,
      productionTotal: productionRecords.reduce((acc, item) => acc + Number(item.produccion_kg || 0), 0),
      eficiencia: eficienciaValue
    }
  };
}
