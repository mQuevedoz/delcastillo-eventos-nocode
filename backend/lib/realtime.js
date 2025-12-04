// backend/lib/realtime.js
let ioInstance = null;

/**
 * setIO(io)
 * almacena la instancia de socket.io para poder emitir eventos desde otros módulos
 */
export function setIO(io) {
  ioInstance = io;
}

/**
 * emitEvent(nombre, data)
 * Emite un evento a todos los sockets conectados. Si io no está inicializado,
 * muestra un warning en consola para debug
 */
export function emitEvent(event, data) {
  if (!ioInstance) {
    console.warn("[realtime] emitEvent llamado antes de inicializar io");
    return;
  }
  ioInstance.emit(event, data);
}