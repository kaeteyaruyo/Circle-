"use strict";
exports.__esModule = true;
var Problem_1 = require("./Problem");
var Timer_1 = require("./Timer");
var Random_1 = require("./Random");
var Tool_1 = require("./Tool");
module.exports = (function () {
    function CircleIO() {
        this.gameRoom = {};
        this.roomCount = 0;
        this.tutorialRoom = {};
    }
    CircleIO.prototype.createIo = function (io) {
        var _this = this;
        io.sockets.on('connection', function (socket) {
            socket.on('createRoom', function (username, isTutorial) {
                _this.createRoom(io, socket, username, isTutorial);
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
            socket.on('enterLobby', function () {
                _this.enterLobby(io, socket);
            });
            socket.on('setUserReady', function (username, roomName) {
                _this.setUserReady(io, socket, username, roomName);
            });
            socket.on('unsetUserReady', function (username, roomName) {
                _this.unsetUserReady(io, socket, username, roomName);
            });
            socket.on('enterGame', function (roomName) {
                _this.enterGame(io, socket, roomName);
            });
            socket.on('initGame', function (roomName) {
                _this.initGame(io, socket, roomName);
            });
            socket.on('startGame', function (username, roomName) {
                socket.room = roomName;
                socket.join(roomName, function () {
                    console.log(socket.adapter.rooms);
                    _this.startGame(io, socket, username, roomName);
                });
            });
            socket.on('getScore', function (roomName, point, team) {
                _this.getScore(io, socket, roomName, point, team);
            });
            socket.on('shuffleBoard', function (roomName) {
                _this.shuffleBoard(io, socket, roomName);
            });
            socket.on('updateCell', function (roomName, data) {
                _this.updateCell(io, socket, roomName, data);
            });
            socket.on('updateBullet', function (roomName, data) {
                _this.updateBullet(io, socket, roomName, data);
            });
        });
    };
    CircleIO.prototype.createRoom = function (io, socket, username, isTutorial) {
        if (this.gameRoom[username] !== undefined) {
            socket.emit('createRoom', "error roomName conflict");
        }
        else {
            this.roomCount = this.roomCount + 1;
            this.gameRoom[username] = {};
            this.gameRoom[username]["players"] = {};
            this.gameRoom[username]["owner"] = username;
            this.gameRoom[username]["gaming"] = false;
            this.gameRoom[username]["redTeamCount"] = 0;
            this.gameRoom[username]["greenTeamCount"] = 0;
            this.gameRoom[username]["redPoint"] = 0;
            this.gameRoom[username]["greenPoint"] = 0;
            this.gameRoom[username]["isTutorial"] = isTutorial;
            if (isTutorial) {
                this.gameRoom[username]["players"][username] = {
                    "team": 1,
                    "ready": false,
                    "bullets": [0, 0, 0, 0, 0]
                };
                this.gameRoom[username]["redTeamCount"] = 1;
            }
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
        socket.room = roomName;
        var thisRoom = this.gameRoom[roomName];
        var joinPerson = username;
        if (thisRoom !== undefined) {
            socket.join(roomName);
            var team = void 0;
            if (thisRoom["redTeamCount"] > thisRoom["greenTeamCount"]) {
                team = 2;
                thisRoom["greenTeamCount"] = thisRoom["greenTeamCount"] + 1;
            }
            else {
                team = 1;
                thisRoom["redTeamCount"] = thisRoom["redTeamCount"] + 1;
            }
            thisRoom["players"][username] = {
                "team": team,
                "ready": false,
                "bullets": [0, 0, 0, 0, 0]
            };
            io.sockets.emit('joinRoom', {
                "joinedPlayer": username,
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
        if (thisRoom !== undefined) {
            var players = thisRoom["players"];
            if (players[username] !== undefined) {
                if (players[username]["team"] === 1) {
                    thisRoom["redTeamCount"] = thisRoom["redTeamCount"] - 1;
                }
                else {
                    thisRoom["greenTeamCount"] = thisRoom["greenTeamCount"] - 1;
                }
                delete players[username];
                socket.leave(socket.room);
                io.sockets.emit('leaveRoom', {
                    "leavedPlayer": username,
                    "roomName": roomName,
                    "roomStatus": thisRoom
                });
            }
            else {
                socket.emit('leaveRoom', "error when " + username + " leave " + roomName + " username not found");
            }
        }
    };
    CircleIO.prototype.enterLobby = function (io, socket) {
        var _this = this;
        var rooms = Object.keys(this.gameRoom);
        var players = [];
        var result = [];
        rooms.forEach(function (element) {
            var number = Object.keys(_this.gameRoom[element]["players"]).length;
            result.push({
                roomName: element,
                attendance: number
            });
        });
        socket.emit('enterLobby', {
            rooms: result
        });
    };
    CircleIO.prototype.setUserReady = function (io, socket, username, roomName) {
        this.gameRoom[roomName]["players"][username]["ready"] = true;
    };
    CircleIO.prototype.unsetUserReady = function (io, socket, username, roomName) {
        this.gameRoom[roomName]["players"][username]["ready"] = false;
    };
    CircleIO.prototype.enterGame = function (io, socket, roomName) {
        console.log("enterGame");
        io.sockets.to(roomName).emit('enterGame', {
            "roomName": roomName
        });
    };
    CircleIO.prototype.initGame = function (io, socket, roomName) {
        var _this = this;
        var timer;
        if (this.gameRoom[roomName] !== undefined) {
            if (this.gameRoom[roomName]["gaming"]) {
                timer = this.gameRoom[roomName]["timer"];
            }
            else {
                timer = Timer_1.createTimer();
                this.gameRoom[roomName]["timer"] = timer;
                this.gameRoom[roomName]["boardNumber"] = Random_1.getRandomBoardNumber();
                this.gameRoom[roomName]["boardTeam"] = Random_1.initBoardTeam();
                var timerFun = setInterval(function () {
                    var time = Timer_1.updateTimer(io, timer, socket, roomName);
                    Timer_1.closeGame(io, socket, time, _this.gameRoom, roomName);
                }, 1000);
                var problemFun = setInterval(function () {
                    Problem_1.updateProblem(_this.gameRoom, roomName);
                    Problem_1.emitProblem(io, roomName, socket, _this.gameRoom[roomName]["problem"]);
                }, 30000);
                this.gameRoom[roomName]["timerFun"] = timerFun;
                this.gameRoom[roomName]["problemFun"] = problemFun;
                this.gameRoom[roomName]["gaming"] = true;
            }
        }
    };
    CircleIO.prototype.startGame = function (io, socket, username, roomName) {
        console.log('startGame', username);
        if (roomName === undefined)
            socket.emit("startGame", "you are not in any room");
        else {
            if (this.gameRoom[roomName]["isTutorial"]) {
                this.initGame(io, socket, roomName);
                io.sockets.to(roomName).emit('startGame', this.gameRoom[roomName]["players"]);
                Timer_1.updateTimer(io, this.gameRoom[roomName]["timer"], socket, roomName);
                Problem_1.initProblem(this.gameRoom, roomName);
                Problem_1.emitProblem(io, roomName, socket, this.gameRoom[roomName]["problem"]);
                this.updateCell(io, socket, roomName, Tool_1.objectToArray({
                    "index": Random_1.getAllIndex(),
                    "number": this.gameRoom[roomName]["boardNumber"],
                    "team": this.gameRoom[roomName]["boardTeam"]
                }));
                console.log(Tool_1.objectToArray({
                    "index": Random_1.getAllIndex(),
                    "number": this.gameRoom[roomName]["boardNumber"],
                    "team": this.gameRoom[roomName]["boardTeam"]
                }));
                console.log(roomName);
            }
            else {
                this.gameRoom[roomName]["players"][username]["ready"] = true;
                if (Tool_1.allUserReady(this.gameRoom[roomName]["players"])) {
                    this.initGame(io, socket, roomName);
                    io.sockets.to(roomName).emit('startGame', this.gameRoom[roomName]["players"]);
                    Timer_1.updateTimer(io, this.gameRoom[roomName]["timer"], socket, roomName);
                    Problem_1.initProblem(this.gameRoom, roomName);
                    Problem_1.emitProblem(io, roomName, socket, this.gameRoom[roomName]["problem"]);
                    var num = this.gameRoom[roomName]["boardNumber"];
                    var num_flat = Tool_1.flatten(num);
                    var team = this.gameRoom[roomName]["boardTeam"];
                    var team_flat = Tool_1.flatten(team);
                    console.log(Tool_1.objectToArray({
                        "index": Random_1.getAllIndex(),
                        "number": num_flat,
                        "team": team_flat
                    }));
                    console.log(roomName);
                    this.updateCell(io, socket, roomName, Tool_1.objectToArray({
                        "index": Random_1.getAllIndex(),
                        "number": num_flat,
                        "team": team_flat
                    }));
                }
            }
        }
    };
    CircleIO.prototype.getScore = function (io, socket, roomName, team, score) {
        var currentScore;
        if (team === 1) {
            currentScore = this.gameRoom[roomName]["redPoint"] = this.gameRoom[roomName]["redPoint"] + score;
        }
        else if (team === 2) {
            currentScore = this.gameRoom[roomName]["greenPoint"] = this.gameRoom[roomName]["greenPoint"] + score;
        }
        io.sockets.to(socket.room).emit('updateScore', {
            "team": team,
            "score": currentScore
        });
    };
    CircleIO.prototype.shuffleBoard = function (io, socket, roomName) {
        var boardNumber = Random_1.getRandomBoardNumber();
        this.gameRoom[roomName]["boardNumber"] = boardNumber;
        var index = Random_1.getAllIndex();
        io.sockets.to(roomName).emit('updateCell', Tool_1.objectToArray({
            "index": index,
            "number": this.gameRoom[roomName]["boardNumber"],
            "team": this.gameRoom[roomName]["boardTeam"]
        }));
    };
    CircleIO.prototype.updateCell = function (io, socket, roomName, data) {
        var _this = this;
        data.forEach(function (element) {
            var row = element["index"][0];
            var col = element["index"][1];
            var number = element["number"];
            var team = element["team"];
            _this.gameRoom[roomName]["boardNumber"][row][col] = number;
            _this.gameRoom[roomName]["boardTeam"][row][col] = team;
        });
        io.sockets.to(roomName).emit('updateCell', data);
    };
    CircleIO.prototype.summary = function (io, socket, roomName) {
        io.sockets.to(roomName).emit('summary', {
            "redScore": this.gameRoom[roomName]["redPoint"],
            "greenScore": this.gameRoom[roomName]["greenPoint"]
        });
    };
    CircleIO.prototype.updateBullet = function (io, socket, roomName, data) {
        var _this = this;
        var username = data["username"];
        var index = data["index"];
        var value = [];
        console.log(this.gameRoom[roomName]["players"][username]["bullets"]);
        index.forEach(function (element) {
            var temp = Random_1.updateBullet(_this.gameRoom[roomName]["players"][username]["bullets"], element);
            value.push(temp);
        });
        console.log(this.gameRoom[roomName]["players"][username]["bullets"]);
        socket.emit('updateBullet', {
            "index": index,
            "bullet": value
        });
    };
    return CircleIO;
}());
