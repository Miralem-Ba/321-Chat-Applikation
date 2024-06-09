const WebSocket = require("ws");
const { executeSQL } = require("./database");
const jwt = require('jsonwebtoken');
const secretKey = 'your_secret_key';  // Setze hier deinen geheimen Schlüssel

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
  websockets.push(ws);

  ws.on("message", (message) => onMessage(ws, message));
  ws.on("close", () => onClose(ws));

  // Sende die aktuellen Nachrichten an den neuen Client
  sendAllMessages(ws);
};

// Funktion, die aufgerufen wird, wenn eine Nachricht empfangen wird
const onMessage = async (ws, message) => {
  const messageData = JSON.parse(message);

  if (messageData.type === "register") {
    const { username, password } = messageData;
    await registerUser(username, password);
    ws.send(JSON.stringify({ type: "register_success" }));
  } else if (messageData.type === "login") {
    const { username, password } = messageData;
    try {
      const { token } = await authenticateUser(username, password);
      ws.send(JSON.stringify({ type: "login_success", token }));
      sendAllMessages(ws);
    } catch (error) {
      ws.send(JSON.stringify({ type: "login_failure", message: error.message }));
    }
  } else if (messageData.type === "message") {
    const { token, text, timestamp } = messageData;
    try {
      const decoded = jwt.verify(token, secretKey);
      const userId = decoded.id;
      await receiveChat(text, userId, timestamp);
      sendAllMessages();
    } catch (error) {
      ws.send(JSON.stringify({ type: "auth_error", message: "Invalid token" }));
    }
  }
};

// Funktion zur Benutzerregistrierung
const registerUser = async (username, password) => {
  const query = `INSERT INTO users (name, password) VALUES ("${username}", "${password}")`;
  await executeSQL(query);
};

// Funktion zur Benutzerauthentifizierung
const authenticateUser = async (username, password) => {
  const query = `SELECT id FROM users WHERE name = "${username}" AND password = "${password}"`;
  const result = await executeSQL(query);
  if (result.length > 0) {
    const token = jwt.sign({ id: result[0].id }, secretKey, { expiresIn: '1h' });
    return { token };
  } else {
    throw new Error("Authentication failed");
  }
};

// Funktion, die aufgerufen wird, wenn eine WebSocket-Verbindung geschlossen wird
const onClose = async (ws) => {
  websockets = websockets.filter((client) => client !== ws);
};

// Funktion zum Laden der Nachrichten aus der Datenbank
const loadMessages = async () => {
  const messageDb = await executeSQL("SELECT * FROM messages;");
  if (!messageDb) {
    throw new Error("Failed to load messages from the database.");
  }
  const userIDs = messageDb.map(entry => entry.user_id);

  const getUsersWithID = async (userID) => {
    const user = await executeSQL(`SELECT name FROM users WHERE id = ${userID}`);
    return { name: user[0].name };
  }

  const userDb = await Promise.all(userIDs.map(getUsersWithID));

  const combine = (firstArray, secondArray) => {
    const combinedArray = [];
    for (let i = 0; i < firstArray.length; i++) {
      const combineEntry = { name: firstArray[i].name, message: secondArray[i].message, timestamp: secondArray[i].timestamp };
      combinedArray.push(combineEntry);
    }
    return combinedArray;
  };

  const fullMessageDatas = combine(userDb, messageDb);
  return fullMessageDatas;
};

// Funktion zum Verarbeiten und Speichern empfangener Chat-Nachrichten in der Datenbank
const receiveChat = async (messageInput, userId, timeStampInput) => {
  const query = `INSERT INTO messages (user_id, message, timestamp) VALUES (${userId}, "${messageInput}", "${timeStampInput}")`;
  await executeSQL(query);
}

// Funktion zum Senden aller Nachrichten an alle verbundenen Clients
const sendAllMessages = async (ws = null) => {
  const messageDatas = await loadMessages();
  const wsMessage = JSON.stringify({
    type: "messagesData",
    message: JSON.stringify(messageDatas),
    users: websockets.map(ws => ({ username: ws.username }))
  });

  if (ws) {
    ws.send(wsMessage);
  } else {
    websockets.forEach((client) => {
      client.send(wsMessage);
    });
  }
}

// Exportieren der Funktion zur Initialisierung des WebSocket-Servers
module.exports = { initializeWebsocketServer };
