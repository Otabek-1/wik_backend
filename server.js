const express = require("express");
const http = require("http");
const cors = require("cors");
const socketIo = require("socket.io");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",  // Ruxsat berilgan manzillarni belgilang
        methods: ["GET", "POST"]
    }
});

const PORT = 4000;

io.on("connection", (socket) => {
    console.log("User connected");

    socket.on("sendMessage", ({ message, uname }) => {
        // Xabarni foydalanuvchi nomi bilan birga hamma foydalanuvchilarga jo'natamiz
        io.emit("receiveMessage", { message, uname });
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
