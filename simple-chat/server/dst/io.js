"use strict";
exports.__esModule = true;
var socketIo = require("socket.io");
var IoChat = (function () {
    function IoChat(http) {
        this.io = socketIo(http);
    }
    IoChat.prototype.getIo = function () {
        return this.io;
    };
    IoChat.prototype.openConnetion = function (connectionName, callback) {
    };
    return IoChat;
}());
exports.IoChat = IoChat;
