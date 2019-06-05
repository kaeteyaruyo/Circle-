import { passGlobalVariableToCell, createCell } from '/js/game/cell.js'
import { passGlobalVariableToBullet, createBullet } from '/js/game/bullet.js'

// Declare stage (container of layers)
const stageWidth = window.innerWidth;
const stageHeight = window.innerHeight * 0.85;

const stage = new Konva.Stage({
    container: 'main__canvas',
    width: stageWidth,
    height: stageHeight
});
const nodeRadius = stage.height() * 0.05;

// Declare shape layer (container of shapes)
const shapeLayer = new Konva.Layer();
stage.add(shapeLayer);

// Declare temp layer for drop detection
const tempLayer = new Konva.Layer();
stage.add(tempLayer);

// Draw chessboard
const chessboard = new Konva.RegularPolygon({
    x: stage.width() / 2,
    y: stage.height() * 0.4,
    radius: stage.height() * 0.4,
    sides: 6,
    fill: '#E3E4E5',
});
chessboard.rotate(30);
shapeLayer.add(chessboard);

// Draw magazine
const magazine = new Konva.Rect({
    width: nodeRadius * 2 * 5 + nodeRadius * 6,
    height: nodeRadius * 2 + nodeRadius,
    fill: '#E3E4E5',
});
magazine.x(stage.width() / 2 - magazine.width() / 2);
magazine.y(stage.height() - magazine.height() - 20);
shapeLayer.add(magazine);

// Draw cell on chessboard
passGlobalVariableToCell({
    stage,
    shape_layer: shapeLayer
});
for(let row = 0; row < 7; ++row){
    let maxColumn = (7 - Math.abs(row - 3));
    for(let column = 0; column < maxColumn; ++column){
        const cell = createCell({
            row,
            column,
            stageWidth: stage.width(),
            stageHeight: stage.height(),
            shapeLayer,
        });

        shapeLayer.add(cell);
    }
}

// Draw nodes in magazine
passGlobalVariableToBullet({
    stage,
    shape_layer: shapeLayer
});
for(let i = 0; i < 5; ++i){
    shapeLayer.add(createBullet({
        index: i,
        team: 1,
        originX: magazine.x(),
        originY: magazine.y(),
    }));
}

shapeLayer.draw();

// Fire when start to drag something
stage.on('dragstart', e => {
    e.target.moveTo(tempLayer);
    shapeLayer.draw();
});

// Fire when dragging something and moving
let previousShape;
stage.on('dragmove', e => {
    const shape = shapeLayer.getIntersection(stage.getPointerPosition());
    if (previousShape && shape) {
        if (previousShape !== shape) {
            // // leave from old targer
            // previousShape.fire(
            //     'dragleave',
            //     {
            //         type: 'dragleave',
            //         target: previousShape,
            //         evt: e.evt
            //     },
            //     true
            // );

            // // enter new targer
            // shape.fire(
            //     'dragenter',
            //     {
            //         type: 'dragenter',
            //         target: shape,
            //         evt: e.evt
            //     },
            //     true
            // );
            previousShape = shape;
        }
        else {
            // previousShape.fire(
            //     'dragover',
            //     {
            //         type: 'dragover',
            //         target: previousShape,
            //         evt: e.evt
            //     },
            //     true
            // );
        }
    }
    else if (!previousShape && shape) {
        previousShape = shape;
        // shape.fire(
        //     'dragenter',
        //     {
        //         type: 'dragenter',
        //         target: shape,
        //         evt: e.evt
        //     },
        //     true
        // );
    }
    else if (previousShape && !shape) {
        // previousShape.fire(
        //     'dragleave',
        //     {
        //         type: 'dragleave',
        //         target: previousShape,
        //         evt: e.evt
        //     },
        //     true
        // );
        previousShape = undefined;
    }
});

// Fire when stop dragging something
stage.on('dragend', e => {
    // DroppedShape may be circle or text, which is cell's children shape
    const droppedShape = shapeLayer.getIntersection(stage.getPointerPosition());
    const cell = droppedShape ? droppedShape.getParent() : null;
    const bullet = e.target;

    if(cell && cell.name().includes('cell') && cell.owner == 0){
        previousShape.fire(
            'drop',
            {
                type: 'drop',
                target: previousShape,
                evt: e.evt
            },
            true
        );

        // Add number to cell
        cell.addNumber(bullet.number, bullet.team);

        // Spawn a new bullet and destroy used one
        shapeLayer.add(createBullet({
            index: bullet.bulletIndex,
            team: bullet.team,
            originX: magazine.x(),
            originY: magazine.y(),
        }));
        bullet.destroy();
    }
    else {
        bullet.moveTo(shapeLayer);
        bullet.reset();
    }

    previousShape = undefined;
    shapeLayer.draw();
    tempLayer.draw();
});

// // Fire when drag something enter node on chessboard
// stage.on('dragenter', e => {
//     shapeLayer.draw();
// });

// // Fire when drag something leave node on chessboard
// stage.on('dragleave', e => {
//     shapeLayer.draw();
// });

// // Fire when drag something and moving over something
// stage.on('dragover', e => {
//     shapeLayer.draw();
// });

// // Fire when drop something on something
// stage.on('drop', e => {
//     shapeLayer.draw();
// });

fitStageIntoParentContainer();
window.addEventListener('resize', fitStageIntoParentContainer);

// Rescale when window size change
function fitStageIntoParentContainer() {
    const scale = document.querySelector('.main__content').offsetWidth / stageWidth;
    stage.width(stageWidth * scale);
    stage.height(stageHeight * scale);
    stage.scale({ x: scale, y: scale });
    stage.draw();
}
