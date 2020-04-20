function updateTimer(io,Timer,socket,roomName){
    let now = new Date().getTime();
    let start = Timer.getTime();
    let passTime = 180 - Math.floor((now - start)/1000);
    let min = Math.floor(passTime / 60)
    let sec = Math.floor(passTime % 60)
    io.in(`${roomName}-game`).emit('updateTimer', { 
        min: min,
        sec: sec,
    });
    return passTime;
}

function createTimer(){
    return new Date();
}
function closeGame(io,socket,time,gameRoom,roomName){
    if(time <= 0){
        let summary = gameRoom[roomName];
        io.in(`${roomName}-game`).emit('gameOver',{
            "roomName" : roomName,
        });
        if(gameRoom[roomName] !== undefined){
            socket.room = "";
            socket.leave(roomName);
            let timerFun = gameRoom[roomName]["timerFun"];
            let problemFun = gameRoom[roomName]["problemFun"];
            clearInterval(timerFun);
            clearInterval(problemFun);
            gameRoom[roomName]["gaming"] = false;   
        }
    }
}

export {updateTimer,createTimer,closeGame}