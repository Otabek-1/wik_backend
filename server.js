const express = require("express");
const crypto = require('crypto');
const cors = require("cors");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const levenshtein = require('fast-levenshtein');
const FuzzySet = require('fuzzyset.js');
const users = require("./datas/data");
const { message } = require("telegraf/filters");


const Users = users.users;
const Informations = users.informations;
const Quests = users.quests;
const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4000;

app.post("/login", (req, res) => {
    const { uname, password } = req.body;
    const userInfo = Users.filter(user => user.uname == uname && user.psw == password)
    if (userInfo.length > 0) {
        res.status(200).send(userInfo);
    } else {
        res.status(404).send({ message: "Invalid username or password" })
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


const negativeWords = ["darmayitsan", "yomon","fuckyou ", "fckyou ", "fucku", " suka ", "darmayit ", "cort"];  // Salbiy so'zlar ro'yxati
const personalPronouns = ["sen", "men", "u", "biz", "siz"];  // Shaxsiy zamonlar

// Response (Javob) uchun sokin so'zlarni aniqlash
function isNegativeResponse(req) {
    return req.some(word => negativeWords.includes(word));
}

// So'zlar bo'yicha javobni topish va tartiblash

function getBestResponse(req) {
    const sortedResponses = Quests
        .map(quest => {
            const questWords = quest.input.split(" ");
            const fuzzySet = FuzzySet(questWords);
            const matchingWordsCount = req.reduce((acc, word) => {
                const matches = fuzzySet.get(word); // So'zni qidirish va noaniq moslikni topish
                return matches && matches.length > 0 ? acc + 1 : acc;
            }, 0);

            return { quest, matchingWordsCount };
        })
        .filter(item => item.matchingWordsCount > 0)
        .sort((a, b) => b.matchingWordsCount - a.matchingWordsCount);

    return sortedResponses.length > 0 ? sortedResponses[0].quest : null;
}


let res = "";

function Chatai(id, msgId, replyfor, from, body, msgfrom, msgto) {
    const req = body.split(" ").slice(1); // reqning birinchi so'zini olishdan qochish uchun slice(1)

    // Salbiy so'zlar bo'lsa, alohida javob qaytarish
    if (isNegativeResponse(req)) {
        console.log("Salbiy so'zlar mavjud: javob berish...");
        const resFor = Users.find(user => user.id == msgfrom); // Foydalanuvchini topamiz
        let res = "Xatolikka yo'l qo'ygan bo'lsam uzr, bunday qo'pol so'zlardan foydalanmaslikni tavsiya qilaman 😉";
        messages.push({ id, msgId, replyfor, from, body, msgfrom, msgto });
        messages.push({ id: 11101, msgId: Date.now(), replyfor: msgId, from: "Ai", body: res, msgfrom: 11101, msgto: id });
        return; // Salbiy javob qaytargach, qolgan jarayonni to'xtatamiz
    }

    // Quests massivida eng mos javobni topamiz
    const repsonses = getBestResponse(req);

    // resFor ni aniqlashdan oldin ishlatmaslik kerak
    const resFor = Users.find(user => user.id == msgfrom); // find() metodini ishlatamiz, filter() o'rniga
    console.log("req:", req); // req qiymatini tekshirish
    console.log("repsonses:", repsonses); // repsonses qiymatini tekshirish
    console.log("resFor:", resFor); // resFor qiymatini tekshirish

    if (repsonses && resFor) {
        let res;
        if (repsonses.output === "must_solve") {
            // Arifmetik ifodani chiqarish
            const expressionMatch = body.match(/[\d+\-*/]+/g); // Matndagi ifodani topish
            if (expressionMatch) {
                const expression = expressionMatch.join(''); // Ifodani matn ko'rinishiga keltirish
                try {
                    res = `${expression} ning javobi ${eval(expression)} ga teng.`; // Ifodani hisoblash
                } catch (error) {
                    res = "Ifoda noto'g'ri yozilgan.";
                }
            } else {
                res = "Arifmetik ifoda topilmadi.";
            }
        } else {
            res = repsonses.output.replace("$1", resFor.fullName.split(" ")[0]);
        }
        messages.push({ id, msgId, replyfor:"", from, body, msgfrom, msgto });
        messages.push({ id: 11101, msgId: Date.now(), replyfor: msgId, from: "Ai", body: res==""?"Gapingizga uncha tushunmadim, nimadir xato ketmadimi?":res, msgfrom: 11101, msgto: id });
    } else {
        // Agar response yoki resFor topilmadi, xatolikni qaytaring
        if (!repsonses) {
            console.log("Response topilmadi: kiritilgan so'zlar mos kelmadi.");
        }
        if (!resFor) {
            console.log("Foydalanuvchi topilmadi: msgfrom ID bo'yicha foydalanuvchi mavjud emas.");
        }
    }
}


app.post('/send', upload.single('image'), (req, res) => {
    const { id, msgId, replyfor, from, body, msgfrom, msgto } = req.body;
    const image = req.file ? req.file.filename : null; // Check if file was uploaded
    if (body.startsWith('#ai')) {
        Chatai(id, msgId, replyfor, from, body, msgfrom, msgto);
    } else {
        messages.push({ id, msgId, replyfor, from, body, image, msgfrom, msgto });

    }
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



app.get("/messages", (req, res) => {
    res.send(JSON.stringify(messages));
})

app.get("/users", (req, res) => {
    res.send(JSON.stringify(Users));
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
