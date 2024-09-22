const express = require("express");
const cors = require("cors");
const users = require("./datas/data")

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4000;

// Statik credentiallar, uni JSON fayl yoki ma'lumotlar bazasidan olish mumkin
const credentials = users.users
const infos = users.informations

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
let sosAlert = false; // SOS alertni saqlash uchun

app.post("/sos", (req, res) => {
    sosAlert = true; // SOS alertni yoqish
    res.status(200).json({ message: "SOS alert jo'natildi" });
});

app.get("/sos", (req, res) => {
    res.status(200).json({ sosAlert });
});

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


app.post("/search", (req, res) => {
    const { text } = req.body;
    const lowerCaseText = text.toLowerCase(); // Convert search text to lowercase

    const results = infos.filter(info => 
        info.data.toLowerCase().includes(lowerCaseText) // Convert data to lowercase before comparing
    );

    if (results.length > 0) {
        res.status(200).json(results); // Send all matching results
    } else {
        res.status(404).json({ message: "Hech narsa topilmadi" }); // If no matches, send a not found response
    }
});

// Ekran ma'lumotlarini saqlash uchun array

let screens = [];

// Ekran ma'lumotlarini qo'shish
app.post("/screen", (req, res) => {
    const { userId, screenData } = req.body;

    if (!userId || !screenData) {
        return res.status(400).json({ error: "Foydalanuvchi ID yoki ekran ma'lumotlari yetarli emas" });
    }

    // Ekran ma'lumotlarini yangilash
    screens = screens.filter(screen => screen.userId !== userId); // Eski ma'lumotlarni olib tashlash
    screens.push({ userId, screenData }); // Yangi ma'lumot qo'shish

    res.status(200).json({ message: "Ekran ma'lumotlari muvaffaqiyatli saqlandi" });
});

// Barcha ekran ma'lumotlarini olish
app.get("/screens", (req, res) => {
    res.status(200).json(screens);
});



app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
