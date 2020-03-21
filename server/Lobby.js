"use strict";
exports.__esModule = true;
var Random_1 = require("./Random");
var Lobby = (function () {
    function Lobby() {
    }
    Lobby.prototype.createRoom = function (io, socket, gameRoom, username) {
        try {
            if (username in gameRoom) {
                throw "exist this user create room";
            }
            gameRoom[username] = {};
            gameRoom[username]["players"] = {};
            gameRoom[username]["owner"] = username;
            gameRoom[username]["gaming"] = false;
            gameRoom[username]["redTeamCount"] = 0;
            gameRoom[username]["greenTeamCount"] = 0;
            gameRoom[username]["redPoint"] = 0;
            gameRoom[username]["greenPoint"] = 0;
            gameRoom[username]["summaryCount"] = 0;
            socket.join(username);
            io.sockets.emit('createRoom', {
                "roomName": username,
                "roomStatus": gameRoom[username]
            });
        }
        catch (err) {
            console.log(err);
            io.sockets.emit('createRoom', {
                "roomName": "",
                "roomStatus": {}
            });
        }
    };
    Lobby.prototype.closeRoom = function (io, socket, gameRoom, roomName) {
        io.sockets.emit('closeRoom', {
            "roomName": roomName,
            "roomStatus": gameRoom[roomName]
        });
        delete gameRoom[roomName];
    };
    Lobby.prototype.joinRoom = function (io, socket, gameRoom, username, roomName) {
        try {
            var thisRoom = gameRoom[roomName];
            socket.join(roomName);
            var repeat = true;
            if (!(username in gameRoom[roomName]["players"])) {
                var team = thisRoom["redTeamCount"] > thisRoom["greenTeamCount"] ? 2 : 1;
                team === 1 ? thisRoom["redTeamCount"] += 1 : thisRoom["greenTeamCount"] += 1;
                thisRoom["players"][username] = {
                    "team": team,
                    "ready": false,
                    "bullets": Array.from({ length: 5 }, function (v, i) { return Random_1.RandomInt(0, 14); })
                };
                repeat = false;
            }
            if (repeat) {
                socket.emit('joinRoom', {
                    "joinedPlayer": username,
                    "roomName": roomName,
                    "roomStatus": thisRoom
                });
            }
            else {
                io.sockets.emit('joinRoom', {
                    "joinedPlayer": username,
                    "roomName": roomName,
                    "roomStatus": thisRoom
                });
            }
        }
        catch (err) {
            console.log(err);
            socket.emit('updateRoom', "error when " + username + " join " + roomName);
        }
    };
    Lobby.prototype.leaveRoom = function (io, socket, gameRoom, username, roomName) {
        try {
            var thisRoom = gameRoom[roomName];
            var players = thisRoom["players"];
            players[username]["team"] === 1 ? thisRoom["redTeamCount"] -= 1 : thisRoom["greenTeamCount"] -= 1;
            delete players[username];
            socket.leave(roomName);
            io.sockets.emit('leaveRoom', {
                "leavedPlayer": username,
                "roomName": roomName,
                "roomStatus": thisRoom
            });
        }
        catch (err) {
            socket.emit('leaveRoom', "error when " + username + " leave " + roomName + " username not found");
        }
    };
    Lobby.prototype.enterLobby = function (io, socket, gameRoom) {
        var result = [];
        Object.keys(gameRoom).forEach(function (element) {
            var number = Object.keys(gameRoom[element]["players"]).length;
            result.push({
                roomName: element,
                attendance: number
            });
        });
        socket.emit('enterLobby', {
            rooms: result
        });
    };
    Lobby.prototype.setUserReady = function (io, socket, gameRoom, username, roomName) {
        gameRoom[roomName]["players"][username]["ready"] = true;
    };
    Lobby.prototype.unsetUserReady = function (io, socket, gameRoom, username, roomName) {
        gameRoom[roomName]["players"][username]["ready"] = false;
    };
    Lobby.prototype.enterGame = function (io, socket, gameRoom, roomName) {
        io.sockets.emit('enterGame', {
            "roomName": roomName
        });
    };
    return Lobby;
}());
exports.Lobby = Lobby;
