const config = require('./config.js');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = config.port;

const http_1 = require("http");
const socketIo = require("socket.io");
const Problem = require("./src/Problem");
const Timer = require("./src/Timer");
const http = http_1.createServer(app);
const io = socketIo(http);
const Io = require("./src/Io");

let username = '';

// Set static route
app.use('/css', express.static(path.join(config.projectRoot, '/static/css')));
app.use('/js', express.static(path.join(config.projectRoot, '/static/js')));

// BodyParser for post request
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Set view engine
app.set('view engine', 'pug');
app.set('views', path.join(config.projectRoot, '/static/pug'));

// Middleware to set render parameter for all route
function renderSetting(req, res, next) {
    res.locals.basedir = path.join(config.projectRoot, '/static/pug');
    res.locals.staticUrl = config.staticUrl();
    next();
};

app.get('/', renderSetting, (req, res) => {
    res.render('index', {
        title: 'Home',
    });
});

app.post('/', (req, res) => {
    username = req.body.username;
    res.redirect('/lobby');
});

app.get('/lobby', renderSetting, (req, res) => {
    res.render('lobby', {
        title: 'Lobby',
        username: username,
    });
});

app.get('/tutorial', renderSetting, (req, res) => {
    res.render('game', {
        title: 'Tutorial',
        username: username,
    });
});

setInterval( () => {
    Problem.updateProblem(io);
}, 1000);

setInterval( () => {
    Timer.updateTimer(io);
}, 3000);

Io.createIo(io);

app.listen(port);