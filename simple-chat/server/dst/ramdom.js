"use strict";
exports.__esModule = true;
function getRangeRandom(min, max) {
    return Math.floor(Math.random() * max) + min;
}
exports.getRangeRandom = getRangeRandom;
;
function getRandomProblem(problems) {
    var keys = problems['keys'];
    var indexOfKeys = getRangeRandom(0, 3);
    var problemOfClass = keys[indexOfKeys];
    var problemList = problems[problemOfClass];
    if (problemOfClass === "basic") {
        var index = getRangeRandom(0, problemList.length - 1);
        var problem = problemList[index];
        if (problem === "%") {
            var n = getRangeRandom(0, 100);
            var m = getRangeRandom(0, n);
            return "x % " + n + " = " + m;
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
            return "x+2x+1 = " + (n + 1) * (n + 1);
        }
        else if (problem === "x-2x+1") {
            var n = getRangeRandom(1, 11);
            return "x-2x+1 = " + (n - 1) * (n + 1);
        }
    }
}
exports.getRandomProblem = getRandomProblem;
;
