"use strict";
exports.__esModule = true;
var Ramdom_1 = require("./Ramdom");
var problems = {
    "keys": ["basic", "function", "special"],
    "basic": ["<", "==", ">", "%"],
    "function": ["isSquare(x)", "isPrime(x)", "inFibonacci(x)", "isPower2(x)"],
    "special": ["x-2x+1", "x+2x+1"]
};
function updateProblem(io, room, socket) {
    var problem = Ramdom_1.getRandomProblem(problems);
    io.sockets["in"](socket.room).emit('updateProblem', { problem: problem });
}
exports.updateProblem = updateProblem;
