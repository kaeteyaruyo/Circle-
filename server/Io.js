"use strict";
exports.__esModule = true;
var Problem_1 = require("./Problem");
var Timer_1 = require("./Timer");
module.exports = (function () {
    function CircleIO() {
        this.gameRoom = {};
        this.roomCount = 0;
        this.tutorialRoom = {};
    }
    CircleIO.prototype.createIo = function (io) {
        var _this = this;
        io.sockets.on('connection', function (socket) {
            socket.on('createRoom', function (username) {
                _this.createRoom(io, socket, username);
            });
            socket.on('closeRoom', function (roomName) {
                _this.closeRoom(io, socket, roomName);
            });
            socket.on('joinRoom', function (username, roomName) {
                _this.joinRoom(io, socket, username, roomName);
            });
            socket.on('leaveRoom', function (username) {
                _this.leaveRoom(io, socket, username);
            });
            socket.on('enterlobby', function (username) {
                _this.enterlobby(io, socket, username);
            });
            socket.on('setUserReady', function (username, roomName) {
                _this.setUserReady(io, socket, username, roomName);
            });
            socket.on('unsetUserReady', function (username, roomName) {
                _this.unsetUserReady(io, socket, username, roomName);
            });
            socket.on('startTutorial', function (roomName) {
                _this.startTutorial(io, socket, roomName);
            });
            socket.on('startGame', function (roomName) {
                _this.startGame(io, socket, roomName);
            });
            socket.on('closeGame', function (roomName) {
                _this.closeGame(io, socket, roomName);
            });
            socket.on('updatePoint', function (roomName, point, team) {
                _this.updatePoint(io, socket, roomName, point, team);
            });
        });
    };
    CircleIO.prototype.createRoom = function (io, socket, username) {
        if (typeof this.gameRoom[username] !== 'undefined') {
            socket.emit('updateRoom', "error roomName conflict");
        }
        else {
            this.roomCount = this.roomCount + 1;
            this.gameRoom[username] = {};
            this.gameRoom[username]["players"] = {};
            this.gameRoom[username]["players"][username] = {
                "team": 1,
                "ready": false
            };
            this.gameRoom[username]["director"] = username;
            this.gameRoom[username]["gaming"] = false;
            this.gameRoom[username]["redTeamCount"] = 1;
            this.gameRoom[username]["greenTeamCount"] = 0;
            this.gameRoom[username]["redPoint"] = 0;
            this.gameRoom[username]["greenPoint"] = 0;
            socket.room = username;
            io.sockets.emit('createRoom', {
                "roomName": username,
                "roomStatus": this.gameRoom[username]
            });
        }
    };
    CircleIO.prototype.closeRoom = function (io, socket, roomName) {
        this.roomCount = this.roomCount - 1;
        io.sockets.emit('closeRoom', {
            "roomName": roomName,
            "roomStatus": this.gameRoom[roomName]
        });
        delete this.gameRoom[roomName];
    };
    CircleIO.prototype.joinRoom = function (io, socket, username, roomName) {
        var thisRoom = this.gameRoom[roomName];
        if (thisRoom !== 'undefined') {
            socket.join(roomName);
            var team = void 0;
            if (thisRoom["redTeamCount"] > thisRoom["greenTeamCount"]) {
                team = 1;
                thisRoom["redTeamCount"] = thisRoom["redTeamCount"] + 1;
            }
            else {
                team = 2;
                thisRoom["greenTeamCount"] = thisRoom["greenTeamCount"] + 1;
            }
            thisRoom["players"][username] = {
                "team": team,
                "ready": false
            };
            io.sockets.emit('joinRoom', {
                "roomName": roomName,
                "roomStatus": thisRoom
            });
        }
        else {
            socket.emit('updateRoom', "error when " + username + " join " + roomName);
        }
    };
    CircleIO.prototype.leaveRoom = function (io, socket, username) {
        var roomName = socket.room;
        var thisRoom = this.gameRoom[roomName];
        var leavePlayer = username;
        if (thisRoom !== 'undefined') {
            var players = thisRoom["players"];
            if (players[username] !== 'undefined') {
                if (players[username]["team"] === 1) {
                    thisRoom["redTeamCount"] = thisRoom["redTeamCount"] - 1;
                }
                else {
                    thisRoom["greenTeamCount"] = thisRoom["greenTeamCount"] - 1;
                }
                delete players[username];
                socket.leave(socket.room);
                io.sockets.emit('leaveRoom', {
                    "roomName": roomName,
                    "roomStatus": thisRoom
                }, leavePlayer);
            }
            else {
                socket.emit('updateRoom', "error when " + username + " leave " + roomName + " username not found");
            }
        }
    };
    CircleIO.prototype.enterlobby = function (io, socket, username) {
        var _this = this;
        var rooms = Object.keys(this.gameRoom);
        var players = [];
        rooms.forEach(function (element) {
            var number = Object.keys(_this.gameRoom[element]["players"]).length;
            players.push(number);
        });
        socket.emit('enterlobby', {
            rooms: rooms,
            players: players
        });
    };
    CircleIO.prototype.setUserReady = function (io, socket, username, roomName) {
        this.gameRoom[roomName]["players"][username]["ready"] = true;
    };
    CircleIO.prototype.unsetUserReady = function (io, socket, username, roomName) {
        this.gameRoom[roomName]["players"][username]["ready"] = false;
    };
    CircleIO.prototype.startTutorial = function (io, socket, roomName) {
        var _this = this;
        var timer;
        if (typeof this.tutorialRoom[roomName] !== 'undefined') {
            if (this.tutorialRoom[roomName]["gaming"]) {
                timer = this.tutorialRoom[roomName]["timer"];
            }
        }
        else {
            timer = Timer_1.createTimer();
            this.tutorialRoom[roomName] = {};
            this.tutorialRoom[roomName]["timer"] = timer;
            var timerFun = setInterval(function () {
                var time = Timer_1.updateTimer(io, timer, socket);
                Timer_1.closeGame(io, socket, time, _this.tutorialRoom[roomName]);
            }, 1000);
            var problemFun = setInterval(function () {
                Problem_1.updateProblem(_this.tutorialRoom, roomName);
                Problem_1.emitProblem(io, roomName, socket, _this.tutorialRoom[roomName]["problem"]);
            }, 5000);
            this.tutorialRoom[roomName]["timerFun"] = timerFun;
            this.tutorialRoom[roomName]["problemFun"] = problemFun;
            socket.isTutorial = true;
            this.tutorialRoom[roomName]["gaming"] = true;
        }
        socket.room = roomName;
        socket.join(roomName);
        Timer_1.updateTimer(io, timer, socket);
        Problem_1.initProblem(this.tutorialRoom, roomName);
        Problem_1.emitProblem(io, roomName, socket, this.tutorialRoom[roomName]["problem"]);
    };
    CircleIO.prototype.startGame = function (io, socket, roomName) {
        var _this = this;
        var timer;
        if (typeof this.gameRoom[roomName] !== 'undefined') {
            if (this.gameRoom[roomName]["gaming"]) {
                timer = this.gameRoom[roomName]["timer"];
            }
            else {
                timer = Timer_1.createTimer();
                this.gameRoom[roomName]["timer"] = timer;
                var timerFun = setInterval(function () {
                    var time = Timer_1.updateTimer(io, timer, socket);
                    Timer_1.closeGame(io, socket, time, _this.gameRoom[roomName]);
                }, 1000);
                var problemFun = setInterval(function () {
                    Problem_1.updateProblem(_this.gameRoom, roomName);
                    Problem_1.emitProblem(io, roomName, socket, _this.gameRoom[roomName]["problem"]);
                }, 5000);
                this.gameRoom[roomName]["timerFun"] = timerFun;
                this.gameRoom[roomName]["problemFun"] = problemFun;
                this.gameRoom[roomName]["gaming"] = true;
            }
        }
        socket.room = roomName;
        socket.join(roomName);
        Timer_1.updateTimer(io, timer, socket);
        Problem_1.initProblem(this.gameRoom, roomName);
        Problem_1.emitProblem(io, roomName, socket, this.gameRoom[roomName]["problem"]);
    };
    CircleIO.prototype.closeGame = function (io, socket, roomName) {
        if (typeof this.gameRoom[roomName] !== 'undefined') {
            socket.room = "";
            socket.leave(roomName);
            var timerFun = this.gameRoom[roomName]["timerFun"];
            var problemFun = this.gameRoom[roomName]["problemFun"];
            clearInterval(timerFun);
            clearInterval(problemFun);
            this.gameRoom[roomName]["gaming"] = false;
        }
    };
    CircleIO.prototype.updatePoint = function (io, socket, roomName, point, team) {
        if (typeof this.gameRoom[roomName] !== 'undefined') {
            if (team === '1') {
                this.gameRoom[roomName]["redPoint"] = point;
            }
            else if (team === '2') {
                this.gameRoom[roomName]["greenPoint"] = point;
            }
            io.sockets.emit('updatePoint', this.gameRoom[roomName]["redPoint"], this.gameRoom[roomName]["greenPoint"]);
        }
        else {
            socket.emit('error', 'error cannot find room');
        }
    };
    return CircleIO;
}());
