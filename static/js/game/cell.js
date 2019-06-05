const fillColor = [ '#D5D6D8', '#F4733D', '#38595E', ];
const strokeColor = [ '#BABDBF', '#913108', '#111B1D', ];
const textColor = [ '#53575A', '#FCDCCF', '#DFEAEC', ];

let shapeLayer = null;
let stageWidth = null;
let stageHeight = null;
let nodeRadius = null;
let score = 0;

function passGlobalVariableToCell({ stage, shape_layer, }){
    stageWidth = stage.width();
    stageHeight = stage.height();
    shapeLayer = shape_layer;
    nodeRadius = stage.height() * 0.05;
}

function createCell({ row, column, }){
    // Create cell object
    const cell = new Konva.Group({
        x: stageWidth / 2 + (Math.abs(row - 3) - 6 + 2 * column) * nodeRadius,
        y: stageHeight * 0.4 + (row - 3) * nodeRadius * Math.sqrt(3),
    });

    // Add member variable
    cell.name(`cell${ row }_${ column }`);
    cell.row = row;
    cell.column = column;
    cell.number = randomInt(10);
    cell.owner = 0; // 0 for no one, 1 for red team, 2 for green team
    cell.neighbor = findNeightbor(row, column);

    cell.add(new Konva.Circle({
        radius: nodeRadius,
        fill: fillColor[cell.owner],
        stroke: strokeColor[cell.owner],
        strokeWidth: 1,
    }));

    const text = new Konva.Text({
        text: cell.number.toString(),
        fontSize: 50,
        fontFamily: 'Work Sans',
        fill: textColor[cell.owner],
    });
    text.offsetX(text.width() / 2);
    text.offsetY(text.height() / 2);

    cell.add(text);

    // Add member function
    cell.addNumber = function (number, team){
        this.number += number;

        const label = this.findOne('Text');
        label.text(cell.number);
        label.offsetX(label.width() / 2);
        label.offsetY(label.height() / 2);

        if(randomInt(10) > 3){
            this.freeze(team);
        }
    }

    cell.freeze = function (owner){
        // Set owner
        this.owner = owner;

        // Change to owner's color
        const circle = this.find('Circle');
        circle.fill(fillColor[owner]);
        circle.stroke(strokeColor[owner]);
        this.find('Text').fill(textColor[owner]);

        // // Search for bundle
        // // let bundle = [];
        // this.neighbor.forEach(n => {
        //     console.log(shapeLayer.findOne(`.${ n }`).getParent() === shapeLayer);
        // });
    }

    // Add event listener
    cell.on('mouseover', function (){
        if(this.owner !== 0)
            document.body.style.cursor = 'pointer';
        else
            document.body.style.cursor = 'default';
    });

    cell.on('mouseout', () => {
        document.body.style.cursor = 'default';
    });

    cell.on('click', function() {
        if(this.owner !== 0){
            score += this.number;
            document.querySelector('.main__scoreboard--score').innerHTML = score.toString();
            shapeLayer.add(createCell({
                row: this.row,
                column: this.column,
            }));
            this.destroy();
            shapeLayer.draw();
        }
    })

    return cell;
}

function findNeightbor(row, column){
    const columnInrow = [ 4, 5, 6, 7, 6, 5, 4, ];
    const n = [];
    const prevRow = row - 1;
    const nextRow = row + 1;
    const prevColumn = column - 1;
    const nextColumn = column + 1;

    // Find neighbor in previous column
    if(prevRow >= 0){
        if(row <= 3){
            if(prevColumn >= 0) n.push(`cell${ prevRow }_${ prevColumn }`);
            if(column < columnInrow[prevRow]) n.push(`cell${ prevRow }_${ column }`);
        }
        else{
            n.push(`cell${ prevRow }_${ column }`);
            n.push(`cell${ prevRow }_${ nextColumn }`);
        }
    }

    // Find neighbor in current column
    if(prevColumn >= 0) n.push(`cell${ row }_${ prevColumn }`);
    if(nextColumn < columnInrow[row]) n.push(`cell${ row }_${ nextColumn }`);

    // Find neighbor in next column
    if(nextRow < 7){
        if(row < 3){
            n.push(`cell${ nextRow }_${ column }`);
            n.push(`cell${ nextRow }_${ nextColumn }`);
        }
        else{
            if(prevColumn >= 0) n.push(`cell${ nextRow }_${ prevColumn }`);
            if(column < columnInrow[nextRow]) n.push(`cell${ nextRow }_${ column }`);
        }
    }
    return n;
}

// Generate random integer in 0 - (max - 1)
function randomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

export { passGlobalVariableToCell, createCell };