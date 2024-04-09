const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require('cors');

// instanciar express
const app = express();

// crear el servidor web
const server = http.createServer(app);

// configuración del servidor con las cors
const io = socketIo(server, {
    cors: {
      origin: "http://127.0.0.1:5500",
      credentials: true
    }
  });

let conexiones = {
    salas: [
        {
            "ABC":[
                {
                    "identificador":"12345",
                    "habilitado":true,
                    "socketId": "abc12345"
                },
                {
                    "identificador":"3333",
                    "habilitado":true,
                    "socketId": "abc33345"
                }
            ],
            
            "XYZ":[
                {
                    "identificador":"5555",
                    "habilitado":true,
                    "socketId": "abasd2345"
                },
                {
                    "identificador":"66666",
                    "habilitado":true,
                    "socketId": "asd98987"
                }
            ]
        }
    ]
};

let users = {};

app.get("/", (req, res) => {
    res.send("Server chat is running and ready to accept connections");
});

io.on("connection", (socket) => {
    console.log("An user connected");

    socket.on("join", (username) => {
        console.log(`The user ${username} has joined the chat.`);
        users[socket.id] = username;
    });

    socket.on("messageFromClient", (message) => {
        console.log(`Message from ${users[socket.id]}: ${message}`);
        const user = users[socket.id] || "User";
        io.emit("messageFromServer", { user, message });
    });

    socket.on("privateMessageFromClient", (data) => {
        console.log(`Private message from ${users[socket.id]} to ${data.recipient}`);
        const user = users[socket.id] || "User";
        const recipientSocket = Object.keys(users).find(
            (socketId) => users[socketId] === data.recipient
        );
        if (recipientSocket) {
            io.to(recipientSocket).emit("privateMessageFromServer", {
                user,
                recipient: data.recipient,
                message: data.message,
            });
        }
    });

    socket.on("disconnect", () => {
        console.log(`The user ${users[socket.id]} has left the chat.`)
        delete users[socket.id];
    });
});

const PORT = process.env.PORT || 3010;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
