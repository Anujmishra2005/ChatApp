(function() {
    const app = document.querySelector(".app");
    const socket = io();

    let uname;

    // Load beep sound
    const beepSound = new Audio("beep.mp3");

    // Request notification permissions
    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    }

    app.querySelector(".join-screen #join-user").addEventListener("click", function() {
        let username = app.querySelector(".join-screen #username").value;
        if (username.length === 0) {
            return;
        }
        socket.emit("newuser", username);
        uname = username;
        app.querySelector(".join-screen").classList.remove("active");
        app.querySelector(".chat-screen").classList.add("active");
    });

    app.querySelector(".chat-screen #send-message").addEventListener("click", function() {
        let message = app.querySelector(".chat-screen #message-input").value;
        if (message.length === 0) {
            return;
        }
        renderMessage("my", {
            username: uname,
            text: message
        });
        socket.emit("chat", {
            username: uname,
            text: message
        });
        app.querySelector(".chat-screen #message-input").value = "";
    });

    app.querySelector(".chat-screen #exit-chat").addEventListener("click", function() {
        socket.emit("exituser", uname);
        window.location.href = window.location.href;
    });

    socket.on("update", function(update) {
        renderMessage("update", update);
    });

    socket.on("chat", function(message) {
        renderMessage("other", message);
        // Play beep sound on receiving a new message
        beepSound.play();
        // Show browser notification
        if (document.hidden && Notification.permission === "granted") {
            new Notification("New Message", {
                body: `${message.username}: ${message.text}`,
                icon: "notification-icon.png" // Make sure to place this image in your public folder
            });
        }
    });

    // Display typing indicators
    socket.on("typing", function(username) {
        const typingIndicator = app.querySelector(".chat-screen .typing-indicator");
        typingIndicator.textContent = `${username} is typing...`;
        clearTimeout(typingIndicator.timer);
        typingIndicator.timer = setTimeout(() => {
            typingIndicator.textContent = "";
        }, 3000);
    });

    socket.on("stoptyping", function() {
        const typingIndicator = app.querySelector(".chat-screen .typing-indicator");
        typingIndicator.textContent = "";
    });

    // Handle typing events
    app.querySelector(".chat-screen #message-input").addEventListener("input", function() {
        socket.emit("typing", uname);
        clearTimeout(socket.typingTimeout);
        socket.typingTimeout = setTimeout(() => {
            socket.emit("stoptyping");
        }, 3000);
    });

    function renderMessage(type, message) {
        let messageContainer = app.querySelector(".chat-screen .messages");

        if (type === "my") {
            let el = document.createElement("div");
            el.setAttribute("class", "message my-message");
            el.innerHTML = `
                <div>
                    <div class="name">You</div>
                    <div class="text">${message.text}</div>
                </div>
            `;
            messageContainer.appendChild(el);
        } else if (type === "other") {
            let el = document.createElement("div");
            el.setAttribute("class", "message other-message");
            el.innerHTML = `
                <div>
                    <div class="name">${message.username}</div>
                    <div class="text">${message.text}</div>
                </div>
            `;
            messageContainer.appendChild(el);
        } else if (type === "update") {
            let el = document.createElement("div");
            el.setAttribute("class", "update");
            el.innerText = message;
            messageContainer.appendChild(el);
        }

        // Scroll Chat to End
        messageContainer.scrollTop = messageContainer.scrollHeight - messageContainer.clientHeight;
    }
})();
