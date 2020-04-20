class Summary {
    protected result(io: any, socket: any, gameRoom: object, roomName: string) :void{
        let RedTeamPoint;
        let GreenTeamPoint;
        try {
            RedTeamPoint = gameRoom[roomName]["redPoint"];
            GreenTeamPoint = gameRoom[roomName]["greenPoint"];
            socket.emit('summary',{
                "roomName" : roomName,
                "redScore" : RedTeamPoint,
                "greenScore" : GreenTeamPoint
            });
            io.sockets.emit('closeRoom',{
                "roomName" : roomName,
                "roomStatus" : {}
            });
            gameRoom[roomName]['summaryCount'] += 1;
            if(gameRoom[roomName]['summaryCount'] == Object.keys(gameRoom[roomName]['players']).length) {
                delete gameRoom[roomName];
            }
        } catch (err) {
            socket.emit('summary',{
                "roomName" : roomName,
                "redScore" : 0,
                "greenScore" : 0,
                "status": 400
            });
        }
    }
}

export {Summary}