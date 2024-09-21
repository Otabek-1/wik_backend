const express = require("express");
const cors = require("cors");
const users = require("./datas/data")

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4000;

// Statik credentiallar, uni JSON fayl yoki ma'lumotlar bazasidan olish mumkin
const credentials = [
    { uname: "user1", psw: "password123" },
    { uname: "user2", psw: "password456" },
    { uname: "user3", psw: "password789" },
];

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

// Xabarlar qismi
let messages = [];

app.post("/message", (req, res) => {
    const { uname, message } = req.body;
    if (!uname || !message) {
        return res.status(400).json({ error: "Xabar yoki foydalanuvchi nomi yetarli emas" });
    }

    // Xabarlarni foydalanuvchiga moslab arrayga qo'shamiz
    messages.push({ from: uname, body: message });
    return res.status(201).json({ message: "Xabar muvaffaqiyatli jo'natildi" });
});

app.get("/messages", (req, res) => {
    res.status(200).json(messages);
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
