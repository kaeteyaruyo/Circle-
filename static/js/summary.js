const socket = io(window.location.origin);
const roomname = /\/summary\/([\S]+)/.exec(window.location.pathname)[1];
const username =  /Hi, ([\S]+)!/.exec(document.querySelector('.header__username').innerHTML)[1];

socket.emit('summary', roomname);

socket.on('summary', res => {
    if(roomname === res.roomName){
        document.querySelector('.main__score--team1').innerHTML = res.redScore;
        document.querySelector('.main__score--team2').innerHTML = res.greenScore;
        if(res.redScore == res.greenScore){
            document.querySelector('.main__winner').innerHTML = 'Even !!';
        }
        else if(res.redScore > res.greenScore){
            document.querySelector('.main__winner').innerHTML = 'Red team win!!';
        }
        else{
            document.querySelector('.main__winner').innerHTML = 'Green team win!!';
        }
    }
});

document.querySelector('.main__ok').addEventListener('click', () => {
    window.location.href = '/lobby';
});