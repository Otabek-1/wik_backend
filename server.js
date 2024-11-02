const express = require("express");
const crypto = require('crypto');
const cors = require("cors");
const users = require("./datas/data");
const multer = require('multer'); // New import for handling file uploads
const path = require('path');
const fs = require('fs');
const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4000;
const credentials = users.users;
const infos = users.informations;

// Set up storage for images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Directory where images will be saved
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Unique filename
    }
});

const upload = multer({ storage: storage });

let messages = [];
let replies = [];

// Login marshruti
app.post("/login", (req, res) => {
    const { uname, password } = req.body;
    const user = credentials.find(user => user.uname === uname && user.psw === password);
    if (!user) {
        return res.status(400).json({ error: "Noto'g'ri foydalanuvchi nomi yoki parol" });
    }
    return res.status(200).json({ message: `Kirish muvaffaqiyatli, ${uname}`, user: user });
});

app.get('/messages', (req, res) => {
    res.json(messages);
});

app.get("/users", (req, res) => {
    res.send(credentials);
});

// Update the /send route to handle image upload
app.post('/send', upload.single('image'), (req, res) => {
    const { id, from, body, messageto, messagefrom } = req.body;
    
    let imageUrl = null;
    
    if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`; // Save the path to the image
    }
    const messagearray = body.split(" ");

    // Store the message, including the image URL if it exists
    messages.push({ id, from, body, imageUrl, messageto, messagefrom });

    res.status(200).send(messagearray);
});

// Serve the uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
