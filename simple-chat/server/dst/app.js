"use strict";
exports.__esModule = true;
var express = require("express");
var http_1 = require("http");
var path = require("path");
var socketIo = require("socket.io");
var fs = require("fs");
var ramdom_1 = require("./ramdom");
var app = express();
var http = http_1.createServer(app);
var io = socketIo(http);
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '../../client/index.html'));
});
app.get('/2', function (req, res) {
    res.sendFile(path.join(__dirname, '../../client/index2.html'));
});
var usernames = {};
var rooms = ['room1', 'room2', 'room3'];
setInterval(function () {
    var date = new Date();
    io.sockets.emit('updateTimer', {
        hour: date.getHours(),
        min: date.getMinutes(),
        sec: date.getSeconds()
    });
}, 1000);
setInterval(function () {
    fs.readFile(path.join(__dirname, './problems.json'), function (err, data) {
        if (err)
            throw err;
        var problems = JSON.parse(data.toString());
        var problem = ramdom_1.getRandomProblem(problems);
        io.sockets.emit('updateProblem', { problem: problem });
    });
}, 3000);
io.sockets.on('connection', function (socket) {
    socket.on('adduser', function (username) {
        socket.username = username;
        socket.room = 'room1';
        usernames[username] = username;
        socket.join('room1');
        socket.emit('updatechat', 'SERVER', 'you have connected to room1');
        socket.broadcast.to('room1').emit('updatechat', 'SERVER', username + ' has connected to this room');
        socket.emit('updaterooms', rooms, 'room1');
    });
    socket.on('sendchat', function (data) {
        io.sockets["in"](socket.room).emit('updatechat', socket.username, data);
    });
    socket.on('switchRoom', function (newroom) {
        socket.leave(socket.room);
        socket.join(newroom);
        socket.emit('updatechat', 'SERVER', 'you have connected to ' + newroom);
        socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username + ' has left this room');
        socket.room = newroom;
        socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username + ' has joined this room');
        socket.emit('updaterooms', rooms, newroom);
    });
    socket.on('disconnect', function () {
        delete usernames[socket.username];
        io.sockets.emit('updateusers', usernames);
        socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
        socket.leave(socket.room);
    });
});
http.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});
