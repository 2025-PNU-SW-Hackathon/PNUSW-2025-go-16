// config/socket_hub.js
let ioInstance = null;

function setIO(io) {
  ioInstance = io;
}

function getIO() {
  if (!ioInstance) {
    throw new Error('Socket.io has not been initialized yet.');
  }
  return ioInstance;
}

module.exports = { setIO, getIO };