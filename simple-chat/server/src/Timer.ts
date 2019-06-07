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
}

function createTimer(){
    return new Date();
}

export {updateTimer,createTimer}