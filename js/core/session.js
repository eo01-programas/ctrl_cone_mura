import { FORMULARIO_RUNTIME_CONFIG } from "./config.js";

export function resolveCurrentUser(rawCurrentUser = "") {
  return String(rawCurrentUser || FORMULARIO_RUNTIME_CONFIG.userFallback).trim();
}
