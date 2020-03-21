"use strict";
exports.__esModule = true;
var Tool_1 = require("./Tool");
var Problem_1 = require("./Problem");
var Timer_1 = require("./Timer");
var Random_1 = require("./Random");
var Game = (function () {
    function Game() {
    }
    Game.prototype.joinGameRoom = function (io, socket, gameRoom, roomName) {
        socket.join(roomName + "-game");
        socket.emit("joinGameRoom");
    };
    Game.prototype.startGame = function (io, socket, gameRoom, username, roomName) {
        try {
            gameRoom[roomName]["players"][username]["ready"] = true;
            if (Tool_1.allUserReady(gameRoom[roomName]["players"])) {
                try {
                    if (!gameRoom[roomName]["gaming"]) {
                        var timer_1 = Timer_1.createTimer();
                        gameRoom[roomName]["timer"] = timer_1;
                        gameRoom[roomName]["boardNumber"] = Random_1.getRandomBoardNumber();
                        gameRoom[roomName]["boardTeam"] = Random_1.initBoardTeam();
                        Problem_1.updateProblem(gameRoom, roomName);
                        var timerFun = setInterval(function () {
                            var time = Timer_1.updateTimer(io, timer_1, socket, roomName);
                            Timer_1.closeGame(io, socket, time, gameRoom, roomName);
                        }, 1000);
                        var problemFun = setInterval(function () {
                            Problem_1.updateProblem(gameRoom, roomName);
                            Problem_1.emitProblem(io, socket, roomName, gameRoom[roomName]["problem"]);
                        }, 30000);
                        gameRoom[roomName]["timerFun"] = timerFun;
                        gameRoom[roomName]["problemFun"] = problemFun;
                        gameRoom[roomName]["gaming"] = true;
                    }
                }
                catch (err) {
                    console.log(err);
                }
                io["in"](roomName + "-game").emit('startGame', {
                    roomName: roomName,
                    players: gameRoom[roomName]["players"]
                });
                Timer_1.updateTimer(io, gameRoom[roomName]["timer"], socket, roomName);
                Problem_1.updateProblem(gameRoom, roomName);
                Problem_1.emitProblem(io, socket, roomName, gameRoom[roomName]["problem"]);
                var num = gameRoom[roomName]["boardNumber"];
                var num_flat = Tool_1.flatten(num);
                var team = gameRoom[roomName]["boardTeam"];
                var team_flat = Tool_1.flatten(team);
                this.updateCell(io, socket, gameRoom, roomName, Tool_1.objectToArray({
                    "index": Random_1.getAllIndex(),
                    "number": num_flat,
                    "team": team_flat
                }));
            }
        }
        catch (err) {
            console.log(err);
            socket.emit("startGame", "you are not in any room");
        }
    };
    Game.prototype.getScore = function (io, socket, gameRoom, roomName, point, team) {
        var currentScore = 0;
        if (team === 1) {
            currentScore = gameRoom[roomName]["redPoint"] = gameRoom[roomName]["redPoint"] + point;
        }
        else if (team === 2) {
            currentScore = gameRoom[roomName]["greenPoint"] = gameRoom[roomName]["greenPoint"] + point;
        }
        io["in"](roomName + "-game").emit('updateScore', {
            "team": team,
            "score": currentScore
        });
    };
    Game.prototype.shuffleBoard = function (io, socket, gameRoom, roomName) {
        for (var row = 0; row < 7; ++row) {
            var maxColumn = (7 - Math.abs(row - 3));
            for (var column = 0; column < maxColumn; ++column) {
                if (gameRoom[roomName]["boardTeam"][row][column] === 0)
                    gameRoom[roomName]["boardNumber"][row][column] = Random_1.RandomInt(0, 99);
            }
        }
        var index = Random_1.getAllIndex();
        var num = gameRoom[roomName]["boardNumber"];
        var num_flat = Tool_1.flatten(num);
        var team = gameRoom[roomName]["boardTeam"];
        var team_flat = Tool_1.flatten(team);
        var arr = Tool_1.objectToArray({
            "index": index,
            "number": num_flat,
            "team": team_flat
        });
        io["in"](roomName + "-game").emit('updateCell', {
            data: arr
        });
    };
    Game.prototype.updateCell = function (io, socket, gameRoom, roomName, data) {
        data.forEach(function (element, index, itself) {
            var row = element["index"][0];
            var col = element["index"][1];
            var number = element["number"];
            var team = element["team"];
            gameRoom[roomName]["boardNumber"][row][col] = number % 100;
            gameRoom[roomName]["boardTeam"][row][col] = team;
            itself[index]["number"] = itself[index]["number"] % 100;
        });
        io["in"](roomName + "-game").emit('updateCell', {
            data: data
        });
    };
    Game.prototype.updateBullet = function (io, socket, gameRoom, roomName, data) {
        var username = data["username"];
        var index = data["index"];
        var value = [];
        index.forEach(function (element) {
            var temp = Random_1.updateBullet(gameRoom[roomName]["players"][username]["bullets"], element);
            value.push(temp);
        });
        socket.emit('updateBullet', Tool_1.objectToArray({
            "index": index,
            "bullet": value
        }));
    };
    Game.prototype.getBullet = function (io, socket, gameRoom, roomName, username) {
        socket.emit('updateBullet', Tool_1.objectToArray({
            "index": [0, 1, 2, 3, 4],
            "bullet": gameRoom[roomName]["players"][username]["bullets"]
        }));
    };
    return Game;
}());
exports.Game = Game;
