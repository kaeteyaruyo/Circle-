"use strict";
exports.__esModule = true;
var fs = require("fs");
var Ramdom_1 = require("./Ramdom");
var path = require("path");
function updateProblem(io) {
    fs.readFile(path.join(__dirname, './problems.json'), function (err, data) {
        if (err)
            throw err;
        var problems = JSON.parse(data.toString());
        var problem = Ramdom_1.getRandomProblem(problems);
        io.sockets.emit('updateProblem', { problem: problem });
    });
}
exports.updateProblem = updateProblem;
