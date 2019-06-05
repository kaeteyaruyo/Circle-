function updateTimer(io){
    let date = new Date();
    io.sockets.emit('updateTimer', { 
        hour: date.getHours(),
        min: date.getMinutes(),
        sec: date.getSeconds(),
    });
}

export {updateTimer}