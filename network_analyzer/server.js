// server.js
const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
const port = 50000;

const options = {
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem')
};

app.use(cors());
app.use(express.json());
app.use('/', express.static(__dirname + '/'));

const servers = https.createServer(options, app);

module.exports = { app, servers, port };