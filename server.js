const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require('cors');

const app = express();


const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
      origin: "http://127.0.0.1:5500",
      credentials: true
    }
  });


const users = {};

app.get("/", (req, res) => {
    res.send("Server chat is running");
});

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("join", (username) => {
        users[socket.id] = username;
    });

    socket.on("message", (message) => {
        const user = users[socket.id] || "User";
        io.emit("message", { user, message });
    });

    socket.on("privateMessage", (data) => {
        const user = users[socket.id] || "User";
        const recipientSocket = Object.keys(users).find(
            (socketId) => users[socketId] === data.recipient
        );
        if (recipientSocket) {
            io.to(recipientSocket).emit("privateMessage", {
                user,
                recipient: data.recipient,
                message: data.message,
            });
        }
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected");
        delete users[socket.id];
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});