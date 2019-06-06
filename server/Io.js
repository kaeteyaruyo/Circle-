"use strict";
exports.__esModule = true;
var Problem_1 = require("./Problem");
var Timer_1 = require("./Timer");
var usernames = {};
var gameRoom = {};
var rooms = ['room1', 'room2', 'room3'];
function createIo(io) {
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
        socket.on('startTimer', function (room) {
            var Timer = Timer_1.createTimer();
            gameRoom[room] = Timer;
            setInterval(function () {
                Timer_1.updateTimer(io, Timer);
            }, 1000);
        });
        socket.on('startProblem', function (room) {
            setInterval(function () {
                Problem_1.updateProblem(io);
            }, 5000);
        });
    });
}
exports.createIo = createIo;
