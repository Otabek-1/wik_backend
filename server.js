const express = require("express");
const http = require("http");
const cors = require("cors");
const socketIo = require("socket.io");
const credentials = require("./datas/data")

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = 4000;


// Login marshruti
app.post("/login", (req, res) => {
    const { uname, password } = req.body;

    // Foydalanuvchi nomini va parolni tekshirish
    const user = credentials.find(user => user.uname === uname && user.psw === password);
    if (!user) {
        return res.status(400).json({ error: "Noto'g'ri foydalanuvchi nomi yoki parol" });
    }

    return res.status(200).json({ message: "Kirish muvaffaqiyatli", uname });
});

// Socket.io bo'yicha aloqa
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
