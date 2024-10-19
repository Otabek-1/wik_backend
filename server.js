const express = require("express");
const crypto = require('crypto');
const cors = require("cors");
const users = require("./datas/data");
const app = express();
app.use(cors());
app.use(express.json());
const PORT = 4000;
const credentials = users.users;
const infos = users.informations;
app.post("/login", (req, res) => {
    const { uname, password } = req.body;
    const user = credentials.find(user => user.uname === uname && user.psw === password);
    if (!user) {
        return res.status(400).json({ error: "Noto'g'ri foydalanuvchi nomi yoki parol" });
    }
    return res.status(200).json({ message: "Kirish muvaffaqiyatli", uname });
});
let messages = [];
app.post("/message", (req, res) => {
    const { uname, message } = req.body;
    if (!uname || !message) {
        return res.status(400).json({ error: "Xabar yoki foydalanuvchi nomi yetarli emas" });
    }
    messages.push({ from: uname, body: message });
    return res.status(201).json({ message: "Xabar muvaffaqiyatli jo'natildi" });
});
app.get("/messages", (req, res) => {
    res.status(200).json(messages);
});
app.post("/search", (req, res) => {
    const { text } = req.body;
    const lowerCaseText = text.toLowerCase();
    const results = infos.filter(info =>
        info.data.toLowerCase().includes(lowerCaseText)
    );
    if (results.length > 0) {
        res.status(200).json(results);
    } else {
        res.status(404).json({ message: "Hech narsa topilmadi" });
    }
});
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});