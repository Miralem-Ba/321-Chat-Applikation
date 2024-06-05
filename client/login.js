document.addEventListener("DOMContentLoaded", () => {
    const socket = new WebSocket("ws://localhost:3000");
  
    // Event-Listener für den Verbindungsaufbau
    socket.addEventListener("open", (event) => {
      console.log("WebSocket connected!");
    });
  
    // Event-Listener für WebSocket-Fehler
    socket.addEventListener("error", (event) => {
      console.error("WebSocket error:", event);
    });
  
    // Event-Listener für eingehende Nachrichten vom Server
    socket.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "login_success") {
        localStorage.setItem('token', data.token); // Token im lokalen Speicher speichern
        alert("Anmeldung erfolgreich!");
        window.location.href = "index.html";
      } else if (data.type === "login_failure") {
        alert(`Anmeldung fehlgeschlagen: ${data.message}`);
      }
    });
  
    const loginForm = document.querySelector("form");
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
  
      const loginData = {
        type: "login",
        username: username,
        password: password
      };
  
      socket.send(JSON.stringify(loginData));
    });
  });
  