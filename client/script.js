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