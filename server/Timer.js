"use strict";
exports.__esModule = true;
function updateTimer(io, Timer, socket, roomName) {
    var now = new Date().getTime();
    var start = Timer.getTime();
    var passTime = 10 - Math.floor((now - start) / 1000);
    var min = Math.floor(passTime / 60);
    var sec = Math.floor(passTime % 60);
    io.sockets.emit('updateTimer', {
        "roomName": roomName,
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
function closeGame(io, socket, time, gameRoom, roomName) {
    if (time <= 0) {
        var summary = gameRoom[roomName];
        io.sockets.emit('gameOver', {
            "roomName": roomName
        });
        if (gameRoom[roomName] !== undefined) {
            socket.room = "";
            socket.leave(roomName);
            var timerFun = gameRoom[roomName]["timerFun"];
            var problemFun = gameRoom[roomName]["problemFun"];
            clearInterval(timerFun);
            clearInterval(problemFun);
            gameRoom[roomName]["gaming"] = false;
        }
    }
}
exports.closeGame = closeGame;
