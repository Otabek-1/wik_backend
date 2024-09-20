const express = require("express");
const data = require("./datas/data.js"); // To'g'ri yo'l va import
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
const PORT = 4000;

app.post("/login", (req, res) => {
    const { uname, password } = req.body;

    const userFound = data.some(user => user.uname === uname && user.psw === password);

    if (userFound) {
        res.status(200).send("Entered successfully");
    } else {
        res.status(400).send("Bad request");
    }
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
