const config = require('./config.js');
const path = require('path');
const bodyParser = require('body-parser');

const app = require('express')();
const server = require('http').Server(app);
const port = config.port;

const Problem = require("./server/Problem.js");
const Timer = require("./server/Timer.js");
const io = require("./server/Io.js").createIo(require("socket.io")(server));

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
    next();
};

app.get('/', renderSetting, (req, res) => {
    res.render('index', {
        title: 'Home',
        username: '',
    });
});

app.post('/', (req, res) => {
    username = req.body.username;
    res.redirect('/lobby');
});

app.get('/lobby', renderSetting, (req, res) => {
    if(username === '')
        res.redirect('/');
    else{
        res.render('lobby', {
            title: 'Lobby',
            username: username,
        });
    }
});

app.get('/tutorial', renderSetting, (req, res) => {
    if(username === '')
        res.redirect('/');
    else{
        res.render('game', {
            title: 'Tutorial',
            username: username,
        });
    }
});

setInterval( () => {
    Problem.updateProblem(io);
}, 1000);

setInterval( () => {
    Timer.updateTimer(io);
}, 3000);

server.listen(port);
