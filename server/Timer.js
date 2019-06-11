"use strict";
exports.__esModule = true;
function updateTimer(io, Timer, socket) {
    var now = new Date().getTime();
    var start = Timer.getTime();
    var passTime = 300 - Math.floor((now - start) / 1000);
    var min = Math.floor(passTime / 60);
    var sec = Math.floor(passTime % 60);
    io.sockets["in"](socket.room).emit('updateTimer', {
        min: min,
        sec: sec
    });
    return passTime;
}
exports.updateTimer = updateTimer;
function createTimer() {
    return new Date();
}
exports.createTimer = createTimer;
function closeGame(io, socket, time, roomInfo) {
    if (time <= 0) {
        var summary = roomInfo;
        io.sockets["in"](socket.room).emit('GameOver', summary);
    }
}
exports.closeGame = closeGame;
