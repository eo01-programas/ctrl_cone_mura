export const DATA_SOURCE_TYPES = {
  BACKEND: "backend",
  FALLBACK: "fallback"
};

export const MACHINE_STATUS = {
  ACTIVO: "ACTIVO",
  BLOQUEADO: "BLOQUEADO"
};

export const MACHINE_CAPTURE_TYPES = {
  PENDIENTE: "PENDIENTE",
  DETALLE: "DETALLE",
  DIRECTO: "DIRECTO"
};

export const RECORD_TYPES = {
  PRODUCCION: "PRODUCCION",
  EFICIENCIA: "EFICIENCIA"
};

export const RECORD_STATUS = {
  ACTIVO: "ACTIVO",
  ELIMINADO: "ELIMINADO"
};

export const TURN_IDS = {
  MANANA: "MANANA",
  TARDE: "TARDE",
  NOCHE: "NOCHE",
  DIA: "DIA"
};

export const SHEET_NAMES = {
  CATALOGO: "CATALOGO",
  CATALOGO_TURNO: "CATALOGO_TURNO",
  CONERAS_REGISTROS: "CONERAS_REGISTROS",
  CONERAS_HISTORIAL_CAMBIOS: "CONERAS_HISTORIAL_CAMBIOS"
};

export const ENTITY_FIELDS = {
  catalogoMaquina: [
    "id_maquina",
    "nombre_maquina",
    "estado",
    "tipo_captura"
  ],
  catalogoTurno: [
    "id_turno",
    "nombre",
    "hora_inicio",
    "hora_fin",
    "suma_dia"
  ],
  conerasRegistro: [
    "id_registro",
    "id_maquina",
    "fecha_registrada",
    "id_turno",
    "produccion_kg",
    "eficiencia_pct",
    "observacion",
    "usuario_registro",
    "fecha_creacion",
    "tipo_registro",
    "estado_registro"
  ]
};
