const config = require('./config.js');
const express = require('express');

const app = express();
const port = config.port;

app.listen(port);