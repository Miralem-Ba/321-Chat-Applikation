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
    if (data.type === "messagesData") {
        const messages = JSON.parse(data.message);
        const chatBox = document.getElementById('chatwindow');
        chatBox.innerHTML = ''; // Clear chat window
        messages.forEach(messageData => {
            const chatBoxElement = 
            `<div class="w-full bg-indigo-100 rounded-lg p-2 mb-2">
                <span class="text-xl font-bold">${messageData.name}</span> 
                <div class="border-t border-gray-500 my-1"></div> 
                <p>${messageData.message}</p>
                <div class="border-t border-gray-500 my-1"></div> 
                <span class="text-xs text-left underline-offset-1">${messageData.timestamp}</span>
            </div>`;
            chatBox.innerHTML += chatBoxElement;
        });

        chatBox.scrollTop = chatBox.scrollHeight;
    } else if (data.type === "userList") {
        const users = data.users;
        const userBox = document.getElementById('users');
        userBox.innerHTML = ''; // Clear user list
        users.forEach(user => {
            if (user.username) {
                const userElement = 
                `<div class="user-item bg-gray-300 p-2 mb-1">
                    <span class="text-lg font-bold">${user.username}</span>
                </div>`;
                userBox.innerHTML += userElement;
            }
        });
    } else if (data.type === "login_success") {
        sessionStorage.setItem('token', data.token);
        alert('Login erfolgreich!');
        window.location.href = 'index.html';
    } else if (data.type === "login_failure") {
        alert('Login fehlgeschlagen: ' + data.message);
    } else if (data.type === "register_success") {
        alert('Registrierung erfolgreich!');
        window.location.href = 'login.html';
    } else if (data.type === "auth_error") {
        alert('Authentifizierungsfehler: ' + data.message);
    }
});

// Funktion zum Erstellen einer neuen Chat-Nachricht und Senden dieser Nachricht über WebSocket
const newChatBox = async () => {
    const chatBox = document.getElementById('chatwindow');
    const msgInput = document.getElementById('message-input');
    const sendButton = document.getElementById('sendButton');

    // Button deaktivieren
    sendButton.disabled = true;

    const message = msgInput.value;
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    const timeStamp = new Date().toLocaleDateString("de-CH", {
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
    });

    const chatData = {
        type: "message",
        text: message,
        timestamp: timeStamp,
        token: token,
        username: username
    };

    socket.send(JSON.stringify(chatData));

    // Button nach dem Senden wieder aktivieren
    sendButton.disabled = false;

        // Textfeld leeren
        msgInput.value = '';
};

// Funktion zum Einloggen
const loginUser = async (username, password) => {
    const loginData = {
        type: "login",
        username: username,
        password: password
    };

    socket.send(JSON.stringify(loginData));
};

// Funktion zum Abmelden
const logoutUser = async () => {
    const logoutData = {
        type: "logout"
    };

    socket.send(JSON.stringify(logoutData));
    localStorage.removeItem('token');
    localStorage.removeItem('username');
};

// Event-Listener für das Laden des Dokuments
document.addEventListener("DOMContentLoaded", () => {
    console.log("Document loaded");

    document.getElementById('sendButton').addEventListener('click', function () {
        newChatBox();
    });

    // Login-Formular
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            localStorage.setItem('username', username);
            loginUser(username, password);
        });
    }

    // Event-Listener für das Schließen des Fensters/Tabs
    window.addEventListener("beforeunload", (event) => {
        logoutUser();
    });
});
