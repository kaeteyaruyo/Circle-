"use strict";
exports.__esModule = true;
var Lobby_1 = require("./Lobby");
var Game_1 = require("./Game");
var Summary_1 = require("./Summary");
module.exports = (function () {
    function CircleIO() {
        this.gameRoom = {};
        this.roomCount = 0;
        this.lobby = new Lobby_1.Lobby();
        this.game = new Game_1.Game();
        this.summary = new Summary_1.Summary();
    }
    CircleIO.prototype.createIo = function (io) {
        var _this = this;
        io.sockets.on('connection', function (socket) {
            socket.on('createRoom', function (username) {
                _this.lobby.createRoom(io, socket, _this.gameRoom, username);
            });
            socket.on('closeRoom', function (roomName) {
                _this.lobby.closeRoom(io, socket, _this.gameRoom, roomName);
            });
            socket.on('joinRoom', function (username, roomName) {
                _this.lobby.joinRoom(io, socket, _this.gameRoom, username, roomName);
            });
            socket.on('leaveRoom', function (username, roomName) {
                _this.lobby.leaveRoom(io, socket, _this.gameRoom, username, roomName);
            });
            socket.on('enterLobby', function () {
                _this.lobby.enterLobby(io, socket, _this.gameRoom);
            });
            socket.on('setUserReady', function (username, roomName) {
                _this.lobby.setUserReady(io, socket, _this.gameRoom, username, roomName);
            });
            socket.on('unsetUserReady', function (username, roomName) {
                _this.lobby.unsetUserReady(io, socket, _this.gameRoom, username, roomName);
            });
            socket.on('enterGame', function (roomName) {
                _this.lobby.enterGame(io, socket, _this.gameRoom, roomName);
            });
            socket.on('joinGameRoom', function (roomName) {
                _this.game.joinGameRoom(io, socket, _this.gameRoom, roomName);
            });
            socket.on('startGame', function (username, roomName) {
                _this.game.startGame(io, socket, _this.gameRoom, username, roomName);
            });
            socket.on('getScore', function (roomName, point, team) {
                _this.game.getScore(io, socket, _this.gameRoom, roomName, point, team);
            });
            socket.on('shuffleBoard', function (roomName) {
                _this.game.shuffleBoard(io, socket, _this.gameRoom, roomName);
            });
            socket.on('updateCell', function (roomName, data) {
                _this.game.updateCell(io, socket, _this.gameRoom, roomName, data);
            });
            socket.on('updateBullet', function (roomName, data) {
                _this.game.updateBullet(io, socket, _this.gameRoom, roomName, data);
            });
            socket.on('getBullet', function (roomName, username) {
                _this.game.getBullet(io, socket, _this.gameRoom, roomName, username);
            });
            socket.on('summary', function (roomName) {
                _this.summary.result(io, socket, _this.gameRoom, roomName);
            });
        });
    };
    return CircleIO;
}());
