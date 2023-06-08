const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const {testDbConnection} = require('./db/db');
const {identify} = require('./indentifyService');
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send("Hello! This is Bitespeed Backend Task - Identity Reconciliation");
});

/**
 * POST: /identify
 * Expected paylod:
 * {
 *      email? : String,
 *      phoneNumber?: String
 * }
 * This api needs to either have email or phoneNumber, or both, in the payload
 */
app.post('/identify', async (req, res) => {
    const {email , phoneNumber} = req.body;
    await identify(email, phoneNumber).then(resJson => {
        console.log("Contact found! ");
        res.status(200).json(resJson);
    }).catch(err => {
        console.error("Error creating contact: ", err)
        res.status(500).send(err.message);
    });
});

const server = app.listen(PORT);

server.on('listening', async () => {
    await testDbConnection().catch(err => {
        console.error("Unable to connect to db: ", err);
        process.exit(0);
    });
    console.log(`App listening on PORT: ${server.address().port}`);
});