const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4000;
let messages = [];
let replies = [];

// Message posting route (text-only)
app.post("/message", (req, res) => {
    const { uname, message, image } = req.body; // Added image to destructuring
    if (!uname || !message) {
        return res.status(400).json({ error: "Xabar yoki foydalanuvchi nomi yetarli emas" });
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

app.get("/replyall", (req, res) => res.status(200).json(replies));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
