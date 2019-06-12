function createStage({width, height, username, roomname, socket}){
    const stage = new Konva.Stage({
        container: 'main__canvas',
        width: width,
        height: height,
    });
    stage.initWidth = width;
    stage.initHeight = height;

    // Declare shape layer (container of shapes)
    const shapeLayer = new Konva.Layer();
    shapeLayer.name('shapeLayer');
    stage.add(shapeLayer);

    // Declare temp layer for drop detection
    const tempLayer = new Konva.Layer();
    tempLayer.name('tempLayer');
    stage.add(tempLayer);

    // Draw chessboard
    const chessboard = new Konva.RegularPolygon({
        x: width / 2,
        y: height * 0.4,
        radius: Math.min(width, height) * 0.45,
        sides: 6,
        fill: '#E3E4E5',
        name: 'chessboard',
    });
    chessboard.rotate(30);
    shapeLayer.add(chessboard);

    stage.nodeRadius = chessboard.radius() / 8;

    // Draw magazine
    const magazine = new Konva.Rect({
        width: stage.nodeRadius * 16,
        height: stage.nodeRadius * 3,
        fill: '#E3E4E5',
        name: 'magazine',
    });
    magazine.offsetX(magazine.width() / 2);
    magazine.offsetY(magazine.height() / 2);
    magazine.x(width / 2);
    magazine.y(height * 0.9);
    shapeLayer.add(magazine);

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
                // // leave from old target
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

        if(cell && cell.name() === 'cell'){
            previousShape.fire(
                'drop',
                {
                    type: 'drop',
                    target: previousShape,
                    evt: e.evt
                },
                true
            );

            if(bullet.number === 13){
                // Only magic ball could ignore cell's owner
                cell.collision(bullet.number, bullet.team);
                socket.emit('updateBullet', roomname, {
                    username,
                    index: [bullet.bulletIndex],
                });
                bullet.destroy();
            }
            else {
                if(cell.owner === 0){
                    if(bullet.number === 10){
                        // if it was a shuffle
                        socket.emit('shuffleBoard', roomname);
                    }
                    else if(bullet.number === 12){
                        // if it was an exchange
                        const victims = [];
                        shapeLayer.find('.cell').forEach(c => {
                            if(c.owner === 1){
                                victims.push({
                                    index: [c.row, c.column],
                                    number: c.number,
                                    team: 2,
                                });
                            }
                            else if(c.owner === 2){
                                victims.push({
                                    index: [c.row, c.column],
                                    number: c.number,
                                    team: 1,
                                });
                            }
                        });
                        socket.emit('updateCell', roomname, victims);
                    }
                    else{
                        cell.collision(bullet.number, bullet.team);
                    }
                    socket.emit('updateBullet', roomname, {
                        username,
                        index: [bullet.bulletIndex],
                    });
                    bullet.destroy();
                }
                else{
                    bullet.moveTo(shapeLayer);
                    bullet.reset();
                }
            }
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

    // Rescale when window size change
    stage.fitStageIntoParentContainer = () => {
        const scale = document.querySelector('.main__content').offsetWidth / stage.initWidth;
        stage.width(stage.initWidth * scale);
        stage.height(stage.initHeight * scale);
        stage.scale({ x: scale, y: scale });
        stage.draw();
    }

    stage.updateTimer = (time) => {
        document.querySelector('.main__scoreboard--timer').innerHTML = time;
        // check when timer equals to 0:00
    }

    stage.updateQuiz = (quiz) => {
        document.querySelector('.main__scoreboard--quiz').innerHTML = quiz;
    }

    stage.updateScore = (score) => {
        document.querySelector('.main__scoreboard--score').innerHTML = score.toString();
    }

    return stage;
}

export { createStage };
