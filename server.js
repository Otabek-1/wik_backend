const express = require("express");
const crypto = require('crypto');
const cors = require("cors");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const users = require("./datas/data");
const { message } = require("telegraf/filters");

const Users = users.users;
const Informations = users.informations;
const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4000;

app.post("/login", (req,res)=>{
    const {uname, password} = req.body;
    const userInfo = Users.filter(user => user.uname == uname && user.psw == password)
    if(userInfo.length >0){
        res.status(200).send(userInfo);
    }else{
        res.status(404).send({message:"Invalid username or password"})
    }
})

// Ensure 'uploads' directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Set up multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${crypto.randomBytes(16).toString('hex')}-${file.originalname}`);
    }
});

const upload = multer({ storage });

let messages = [];

app.use('/uploads', express.static(uploadDir));

app.post('/send', upload.single('image'), (req, res) => {
    const { id, from, body, msgfrom, msgto } = req.body;
    const image = req.file ? req.file.filename : null; // Check if file was uploaded

    messages.push({ id, from, body, image, msgfrom, msgto });
    res.status(200).json({ message: 'Message sent successfully' });
});

app.post('/ai-find', (req, res) => {
    // req.body dan keywords ni olish
    const { keywords } = req.body;

    // keywords mavjudligini tekshirish
    if (!keywords || typeof keywords !== 'string') {
        return res.status(400).json({ error: 'Keywords taqdim etilmadi yoki noto\'g\'ri formatda' });
    }

    // Keywordni ishlatish
    const result = Informations.filter(info => 
        info.data.toLowerCase().includes(keywords.toLowerCase())
    );

    res.status(200).json(result);
});



app.get("/messages", (req,res)=>{
    res.send(JSON.stringify(messages));
})

app.get("/users",(req,res)=>{
    res.send(JSON.stringify(Users));
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
