"use strict";
exports.__esModule = true;
var Random_1 = require("./Random");
var problems = {
    "keys": ["basic", "function"],
    "basic": ["<", "==", ">", "%"],
    "function": ["isSquare(x)", "isPrime(x)", "inFibonacci(x)", "isPower2(x)"]
};
function updateProblem(gameRoom, roomName) {
    gameRoom[roomName]["problem"] = Random_1.getRandomProblem(problems);
}
exports.updateProblem = updateProblem;
function emitProblem(io, socket, roomName, problem) {
    io["in"](roomName + "-game").emit('updateQuiz', {
        "problem": problem
    });
}
exports.emitProblem = emitProblem;
function initProblem(gameRoom, roomName) {
    if (gameRoom[roomName]["problem"] === undefined) {
        updateProblem(gameRoom, roomName);
    }
}
exports.initProblem = initProblem;
