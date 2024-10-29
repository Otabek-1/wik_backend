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

// Login marshruti
app.post("/login", (req, res) => {
    const { uname, password } = req.body;
    const user = credentials.find(user => user.uname === uname && user.psw === password);
    if (!user) {
        return res.status(400).json({ error: "Noto'g'ri foydalanuvchi nomi yoki parol" });
    }
    return res.status(200).json({ message: `Kirish muvaffaqiyatli, ${uname}` });
});
let messages = [];
let replies = [];

// Message posting route (text-only)
app.post("/message", (req, res) => {
    const { uname, message, image } = req.body; // Added image to destructuring
    if (!uname || !message) {
        return res.status(400).json({ error: "Xabar yoki foydalanuvchi nomi yetarli emas" });
    }

    if (message === "#history") {
        const images = [
            "./src/images/1.jpg", 
            "./src/images/2.jpg"
        ];
        messages.push({ from: "Server", body: "Test of history", images })
        return res.status(200).json({ from: "Server", body: "Test of history",  "./src/images/2.jpg" });
    }

    messages.push({ from: uname, body: message, image }); // Store the image with the message
    return res.status(201).json({ message: "Xabar muvaffaqiyatli jo'natildi" });
});



app.get("/messages", (req, res) => res.status(200).json(messages));

// Reply routes (no changes)
app.post("/reply", (req, res) => {
    const { id, body } = req.body;
    replies.push({ id: id.toString(), body });
    return res.status(201).json({ message: "Javob muvaffaqiyatli jo'natildi" });
});

app.get("/replies/:id", (req, res) => {
    const { id } = req.params;
    const results = replies.filter(replied =>
        replied.id === id.toString() // id ni stringga aylantirib solishtirish
    );
    if (results.length > 0) {
        res.status(200).json(results);
    } else {
        res.status(404).json({ message: "Javob topilmadi!" });
    }
});

app.post("/search", (req, res) => {
    const { text } = req.body;
    const lowerCaseText = text.toLowerCase(); // Convert search text to lowercase
    const results = infos.filter(info => 
        info.data.toLowerCase().includes(lowerCaseText) // Convert data to lowercase before comparing
    );
    if (results.length > 0) {
        res.status(200).json(results);
    } else {
        res.status(404).json({ message: "Hech narsa topilmadi" }); // If no matches, send a not found response
    }
});

app.get("/replyall", (req, res) => res.status(200).json(replies));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
