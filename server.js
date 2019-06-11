const config = require('./config.js');
const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const middleware = require("./server/middleware.js");

const app = express();
const server = require('http').Server(app);
const io = require("socket.io")(server);
require("./server/Io.js").createIo(io);

// Set static route
app.use('/css', express.static(path.join(config.projectRoot, '/static/css')));
app.use('/js', express.static(path.join(config.projectRoot, '/static/js')));

// BodyParser for post request
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Setup view engine
app.set('view engine', 'pug');
app.set('views', path.join(config.projectRoot, '/static/pug'));

// Setup session
app.use( session( {
    secret: 'rhOo03narefOzYOWfFwinC7uX4aVZYvVVbibZ3nSyQc',
    name:              'circle++',
    resave:            false,
    saveUninitialized: false,
    cookie:            {
        // domain:   config.host,
        httpOnly: true,
        maxAge: 10 * 60 * 1000, // 10 minutes
    },
} ) );

app.get('/', middleware.renderSetting, (req, res) => {
    if ( req.session.username )
        res.redirect('/lobby');
    else{
        res.render('index', {
            title: 'Home',
            username: '',
        });
    }
});

app.post('/', (req, res) => {
    if( req.body.username && !req.session.username ){
        req.session.username = req.body.username;
        res.redirect('/lobby');
    }
    else
        res.redirect('/');
});

app.get('/lobby', middleware.renderSetting, middleware.checkLogin, (req, res) => {
    res.render('lobby', {
        title: 'Lobby',
        username: req.session.username,
    });
});

app.get('/tutorial', middleware.renderSetting, middleware.checkLogin, (req, res) => {
    res.render('game', {
        title: 'Tutorial',
        username: req.session.username,
        mainFile: 'tutorial',
    });
});

server.listen(config.port);
