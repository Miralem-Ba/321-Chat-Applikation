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

// Funktion, die aufgerufen wird, wenn eine Nachricht empfangen wird
const onMessage = async (ws, message) => {
  const getMessagEntry = JSON.parse(message);
  if (getMessagEntry[0].type === "sendChatData") {
    const newMessageEntry = JSON.parse(getMessagEntry[0].message);
    const messageOutput = newMessageEntry.message;
    const usernameOutput = newMessageEntry.username;
    const timeStampOutput = newMessageEntry.timeStamp;
    await receiveChat(messageOutput, usernameOutput, timeStampOutput);
  }
  else if (getMessagEntry[0].type === "sendUserData") {
    const newMessageEntry = JSON.parse(getMessagEntry[0].message);
    const usernameOutput = newMessageEntry.username;

    for (let i = 0; i < websockets.length; i++) {
      if (ws === websockets[i].websocket) {
        websockets[i].username = usernameOutput;
      }
      console.log(websockets[i].username)
    }
    await receiveUser(usernameOutput);
  }

  else if (getMessagEntry === "Hello, server!") {
    const clientData = {
      websocket: ws,
      username: ""
    }

    websockets.push(clientData);
    console.log(websockets.length)
  }
  
  // Laden der aktuellen Nachrichten aus der Datenbank
  const messageDatas = await loadMessages();
  const wsMessage = JSON.stringify([
    {
      type: "messagesData",
      message: JSON.stringify(messageDatas),
      users: websockets
    },
  ]);
  
  // Senden der Nachrichten und Benutzerliste an alle verbundenen Clients
  for (let i = 0; i < websockets.length; i++) {
    websockets[i].websocket.send(wsMessage)
  }
};

// Funktion, die aufgerufen wird, wenn eine WebSocket-Verbindung geschlossen wird
const onClose = async (ws) => {
  // Entfernen der geschlossenen Verbindung aus dem Array
  websockets = websockets.filter((entry) => entry.websocket !== ws);

  // Laden der aktuellen Nachrichten aus der Datenbank
  const messageDatas = await loadMessages();
  const wsMessage = JSON.stringify([
    {
      type: "messagesData",
      message: JSON.stringify(messageDatas),
      users: websockets
    },
  ]);
  
  // Senden der Nachrichten und Benutzerliste an alle verbundenen Clients
  for (let i = 0; i < websockets.length; i++) {
    websockets[i].websocket.send(wsMessage)
  }
}

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
