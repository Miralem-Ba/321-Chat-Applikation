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

// Funktion zum Laden der Nachrichten aus der Datenbank
const loadMessages = async() => {
  const messageDb = await executeSQL("SELECT * FROM messages;");
  const userIDs = messageDb.map(entry => entry.user_id);

  // Funktion zum Abrufen des Benutzernamens basierend auf der Benutzer-ID
  const getUsersWithID = async(userID) => {
    const user = await executeSQL(`SELECT name FROM users WHERE id = ${userID}`);
    return { name: user[0].name };
  }

  const userDb = await Promise.all(userIDs.map(getUsersWithID));

  // Funktion zum Kombinieren von Nachrichten und Benutzern
  const combinate = (firstArray, secondArray) => {
    const combinedArray = [];

    for (let i = 0; i < firstArray.length; i++) {
      const combinateEntry = { name: firstArray[i].name, message: secondArray[i].message, timestamp: secondArray[i].timestamp };
      combinedArray.push(combinateEntry);
    }

    return combinedArray;
  };

  const fullMesageDatas2 = combinate(userDb, messageDb)
  return(fullMesageDatas2);
}

// Funktion zum Verarbeiten und Speichern empfangener Chat-Nachrichten in der Datenbank
const receiveChat = async (messageInput, usernameInput, timeStampInput) => {
  const message = messageInput
  const username = usernameInput
  const timeStamp = timeStampInput
  const userIdResult = await executeSQL(`SELECT id FROM users WHERE name = '${username}'`);

  if (userIdResult && userIdResult.length > 0) {
    userId = userIdResult[0].id;
  } else {
    userId = 17; // Standardbenutzer-ID, falls Benutzer nicht gefunden wird
  }

  // Bedingte Nachrichtenverarbeitung und Speichern in der Datenbank
  if (message === "smile") {
    const newMessage = "(＾◡＾)"
    const query = `INSERT INTO messages (user_id, message, timestamp) VALUES (${userId}, "${newMessage}", "${timeStamp}")`;
    await executeSQL(query);
  }

  else if (message === "wizard") {
    const newMessage = "(∩^o^)⊃━☆"
    const query = `INSERT INTO messages (user_id, message, timestamp) VALUES (${userId}, "${newMessage}", "${timeStamp}")`;
    await executeSQL(query);
  }

  else if (message === "") {
    const newMessage = "--This user was too stupid for a message--\n--LG KIM--"
    const query = `INSERT INTO messages (user_id, message, timestamp) VALUES (${userId}, "${newMessage}", "${timeStamp}")`;
    await executeSQL(query);
    const query2 = `INSERT INTO messages (user_id, message, timestamp) VALUES (21, "Hahahahahahahahahaha", "${timeStamp}")`;
    await executeSQL(query2);
  }

  else {
    const query = `INSERT INTO messages (user_id, message, timestamp) VALUES (${userId}, "${message}", "${timeStamp}")`;
    await executeSQL(query);
  }
}

// Funktion zum Verarbeiten und Speichern empfangener Benutzerdaten in der Datenbank
const receiveUser = async (usernameInput) => {
  const username = usernameInput
  const query = `INSERT INTO users (name) VALUES ("${username}")`;
  await executeSQL(query);
}

// Exportieren der Funktion zur Initialisierung des WebSocket-Servers
module.exports = { initializeWebsocketServer };