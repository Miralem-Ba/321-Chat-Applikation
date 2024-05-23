// Importieren des WebSocket-Moduls und der executeSQL-Funktion aus der Datenbank-Datei
const WebSocket = require("ws");
const { executeSQL } = require("./database");

// Initialisierung des WebSocket-Servers
const initializeWebsocketServer = (server) => {
  const websocketServer = new WebSocket.Server({ server });
  websocketServer.on("connection", onConnection);
};

// Array, um alle WebSocket-Verbindungen zu speichern
let websockets = [];

// Funktion, die aufgerufen wird, wenn eine neue WebSocket-Verbindung hergestellt wird
const onConnection = (ws) => {
  console.log("Neue WebSocket-Verbindung");
  // Event-Listener für eingehende Nachrichten
  ws.on("message", (message) => onMessage(ws, message));
  // Event-Listener für das Schließen der Verbindung
  ws.on("close", () => onClose(ws))
};


const onMessage = (ws, messageBuffer) => {
  const messageString = messageBuffer.toString();
  const message = JSON.parse(messageString);
  console.log("Received message: " + messageString);
  // The message type is checked and the appropriate action is taken
  switch (message.type) {
    case "user": {
      clients.push({ ws, user: message.user });
      const usersMessage = {
        type: "users",
        users: clients.map((client) => client.user),
      };
      clients.forEach((client) => {
        client.ws.send(JSON.stringify(usersMessage));
      });
      ws.on("close", () => onDisconnect(ws));
      break;
    }
    case "message": {
      clients.forEach((client) => {
        client.ws.send(messageString);
      });
      break;
    }
    default: {
      console.log("Unknown message type: " + message.type);
    }
  }
};


const onDisconnect = (ws) => {
  const index = clients.findIndex((client) => client.ws === ws);
  clients.splice(index, 1);
  const usersMessage = {
    type: "users",
    users: clients.map((client) => client.user),
  };
  clients.forEach((client) => {
    client.ws.send(JSON.stringify(usersMessage));
  });
};

module.exports = { initializeWebsocketServer };
