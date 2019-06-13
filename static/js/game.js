import { createStage, } from '/js/game/stage.js'
import { passGlobalVariableToCell, createCell, cellUpdateQuiz } from '/js/game/cell.js'
import { passGlobalVariableToBullet, createBullet } from '/js/game/bullet.js'

let team = 0;
const username = /Hi, ([\S]+)!/.exec(document.querySelector('.header__username').innerHTML)[1];
const roomname = /\/game\/([\S]+)/.exec(window.location.pathname)[1];
const socket = io(window.location.origin);
const stage = createStage({
    width: window.innerWidth,
    height: window.innerHeight - document.querySelector('.main__scoreboard').offsetHeight,
    username,
    roomname,
    socket,
});
const shapeLayer = stage.findOne('.shapeLayer');

socket.emit('startGame', username, roomname);

socket.on('startGame', (res) => {
    if(isInRoom(res.roomName) && res.players[username] !== undefined) {
        team = res.players[username].team;
        passGlobalVariableToCell({
            user_name: username,
            user_team: team,
            room_name: roomname,
            center_x: stage.findOne('.chessboard').x(),
            center_y: stage.findOne('.chessboard').y(),
            shape_layer: shapeLayer,
            node_radius: stage.nodeRadius,
            socket_: socket,
        });

        passGlobalVariableToBullet({
            node_radius: stage.nodeRadius,
            origin_x: stage.findOne('.magazine').x(),
            origin_y: stage.findOne('.magazine').y(),
        });
        socket.emit('getBullet', roomname, username);
    }
});

socket.on('updateTimer', (res) => {
    if(isInRoom(res.roomName)) {
        stage.updateTimer(`${ res.min }:${ res.sec.toString().padStart(2, '0') }`);
    }
});

socket.on('updateQuiz', (res) => {
    if(isInRoom(res.roomName)){
        stage.updateQuiz(res.problem);
        cellUpdateQuiz(res.problem);
    }
});

socket.on('updateScore', (res) => {
    if(isInRoom(res.roomName) && res.team === team)
        stage.updateScore(res.score);
});

socket.on('updateCell', (res) => {
    console.log(res)
    if(isInRoom(res.roomName)){
        res.data.forEach(cellInfo => {
            const cell = shapeLayer.findOne(`#cell${ cellInfo.index[0] }_${ cellInfo.index[1] }`);
            if(cell){
                cell.update(cellInfo.number, cellInfo.team);
            }
            else {
                shapeLayer.add(createCell({
                    row: cellInfo.index[0],
                    column: cellInfo.index[1],
                    number: cellInfo.number,
                }));
            }
        });
        shapeLayer.draw();
    }
});

socket.on('updateBullet', (res) => {
    res.forEach(bulletInfo => {
        shapeLayer.add(createBullet({
            index: bulletInfo.index,
            number: bulletInfo.bullet,
            team: team,
        }));
    });
    shapeLayer.draw();
});

socket.on('gameOver', (res) => {
    if(isInRoom(res.roomName)){
        document.querySelector('.main__timesup').style.display = 'block';
        setTimeout(() => {
            window.location.href = `/summary/${ roomname }`;
        }, 3000);
    }
});

stage.fitStageIntoParentContainer();
window.addEventListener('resize', stage.fitStageIntoParentContainer);

function isInRoom(roomName){
    return roomname === roomName;
}