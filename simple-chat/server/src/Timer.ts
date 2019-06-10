function updateTimer(io,Timer,socket){
    let now = new Date().getTime();
    let start = Timer.getTime();
    let passTime = 300 - Math.floor((now - start)/1000);
    let min = Math.floor(passTime / 60)
    let sec = Math.floor(passTime % 60)
    io.sockets.in(socket.room).emit('updateTimer', { 
        min: min,
        sec: sec,
    });
    return passTime;
}

function createTimer(){
    return new Date();
}
function closeGame(io,socket,time,roomInfo){
    if(time <= 0){
        let summary = roomInfo;
        io.sockets.in(socket.room).emit('GameOver', summary);
    }
}

export {updateTimer,createTimer,closeGame}