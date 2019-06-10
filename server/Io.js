"use strict";
exports.__esModule = true;
var Problem_1 = require("./Problem");
var Timer_1 = require("./Timer");
var gameRoom = {};
var roomCount = 0;
var tutorialRoom = {};
function createIo(io) {
    io.sockets.on('connection', function (socket) {
        socket.on('createRoom', function (username, roomName) {
            if (typeof gameRoom[roomName] !== 'undefined') {
                socket.emit('updateRoom', "error roomName conflict");
            }
            else {
                roomCount = roomCount + 1;
                gameRoom[roomName] = {};
                gameRoom[roomName]["players"] = {};
                gameRoom[roomName]["players"][username] = {
                    "team": "red",
                    "ready": false
                };
                gameRoom[roomName]["director"] = username;
                gameRoom[roomName]["gaming"] = false;
                gameRoom[roomName]["isTutorial"] = false;
                gameRoom[roomName]["redTeamCount"] = 1;
                gameRoom[roomName]["greenTeamCount"] = 0;
                socket.room = roomName;
                io.socket.emit('updateRoom', {
                    "operation": "create",
                    "roomName": roomName,
                    "roomStatus": gameRoom[roomName]
                });
            }
        });
        socket.on('closeRoom', function (roomName) {
            delete gameRoom[roomName];
            roomCount = roomCount - 1;
            io.socket.emit('updateRoom', {
                "operation": "close",
                "roomName": roomName,
                "roomStatus": {}
            });
        });
        socket.on('joinRoom', function (username, roomName) {
            if (gameRoom[roomName] !== 'undefined') {
                socket.join(roomName);
                var team = void 0;
                if (gameRoom[roomName]["redTeamCount"] > gameRoom[roomName]["greenTeamCount"]) {
                    team = "red";
                    gameRoom[roomName]["redTeamCount"] = gameRoom[roomName]["redTeamCount"] + 1;
                }
                else {
                    team = "green";
                    gameRoom[roomName]["greenTeamCount"] = gameRoom[roomName]["greenTeamCount"] + 1;
                }
                gameRoom[roomName]["players"][username] = {
                    "team": team,
                    "ready": false
                };
                io.socket.emit('updateRoom', {
                    "operation": "update",
                    "roomName": roomName,
                    "roomStatus": gameRoom[roomName]
                });
            }
            else {
                socket.emit('updateRoom', "error when " + username + " join " + roomName);
            }
        });
        socket.on('leaveRoom', function (username) {
            var roomName = socket.room;
            if (gameRoom[roomName] !== 'undefined') {
                if (username === gameRoom[roomName]["director"]) {
                    delete gameRoom[roomName];
                    roomCount = roomCount - 1;
                    io.socket.emit('updateRoom', {
                        "operation": "close",
                        "roomName": roomName,
                        "roomStatus": {}
                    });
                }
                else {
                    var room = gameRoom[roomName];
                    var players = room["players"];
                    if (players[username] !== 'undefined') {
                        if (players[username]["team"] === "red") {
                            gameRoom[roomName]["redTeamCount"] = gameRoom[roomName]["redTeamCount"] - 1;
                        }
                        else {
                            gameRoom[roomName]["greenTeamCount"] = gameRoom[roomName]["greenTeamCount"] - 1;
                        }
                        delete players[username];
                        socket.leave(socket.room);
                        io.socket.emit('updateRoom', {
                            "operation": "update",
                            "roomName": roomName,
                            "roomStatus": gameRoom[roomName]
                        });
                    }
                    else {
                        socket.emit('updateRoom', "error when " + username + " leave " + roomName + " username not found");
                    }
                }
            }
            else {
                socket.emit('updateRoom', "error when " + username + " leave " + roomName + " room name not found");
            }
        });
        socket.on('userReady', function (username, roomName) {
            gameRoom[roomName]["players"][username]["ready"] = true;
        });
        socket.on('userNotReady', function (username, roomName) {
            gameRoom[roomName]["players"][username]["ready"] = false;
        });
        socket.on('startTutorial', function (roomName) {
            var timer;
            if (typeof tutorialRoom[roomName] !== 'undefined') {
                if (tutorialRoom[roomName]["gaming"]) {
                    timer = tutorialRoom[roomName]["timer"];
                }
            }
            else {
                timer = Timer_1.createTimer();
                tutorialRoom[roomName] = {};
                tutorialRoom[roomName]["timer"] = timer;
                var timerFun = setInterval(function () {
                    Timer_1.updateTimer(io, timer, socket);
                }, 1000);
                var problemFun = setInterval(function () {
                    Problem_1.updateProblem(tutorialRoom, roomName);
                    Problem_1.emitProblem(io, roomName, socket, tutorialRoom[roomName]["problem"]);
                }, 5000);
                tutorialRoom[roomName]["timerFun"] = timerFun;
                tutorialRoom[roomName]["problemFun"] = problemFun;
                socket.isTutorial = true;
                tutorialRoom[roomName]["gaming"] = true;
            }
            socket.room = roomName;
            socket.join(roomName);
            Timer_1.updateTimer(io, timer, socket);
            Problem_1.initProblem(tutorialRoom, roomName);
            Problem_1.emitProblem(io, roomName, socket, tutorialRoom[roomName]["problem"]);
        });
        socket.on('startGame', function (roomName) {
            var timer;
            if (typeof gameRoom[roomName] !== 'undefined') {
                if (gameRoom[roomName]["gaming"]) {
                    timer = gameRoom[roomName]["timer"];
                }
                else {
                    timer = Timer_1.createTimer();
                    gameRoom[roomName]["timer"] = timer;
                    var timerFun = setInterval(function () {
                        Timer_1.updateTimer(io, timer, socket);
                    }, 1000);
                    var problemFun = setInterval(function () {
                        Problem_1.updateProblem(gameRoom, roomName);
                        Problem_1.emitProblem(io, roomName, socket, gameRoom[roomName]["problem"]);
                    }, 5000);
                    gameRoom[roomName]["timerFun"] = timerFun;
                    gameRoom[roomName]["problemFun"] = problemFun;
                    gameRoom[roomName]["gaming"] = true;
                }
            }
            socket.room = roomName;
            socket.join(roomName);
            Timer_1.updateTimer(io, timer, socket);
            Problem_1.initProblem(gameRoom, roomName);
            Problem_1.emitProblem(io, roomName, socket, gameRoom[roomName]["problem"]);
        });
        socket.on('closeGame', function (roomName) {
            if (typeof gameRoom[roomName] !== 'undefined') {
                socket.room = "";
                socket.leave(roomName);
                var timerFun = gameRoom[roomName]["timerFun"];
                var problemFun = gameRoom[roomName]["problemFun"];
                clearInterval(timerFun);
                clearInterval(problemFun);
                gameRoom[roomName]["gaming"] = false;
            }
        });
    });
}
exports.createIo = createIo;
