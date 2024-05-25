// Verbindung zum WebSocket-Server herstellen
const socket = new WebSocket("ws://localhost:3000");

// Event-Listener für den Verbindungsaufbau
socket.addEventListener("open", (event) => {
    console.log("WebSocket connected!");
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
    const data = JSON.parse(event.data);
    const messagedatasWsOutput = data[0].message;
    const messageDatas = JSON.parse(messagedatasWsOutput)
    const messages = messageDatas
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chatwindow');
    const userBox = document.getElementById('users')
    const userdatadatasWsOutput = data[0].users;
    
    for (let i = 0; i < messages.length; i++) {
        const message = messages[i].message;
        const name = messages[i].name;
        const timestamp = messages[i].timestamp;
    
        const chatBoxElement = 
        `<div class="w-full bg-indigo-100 rounded-lg p-2 mb-2">
            <span class="text-xl font-bold">${name}</span> 
            <div class="border-t border-gray-500 my-1"></div> 
            <p>${message}</p>
            <div class="border-t border-gray-500 my-1"></div> 
            <span class="text-xs text-left underline-offset-1">${timestamp}</span>
        </div>`;

        chatBox.innerHTML += chatBoxElement;
    }

    let usersInput = '';
    for (let i = 0; i < userdatadatasWsOutput.length; i++) {
        const username = userdatadatasWsOutput[i].username;

        const userElement = 
        `<div class="user-item bg-gray-300 p-2 mb-1">
            <span class="text-lg font-bold">${username}</span>
        </div>`;

        usersInput = `${usersInput}${userElement}`;
        userBox.innerHTML = usersInput;
    }
    
    chatBox.scrollTop = chatBox.scrollHeight;
});

// Funktion zum Auswählen eines Benutzers und Senden der Benutzerdaten über WebSocket
const selectUser = async () => {
    const userInput = document.getElementById('user-input');
    const username = userInput.value;

    const userData = {
        username: username
    };

    const wsUser = JSON.stringify([
        {
            type: "sendUserData",
            message: JSON.stringify(userData)
        }
    ]);

    socket.send(wsUser);
};

// Funktion zum Erstellen einer neuen Chat-Nachricht und Senden dieser Nachricht über WebSocket
const newChatBox = async () => {
    const chatBox = document.getElementById('chatwindow');
    const msgInput = document.getElementById('message-input');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('sendButton');

    // Button deaktivieren
    sendButton.disabled = true;

    const username = userInput.value;
    const message = msgInput.value;

    const timeStamp = new Date().toLocaleDateString("de-CH", {
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
    });

    const chatData = {
        username: username,
        message: message,
        timeStamp: timeStamp 
    };

    const chatBoxElement = 
        `<div class="w-full bg-indigo-100 rounded-lg p-2 mb-2">
            <span class="text-xl font-bold">${username}</span> 
            <div class="border-t border-gray-500 my-1"></div> 
            <p>${message}</p>
            <div class="border-t border-gray-500 my-1"></div> 
            <span class="text-xs text-left underline-offset-1">${timeStamp}</span>
        </div>`;

    chatBox.innerHTML += chatBoxElement;
    chatBox.scrollTop = chatBox.scrollHeight;

    const wsMessage = JSON.stringify([
        {
            type: "sendChatData",
            message: JSON.stringify(chatData)
        }
    ]);

    socket.send(wsMessage);

    // Button nach dem Senden wieder aktivieren
    sendButton.disabled = false;
};

// Event-Listener für das Laden des Dokuments
document.addEventListener("DOMContentLoaded", () => {
    console.log("Document loaded");

    document.getElementById('sendButton').addEventListener('click', function () {
        newChatBox();
    });

    document.getElementById('selectUser').addEventListener('click', function () {
        selectUser();
    });
});
