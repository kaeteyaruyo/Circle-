const fillColor = [ '#D5D6D8', '#F4733D', '#38595E', ];
const strokeColor = [ '#BABDBF', '#913108', '#111B1D', ];
const textColor = [ '#53575A', '#FCDCCF', '#DFEAEC', ];

let shapeLayer = null;
let stageWidth = null;
let stageHeight = null;
let nodeRadius = null;

function passGlobalVariableToBullet({ stage, shape_layer, }){
    stageWidth = stage.width();
    stageHeight = stage.height();
    shapeLayer = shape_layer;
    nodeRadius = stage.height() * 0.05;
}
function createBullet({ index, team, originX, originY, }){
    // Create bullet object
    const bullet = new Konva.Group({
        x: originX + nodeRadius  * 2 + index * nodeRadius * 3,
        y: originY + nodeRadius * 1.5,
        draggable: true,
    });

    // Add member variable
    bullet.name(`bullet${ index }`);
    bullet.bulletIndex = index;
    bullet.team = team;
    bullet.number = randomInt(10);
    bullet.startX = bullet.x();
    bullet.startY = bullet.y();

    bullet.add(new Konva.Circle({
        radius: nodeRadius,
        fill: fillColor[team],
        stroke: strokeColor[team],
        strokeWidth: 1,
    }));

    const text = new Konva.Text({
        text: bullet.number.toString(),
        fontSize: 50,
        fontFamily: 'Work Sans',
        fill: textColor[team],
    });

    text.offsetX(text.width() / 2);
    text.offsetY(text.height() / 2);

    bullet.add(text);

    // Add member function
    bullet.reset = function(){
        this.x(this.startX);
        this.y(this.startY);
    }

    // Add event listener
    bullet.on('mouseover', () => {
        document.body.style.cursor = 'pointer';
    });
    bullet.on('mouseout', () => {
        document.body.style.cursor = 'default';
    });

    return bullet;
}

// Generate random integer in 0 - (max - 1)
function randomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

export { passGlobalVariableToBullet, createBullet, };