// Declare stage (container of layers)
const stageWidth = window.innerWidth;
const stageHeight = window.innerHeight * 0.9;

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
const board = new Konva.RegularPolygon({
    x: stage.width() / 2,
    y: stage.height() * 0.4,
    radius: stage.height() * 0.4,
    sides: 6,
    fill: '#E3E4E5',
});
board.rotate(30);
shapeLayer.add(board);

// Draw magazine
const magazine = new Konva.Rect({
    width: nodeRadius * 2 * 5 + nodeRadius * 6,
    height: nodeRadius * 2 + nodeRadius,
    fill: '#E3E4E5',
});
magazine.x(stage.width() / 2 - magazine.width() / 2);
magazine.y(stage.height() - magazine.height() - 20);
shapeLayer.add(magazine);

// Draw nodes on board
let nodeCounter = 0;
for(let row = -3; row <= 3; ++row){
    let radius = (6 - Math.abs(row))
    for(let colunm = -radius; colunm <= radius; colunm += 2){
        const node = createNode({
            initX: stage.width() / 2 + colunm * nodeRadius,
            initY: stage.height() * 0.4 + row * nodeRadius * Math.sqrt(3),
            fillColor: '#D5D6D8',
            strokeColor: '#BABDBF',
            textColor: '#53575A',
        });

        node.name(`node${ (++nodeCounter).toString() }`);

        shapeLayer.add(node);
    }
}

// Draw nodes in magazine
for(let i = 0; i < 5; ++i){
    createBullet(i);
}

// Fire when start to drag something
stage.on('dragstart', e => {
    const targetNode = e.target

    // Record starting position, return to this position when drop on illegal place
    targetNode.startX = targetNode.x();
    targetNode.startY = targetNode.y();

    targetNode.moveTo(tempLayer);
    shapeLayer.draw();
});

// Fire when dragging something and moving
let previousShape;
stage.on('dragmove', e => {
    const shape = shapeLayer.getIntersection(stage.getPointerPosition());
    if (previousShape && shape) {
        if (previousShape !== shape) {
            // leave from old targer
            previousShape.fire(
                'dragleave',
                {
                    type: 'dragleave',
                    target: previousShape,
                    evt: e.evt
                },
                true
            );

            // enter new targer
            shape.fire(
                'dragenter',
                {
                    type: 'dragenter',
                    target: shape,
                    evt: e.evt
                },
                true
            );
            previousShape = shape;
        }
        else {
            previousShape.fire(
                'dragover',
                {
                    type: 'dragover',
                    target: previousShape,
                    evt: e.evt
                },
                true
            );
        }
    }
    else if (!previousShape && shape) {
        previousShape = shape;
        shape.fire(
            'dragenter',
            {
                type: 'dragenter',
                target: shape,
                evt: e.evt
            },
            true
        );
    }
    else if (previousShape && !shape) {
        previousShape.fire(
            'dragleave',
            {
                type: 'dragleave',
                target: previousShape,
                evt: e.evt
            },
            true
        );
        previousShape = undefined;
    }
});

// Fire when stop dragging something
stage.on('dragend', e => {
    const draggedNode = e.target;
    const droppedShape = shapeLayer.getIntersection(stage.getPointerPosition());
    const droppedNode = droppedShape.getParent();
    if(droppedShape && droppedShape.getParent().name().includes('node')) {
        previousShape.fire(
            'drop',
            {
                type: 'drop',
                target: previousShape,
                evt: e.evt
            },
            true
        );
        // Update dropped node's number
        droppedNode.number += draggedNode.number;
        const droppedtext = droppedNode.findOne('Text');
        droppedtext.text(droppedNode.number);
        droppedtext.offsetX(droppedtext.width() / 2);
        droppedtext.offsetY(droppedtext.height() / 2);

        // Spawn a new bullet and destroy used one
        createBullet(draggedNode.magazineIndex);
        draggedNode.destroy();
    }
    else {
        draggedNode.moveTo(shapeLayer);
        draggedNode.x(draggedNode.startX);
        draggedNode.y(draggedNode.startY);
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

// Generate random integer in 0 - (max - 1)
function randomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

// Create a node
function createNode({ initX, initY, fillColor, strokeColor, textColor }){
    // Create a node (container of circle and text and data)
    const node = new Konva.Group({
        x: initX,
        y: initY
    });
    node.number = randomInt(10);

    // Create a circle
    const circle = new Konva.Circle({
        radius: nodeRadius,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: 1,
    });

    // Create a text label to display number
    const text = new Konva.Text({
        text: node.number.toString(),
        fontSize: 50,
        fontFamily: 'Work Sans',
        fill: textColor,
    });
    text.offsetX(text.width() / 2);
    text.offsetY(text.height() / 2);
    node.add(circle);
    node.add(text);
    return node;
}

function createBullet(index){
    const node = createNode({
        initX: magazine.x() + nodeRadius  * 2 + index * nodeRadius * 3,
        initY: magazine.y() + nodeRadius * 1.5,
        fillColor: '#F4733D',
        strokeColor: '#913108',
        textColor: '#FCDCCF',
    });

    node.magazineIndex = index;
    node.draggable(true)

    node.on('mouseover', () => {
        document.body.style.cursor = 'pointer';
    });
    node.on('mouseout', () => {
        document.body.style.cursor = 'default';
    });

    shapeLayer.add(node);
}