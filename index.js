const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const {testDbConnection} = require('./db');
const Contact = require('./models/Contact');
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send("Hello! This is Bitespeed Backend Task - Identity Reconciliation");
});

app.post('/identify', async (req, res) => {
    const {email , phoneNumber} = req.body;
    if (!email && !phoneNumber) {
        console.log(`email: ${email}     phoneNumber: ${phoneNumber}`);
        res.status(400).send("Please provide either email or phoneNumber");
        return;
    }
    await Contact.create({
        phoneNumber: phoneNumber || null,
        email: email || null,
        linkedId: null,
        linkPrecedence: "primary",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
    }).then(record => {
        console.log("Contact created: ");
        console.log(JSON.stringify(record));
        res.status(200).send("Contact created");
    }).catch(err => {
        console.err("Error creating contact: ", err)
        res.status(500).send("Error occured, check logs");
    });
});

const server = app.listen(PORT, () => {
    console.log(`App listening on PORT: ${PORT}`);
});

server.on('listening', async () => {
    await testDbConnection().catch(err => {
        console.error("Unable to connect to db: ", err);
        process.exit(0);
    });
});