"use strict";
exports.__esModule = true;
var express = require("express");
var socketIo = require("socket.io");
var http_1 = require("http");
var path = require("path");
var x = path.join('Users', 'Refsnes', 'demo_path.js');
var app = express();
var http = http_1.createServer(app);
var io = socketIo(http);
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '../../client/index.html'));
});
io.on('connection', function (socket) {
    socket.on('chat message', function (msg) {
        io.emit('chat message', msg);
    });
});
http.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});
