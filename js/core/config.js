import { DATA_SOURCE_TYPES, SHEET_NAMES } from "../domain/contracts.js";
import { INITIAL_DETAIL_SLOT_COUNT } from "./constants.js";

export const FORMULARIO_RUNTIME_CONFIG = {
  dataSource: DATA_SOURCE_TYPES.BACKEND,
  userFallback: "usuario_demo",
  backend: {
    enabled: true,
    baseUrl: "https://script.google.com/macros/s/AKfycbyI86pG-Sj2TCj89rXuthN1_cG4W7CuStU6NzL_yLo4-qj3a924Yl_i8HZKDES78nOh/exec",
    token: "",
    timeoutMs: 20000
  },
  sheets: { ...SHEET_NAMES },
  ui: {
    initialDetailSlotCount: INITIAL_DETAIL_SLOT_COUNT
  }
};
