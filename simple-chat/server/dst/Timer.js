"use strict";
exports.__esModule = true;
function updateTimer(io, Timer) {
    var now = new Date().getTime();
    var start = Timer.getTime();
    var passTime = now - start;
    io.sockets.emit('updateTimer', {
        hour: 0,
        min: 0,
        sec: passTime
    });
}
exports.updateTimer = updateTimer;
function createTimer() {
    return new Date();
}
exports.createTimer = createTimer;
