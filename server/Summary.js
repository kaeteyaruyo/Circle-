"use strict";
exports.__esModule = true;
var Summary = (function () {
    function Summary() {
    }
    Summary.prototype.result = function (io, socket, gameRoom, roomName) {
        var RedTeamPoint;
        var GreenTeamPoint;
        try {
            RedTeamPoint = gameRoom[roomName]["redPoint"];
            GreenTeamPoint = gameRoom[roomName]["greenPoint"];
            socket.emit('summary', {
                "roomName": roomName,
                "redScore": RedTeamPoint,
                "greenScore": GreenTeamPoint
            });
            io.sockets.emit('closeRoom', {
                "roomName": roomName,
                "roomStatus": {}
            });
            gameRoom[roomName]['summaryCount'] += 1;
            if (gameRoom[roomName]['summaryCount'] == Object.keys(gameRoom[roomName]['players']).length) {
                delete gameRoom[roomName];
            }
        }
        catch (err) {
            socket.emit('summary', {
                "roomName": roomName,
                "redScore": 0,
                "greenScore": 0,
                "status": 400
            });
        }
    };
    return Summary;
}());
exports.Summary = Summary;
