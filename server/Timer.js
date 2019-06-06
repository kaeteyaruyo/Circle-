"use strict";
exports.__esModule = true;
function updateTimer(io) {
    var date = new Date();
    io.sockets.emit('updateTimer', {
        hour: date.getHours(),
        min: date.getMinutes(),
        sec: date.getSeconds()
    });
}
exports.updateTimer = updateTimer;
