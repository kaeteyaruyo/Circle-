const fillColor = [ '#D5D6D8', '#F4733D', '#38595E', ];
const strokeColor = [ '#BABDBF', '#913108', '#111B1D', ];
const textColor = [ '#53575A', '#FCDCCF', '#DFEAEC', ];
const bundleTable = new Map();

let centerX = null;
let centerY = null;
let nodeRadius = null;
let shapeLayer = null;
let currentQuiz = '';
let score = 0;

function passGlobalVariableToCell({ center_x, center_y, shape_layer, node_radius }){
    centerX = center_x;
    centerY = center_y;
    shapeLayer = shape_layer;
    nodeRadius = node_radius;
}

function createCell({ row, column, }){
    // Create cell object
    const cell = new Konva.Group({
        x: centerX + (Math.abs(row - 3) - 6 + 2 * column) * nodeRadius,
        y: centerY + (row - 3) * nodeRadius * Math.sqrt(3),
    });

    // Add member variable
    cell.name(`cell${ row }_${ column }`);
    cell.row = row;
    cell.column = column;
    cell.number = randomInt(10);
    cell.owner = 0; // 0 for no one, 1 for red team, 2 for green team
    cell.neighbor = findNeightbor(row, column);
    bundleTable.set(cell.name(), null);

    cell.add(new Konva.Circle({
        radius: nodeRadius,
        fill: fillColor[cell.owner],
        stroke: strokeColor[cell.owner],
        strokeWidth: 1,
    }));

    const text = new Konva.Text({
        text: cell.number.toString(),
        fontSize: 40,
        fontFamily: 'Work Sans',
        fill: textColor[cell.owner],
    });
    text.offsetX(text.width() / 2);
    text.offsetY(text.height() / 2);

    cell.add(text);

    // Add member function
    cell.addNumber = (number, team) => {
        cell.number += number;

        const label = cell.findOne('Text');
        label.text(cell.number);
        label.offsetX(label.width() / 2);
        label.offsetY(label.height() / 2);

        const x = cell.number;
        if(eval(currentQuiz))
            cell.freeze(team);
    }

    cell.freeze = (owner) => {
        // Set owner
        cell.owner = owner;

        // Change to owner's color
        const circle = cell.find('Circle');
        circle.fill(fillColor[owner]);
        circle.stroke(strokeColor[owner]);
        cell.find('Text').fill(textColor[owner]);

        // Search for bundle
        const neighbors = [];
        cell.neighbor.forEach(n => {
            const neighborCell = shapeLayer.findOne(`.${ n }`);
            if(neighborCell.owner === owner){
                neighbors.push(n);
            }
        });

        bundleTable.set(cell.name(), cell.name());
        neighbors.forEach(n => {
            const root = findRoot(n)
            bundleTable.set(root, cell.name());
        });
    }

    cell.consume = () => {
        if(cell.owner !== 0){
            const root = findRoot(cell.name());
            const bundle = collectBundle(root).concat(root);
            const bonus = bundle.length;
            let totalNumber = 0;

            bundle.forEach(cellName => {
                const c = shapeLayer.findOne(`.${ cellName }`);
                totalNumber += c.number;
                shapeLayer.add(createCell({
                    row: c.row,
                    column: c.column,
                }));
                bundleTable[cellName] = null;
                c.destroy();
                shapeLayer.draw();
            });
            score += totalNumber * bonus;
            document.querySelector('.main__scoreboard--score').innerHTML = score.toString();
        }
    }

    // Add event listener
    cell.on('mouseover', () => {
        if(cell.owner !== 0)
            document.body.style.cursor = 'pointer';
        else
            document.body.style.cursor = 'default';
    });

    cell.on('mouseout', () => {
        document.body.style.cursor = 'default';
    });

    cell.on('click', () => {
        cell.consume();
    });

    cell.on('tap', () => {
        cell.consume();
    });

    return cell;
}

function cellUpdateQuiz(quiz){
    currentQuiz = quiz;
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

function collectBundle(cellName){
    const children = [];
    bundleTable.forEach((val, key) => {
        if(key !== cellName && val === cellName)
            children.push(key);
    });
    let grandson = [];
    children.forEach(c => {
        grandson = grandson.concat(collectBundle(c));
    })
    return children.concat(grandson);
}

function findRoot(cellName){
    const parent = bundleTable.get(cellName)
    if(parent == cellName)
        return cellName;
    else
        return findRoot(parent);
}

// Generate random integer in 0 - (max - 1)
function randomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function isSquare(x){
    return [1, 4, 9, 16, 25, 36, 49, 64, 81].includes(x);
}
function isPrime(x){
    return [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97].includes(x);
}

function inFibonacci(x){
    return [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89].includes(x);
}

function isPower2(x){
    return [1, 2, 4, 8, 16, 32, 64].includes(x);
}

export { passGlobalVariableToCell, createCell, cellUpdateQuiz };