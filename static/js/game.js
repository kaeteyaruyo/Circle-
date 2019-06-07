import { createStage, } from '/js/game/stage.js'
import { passGlobalVariableToCell, createCell, cellUpdateQuiz } from '/js/game/cell.js'
import { passGlobalVariableToBullet, createBullet } from '/js/game/bullet.js'

const socket = io(window.location.origin);
const stage = createStage(window.innerWidth, window.innerHeight * 0.85, createBullet);
const shapeLayer = stage.findOne('.shapeLayer');

socket.on('updateTimer', (timer) => {
    stage.updateTimer(`${ timer.min }:${ timer.sec.toString().padStart(2, '0') }`);
});

socket.on('updateProblem', (data) => {
    stage.updateQuiz(data.problem);
    cellUpdateQuiz(data.problem);
});

socket.emit('startGame', "learningRoom");


// Draw cell on chessboard
passGlobalVariableToCell({
    center_x: stage.findOne('.chessboard').x(),
    center_y: stage.findOne('.chessboard').y(),
    shape_layer: shapeLayer,
    node_radius: stage.nodeRadius,
});
for(let row = 0; row < 7; ++row){
    let maxColumn = (7 - Math.abs(row - 3));
    for(let column = 0; column < maxColumn; ++column){
        shapeLayer.add(createCell({
            row,
            column,
        }));
    }
}

// Draw nodes in magazine
passGlobalVariableToBullet({
    node_radius: stage.nodeRadius,
    origin_x: stage.findOne('.magazine').x(),
    origin_y: stage.findOne('.magazine').y(),
});
for(let i = 0; i < 5; ++i){
    shapeLayer.add(createBullet({
        index: i,
        team: 1,
    }));
}

stage.fitStageIntoParentContainer();
window.addEventListener('resize', stage.fitStageIntoParentContainer);
