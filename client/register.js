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
      if (data.type === "register_success") {
        alert("Registrierung erfolgreich! Du kannst dich jetzt einloggen.");
        window.location.href = "login.html";
      } else if (data.type === "register_failure") {
        alert(`Registrierung fehlgeschlagen: ${data.message}`);
      }
    });
  
    const registerForm = document.querySelector("form");
    registerForm.addEventListener("submit", (event) => {
      event.preventDefault();
      
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirm-password").value;
  
      if (password !== confirmPassword) {
        alert("Passwörter stimmen nicht überein.");
        return;
      }
  
      const registerData = {
        type: "register",
        username: username,
        password: password
      };
  
      socket.send(JSON.stringify(registerData));
    });
  });
  