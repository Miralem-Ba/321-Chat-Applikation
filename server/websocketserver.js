// Importieren des WebSocket-Moduls und der executeSQL-Funktion aus der Datenbank-Datei
const WebSocket = require("ws");
const { executeSQL } = require("./database");

const clients = [];

const initializeWebsocketServer = (server) => {
  const websocketServer = new WebSocket.Server({ server });
  websocketServer.on("connection", onConnection);
};


const onConnection = (ws) => {
  console.log("New websocket connection");
  ws.on("message", (message) => onMessage(ws, message));
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
