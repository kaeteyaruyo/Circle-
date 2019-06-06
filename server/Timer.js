"use strict";
exports.__esModule = true;
function updateTimer(io, Timer) {
    var now = new Date().getTime();
    var start = Timer.getTime();
    var passTime = 300 - Math.floor((now - start) / 1000);
    var min = Math.floor(passTime / 60);
    var sec = Math.floor(passTime % 60);
    io.sockets.emit('updateTimer', {
        min: min,
        sec: sec
    });
}
exports.updateTimer = updateTimer;
function createTimer() {
    return new Date();
}
exports.createTimer = createTimer;
