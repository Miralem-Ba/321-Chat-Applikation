// Verbindung zum WebSocket-Server herstellen
const socket = new WebSocket("ws://localhost:3000");

// Event-Listener für den Verbindungsaufbau
socket.addEventListener("open", (event) => {
    console.log("WebSocket connected!222222222222222");
    socket.send(JSON.stringify("Hello, server!")); // Nachricht an den Server senden, sobald die Verbindung hergestellt ist
  });

// Event-Listener für das Schließen der Verbindung
socket.addEventListener("close", (event) => {
  console.log("WebSocket closed.");
});

// Event-Listener für WebSocket-Fehler
socket.addEventListener("error", (event) => {
  console.error("WebSocket error:", event);
});

// Event-Listener für eingehende Nachrichten vom Server
socket.addEventListener("message", (event) => {

    // Die empfangenen Daten werden geparst
    const data = JSON.parse(event.data);
    const messagedatasWsOutput = data[0].message;
    const messageDatas = JSON.parse(messagedatasWsOutput)
    const messages = messageDatas
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chatwindow');
    const userBox = document.getElementById('users')
    const userdatadatasWsOutput = data[0].users;
    
    // Schleife durch die Nachrichten und Hinzufügen zum Chat-Fenster
    for (let i = 0; i < messages.length; i++) {
    
        const message = (messages[i].message)
        const name = (messages[i].name)
        const timestamp = (messages[i].timestamp)
    
        // HTML-Struktur für jede Nachricht im Chat-Fenster
        const chatBoxElement = 
        `<div id="chatbox" class="w-5/12 h-fit bg-indigo-100 rounded-lg">
            <span class="text-xl font-bold">${name}</span> 
            <div class="border-t border-gray-500 my-1"></div> 
            <p class="">${message}</p>
            <div class="border-t border-gray-500 my-1"></div> 
            <span class="text-xs text-left underline-offset-1">${timestamp}</span>
        </div>`;

        // Nachricht zum Chat-Fenster hinzufügen
        chatBox.innerHTML += chatBoxElement;
    }

    // Schleife durch die Benutzer und Hinzufügen zur Benutzerliste
    let usersInput = '';
    for (let i = 0; i < userdatadatasWsOutput.length; i++) {
      const username = userdatadatasWsOutput[i].username;

      // HTML-Struktur für jeden Benutzer in der Benutzerliste
      const userElement = 
        `<div class="user-item rounded-lg">
          <span class="text-lg font-bold">${username}</span>
        </div>`;

      // Benutzer zur Benutzerliste hinzufügen
      usersInput = `${usersInput}${userElement}`;
      userBox.innerHTML = usersInput
    }
    
    // Scroll das Chat-Fenster nach unten
    chatBox.scrollTop = chatBox.scrollHeight;
})

// Funktion zum Auswählen eines Benutzers und Senden der Benutzerdaten über WebSocket
const selectUser = async () => {

  // Zugriff auf das Eingabefeld für den Benutzernamen im DOM
  const userInput = document.getElementById('user-input');

  // Abrufen des Benutzernamens aus dem Eingabefeld
  const username = userInput.value;

  // Erstellen eines Objekts mit den Benutzerdaten
  const userData = {
      username: username
  };

  // Erstellen einer Nachricht im JSON-Format, die die Benutzerdaten enthält
  const wsUser = JSON.stringify([
      {
        type: "sendUserData", // Der Typ der Nachricht, der angibt, dass Benutzerdaten gesendet werden
        message: JSON.stringify(userData) // Die Benutzerdaten selbst, als JSON-String
      }
    ])

    // Senden der Nachricht über die WebSocket-Verbindung
    socket.send(wsUser) 
};

//Funktion zum Erstellen einer neuen Chat-Nachricht und Senden dieser Nachricht über WebSocket
const newChatBox = async () => {

  // Zugriff auf das Chat-Fenster und die Eingabefelder für Nachricht und Benutzername im DOM
  const chatBox = document.getElementById('chatwindow');
  const msgInput = document.getElementById('message-input');
  const userInput = document.getElementById('user-input');

  // Abrufen des Benutzernamens und der Nachricht aus den Eingabefeldern
  const username = userInput.value;
  const message = msgInput.value;

  // Erstellen eines Zeitstempels für die Nachricht
  const timeStamp = new Date().toLocaleDateString("de-CH", {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });

  // Erstellen eines Objekts mit den Chat-Daten
  const chatData = {
      username: username,
      message: message,
      timeStamp: timeStamp 
  };

  // HTML-Struktur für die neue Nachricht im Chat-Fenster
  const chatBoxElement = 
      `<div id="chatboxUser" class="w-5/12 h-fit bg-indigo-100 rounded-lg outline">
          <span class="text-xl font-bold">${username}</span> 
          <div class="border-t border-gray-500 my-1"></div> 
          <p class="">${message}</p>
          <div class="border-t border-gray-500 my-1"></div> 
          <span class="text-xs text-left underline-offset-1">${timeStamp}</span>
      </div>`;

  // Hinzufügen der neuen Nachricht zum Chat-Fenster
  chatBox.innerHTML += chatBoxElement;

  // Scroll das Chat-Fenster nach unten, um die neueste Nachricht anzuzeigen
  chatBox.scrollTop = chatBox.scrollHeight;

  
  // Erstellen der WebSocket-Nachricht im JSON-Format, die die Chat-Daten enthält
  const wsMessage = JSON.stringify([
    {
      type: "sendChatData", // Der Typ der Nachricht, der angibt, dass Chat-Daten gesendet werden
      message: JSON.stringify(chatData) // Die Chat-Daten selbst, als JSON-String
    }
  ])

  // Senden der Nachricht über die WebSocket-Verbindung
  socket.send(wsMessage)    
};


// Event-Listener für das Laden des Dokuments
document.addEventListener("DOMContentLoaded", () => {
    console.log("1111111")

    // Event-Listener für den "Senden"-Button
    document.getElementById('sendButton').addEventListener('click', function () {
        newChatBox();
    });

    // Event-Listener für den "Benutzer auswählen"-Button
    document.getElementById('selectUser').addEventListener('click', function () {
        selectUser();
    });
});