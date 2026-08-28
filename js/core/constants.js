import { MACHINE_CAPTURE_TYPES, MACHINE_STATUS } from "../domain/contracts.js";

export const INITIAL_DETAIL_SLOT_COUNT = 6;

export const FALLBACK_BOOTSTRAP = {
  catalogoMaquinas: [
    {
      id_maquina: "MURATA_1",
      nombre_maquina: "Murata 1",
      estado: MACHINE_STATUS.BLOQUEADO,
      tipo_captura: MACHINE_CAPTURE_TYPES.PENDIENTE
    },
    {
      id_maquina: "MURATA_2",
      nombre_maquina: "Murata 2",
      estado: MACHINE_STATUS.ACTIVO,
      tipo_captura: MACHINE_CAPTURE_TYPES.DETALLE
    },
    {
      id_maquina: "MURATA_3",
      nombre_maquina: "Murata 3",
      estado: MACHINE_STATUS.ACTIVO,
      tipo_captura: MACHINE_CAPTURE_TYPES.DIRECTO
    },
    {
      id_maquina: "MURATA_4",
      nombre_maquina: "Murata 4",
      estado: MACHINE_STATUS.ACTIVO,
      tipo_captura: MACHINE_CAPTURE_TYPES.DIRECTO
    }
  ],
  catalogoTurnos: [
    {
      id_turno: "MANANA",
      nombre: "Manana",
      hora_inicio: "07:00",
      hora_fin: "14:59",
      suma_dia: 0
    },
    {
      id_turno: "TARDE",
      nombre: "Tarde",
      hora_inicio: "15:00",
      hora_fin: "22:59",
      suma_dia: 0
    },
    {
      id_turno: "NOCHE",
      nombre: "Noche",
      hora_inicio: "23:00",
      hora_fin: "06:59",
      suma_dia: 1
    }
  ],
  registros: [],
  cambios: [],
  currentUser: "",
  sourceLabel: "Catalogo local"
};
