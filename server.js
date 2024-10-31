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
    return res.status(200).json({ message: `Kirish muvaffaqiyatli, ${uname}`, user: user });
});
let messages = [];
let replies = [];

app.get('/messages',(req,res)=>{
    res.json(messages);
})

app.get("/users", (req,res)=>{
    res.send(credentials);
})

app.post('/send',(req,res)=>{
    const {id, from, body} = req.body;
    messages.push({id, from, body});
    res.status(200).json({message: 'Mesaj yuborildi'});
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
