import { createStage, } from '/js/game/stage.js'
import { passGlobalVariableToCell, createCell, cellUpdateQuiz } from '/js/game/cell.js'
import { passGlobalVariableToBullet, createBullet } from '/js/game/bullet.js'

const socket = io(window.location.origin);
const stage = createStage(window.innerWidth, window.innerHeight - document.querySelector('.main__scoreboard').offsetHeight, createBullet);
const shapeLayer = stage.findOne('.shapeLayer');
const username = /Hi, ([\S]+)!/.exec(document.querySelector('.header__username').innerHTML)[1];
const roomname = /\/game\/([\S]+)/.exec(window.location.pathname)[1];
let team = 0;

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

socket.emit('startGame', username, roomname);

socket.emit('updateBullet', roomname, {
    username,
    index: [0, 1, 2, 3, 4],
});

socket.on('startGame', (res) => {
    if(isInRoom(res.roomName) && res.players[username] !== undefined) {
        team = res.players[username].team;
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
    console.log(res);
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
    }
});

socket.on('updateBullet', (res) => {
    console.log(res);
    res.forEach(bulletInfo => {
        shapeLayer.add(createBullet({
            index: bulletInfo.index,
            number: bulletInfo.bullet,
            team: team,
        }));
    });
});

socket.on('stopGame', (res) => {
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