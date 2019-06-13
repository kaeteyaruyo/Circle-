"use strict";
exports.__esModule = true;
function getRangeRandom(min, max) {
    return Math.floor(Math.random() * max) + min;
}
exports.getRangeRandom = getRangeRandom;
;
function getRandomProblem(problems) {
    var keys = problems['keys'];
    var indexOfKeys = getRangeRandom(0, 2);
    var problemOfClass = keys[indexOfKeys];
    var problemList = problems[problemOfClass];
    if (problemOfClass === "basic") {
        var index = getRangeRandom(0, problemList.length);
        var problem = problemList[index];
        if (problem === "%") {
            var n = getRangeRandom(0, 100);
            var m = getRangeRandom(0, n);
            return "x % " + n + " == " + m;
        }
        else {
            var n = getRangeRandom(0, 99);
            return "x " + problem + " " + n;
        }
    }
    else if (problemOfClass === "function") {
        var index = getRangeRandom(0, problemList.length);
        var problem = problemList[index];
        return problem;
    }
    else if (problemOfClass === "special") {
        var index = getRangeRandom(0, problemList.length);
        var problem = problemList[index];
        if (problem === "x+2x+1") {
            var n = getRangeRandom(1, 11);
            return "x+2*x+1 == " + (n + 1) * (n + 1);
        }
        else if (problem === "x-2x+1") {
            var n = getRangeRandom(1, 11);
            return "x-2*x+1 == " + (n - 1) * (n + 1);
        }
    }
}
exports.getRandomProblem = getRandomProblem;
;
function getRandomBoardNumber() {
    var result = [];
    for (var row = 0; row < 7; ++row) {
        var maxColumn = (7 - Math.abs(row - 3));
        var temp = [];
        for (var column = 0; column < maxColumn; ++column) {
            temp.push(getRangeRandom(1, 100));
        }
        result.push(temp);
    }
    return result;
}
exports.getRandomBoardNumber = getRandomBoardNumber;
function initBoardTeam() {
    return [
        [0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0],
    ];
}
exports.initBoardTeam = initBoardTeam;
function initBullet() {
    return [getRangeRandom(0, 13), getRangeRandom(0, 13), getRangeRandom(0, 13), getRangeRandom(0, 13), getRangeRandom(0, 13)];
}
exports.initBullet = initBullet;
function updateBullet(Bullet, index) {
    var value = getRangeRandom(0, 10);
    if (value === 0) {
        var temp = getRangeRandom(0, 3);
        value = [10, 11, 12, 13][temp];
    }
    Bullet[index] = value;
    return value;
}
exports.updateBullet = updateBullet;
function getAllIndex() {
    var result = [];
    for (var row = 0; row < 7; ++row) {
        var maxColumn = (7 - Math.abs(row - 3));
        for (var column = 0; column < maxColumn; ++column) {
            result.push([row, column]);
        }
    }
    return result;
}
exports.getAllIndex = getAllIndex;
