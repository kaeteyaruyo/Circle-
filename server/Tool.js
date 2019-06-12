"use strict";
exports.__esModule = true;
function allUserReady(players) {
    var usernames = Object.keys(players);
    var flag = true;
    usernames.forEach(function (username) {
        if (!players[username]["ready"]) {
            flag = false;
        }
    });
    return flag;
}
exports.allUserReady = allUserReady;
function objectToArray(object) {
    var result = [];
    var first = Object.keys(object)[0];
    var keys = Object.keys(object);
    var arr = object[first];
    var temp;
    for (var i = 0; i < arr.length; i++) {
        temp = {};
        for (var j = 0; j < keys.length; j++) {
            temp[keys[j]] = object[keys[j]][i];
        }
        result.push(temp);
    }
    return result;
}
exports.objectToArray = objectToArray;
