const express = require('express');
const app = express();
const {testDbConnection} = require('./db');
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send("Hello! This is Bitespeed Backend Task - Identity Reconciliation");
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