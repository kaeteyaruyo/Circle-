const config = require('./config.js');
const express = require('express');
const path = require('path');

const app = express();
const port = config.port;

app.use('/css', express.static(path.join(config.projectRoot, '/static/dist/css')));
app.use('/js', express.static(path.join(config.projectRoot, '/static/dist/js')));

app.get('/', (req, res) => {
    res.sendFile(`${ config.projectRoot }/static/dist/html/index.html`);
});

app.listen(port);