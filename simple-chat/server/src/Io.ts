import {updateProblem,emitProblem,initProblem} from './Problem';
import {updateTimer,createTimer} from './Timer';

let gameRoom = {};
let roomCount = 0;

function createIo(io){
    io.sockets.on('connection',  (socket) =>{
        socket.on('createRoom',(username,roomName)=>{
            if(typeof gameRoom[roomName] !== 'undefined'){
                socket.emit('updateRoom',"error roomName conflict");
            }
            else{
                roomCount = roomCount + 1;
                gameRoom[roomName] = {};
                gameRoom[roomName]["players"] = {};
                gameRoom[roomName]["players"][username] = {
                    "team" : "red",
                    "ready" : false
                };
                gameRoom[roomName]["director"] = username;
                gameRoom[roomName]["gaming"] = false;
                gameRoom[roomName]["isTutorial"] = false;
                gameRoom[roomName]["redTeamCount"] = 1;
                gameRoom[roomName]["greenTeamCount"] = 0;
                socket.room = roomName;
                io.socket.emit('updateRoom',{
                    "operation" : "create",
                    "roomName" : roomName,
                    "roomStatus" : gameRoom[roomName]
                });
            }
        })

        socket.on('closeRoom',(roomName)=>{
            delete gameRoom[roomName];
            roomCount = roomCount - 1;
            io.socket.emit('updateRoom',{
                "operation" : "close",
                "roomName" : roomName,
                "roomStatus" : {}
            })
        })
        socket.on('joinRoom', (username,roomName)=>{
            if(gameRoom[roomName] !== 'undefined'){
                socket.join(roomName);
                let team;
                if(gameRoom[roomName]["redTeamCount"] > gameRoom[roomName]["greenTeamCount"]){
                    team = "red";
                    gameRoom[roomName]["redTeamCount"] = gameRoom[roomName]["redTeamCount"] + 1;
                }
                else{
                    team = "green";
                    gameRoom[roomName]["greenTeamCount"] = gameRoom[roomName]["greenTeamCount"] + 1;
                }
                gameRoom[roomName]["players"][username] = {
                    "team" : team,
                    "ready" : false
                };
                io.socket.emit('updateRoom',{
                    "operation" : "update",
                    "roomName" : roomName,
                    "roomStatus" : gameRoom[roomName]
                });
            }
            else{
                socket.emit('updateRoom',`error when ${username} join ${roomName}`);
            }
        });
    
        socket.on('leaveRoom', (username)=>{
            let roomName = socket.room;
            // open room person leave room
            if(gameRoom[roomName] !== 'undefined'){
                if (username === gameRoom[roomName]["director"]){
                    delete gameRoom[roomName];
                    roomCount = roomCount - 1;
                    io.socket.emit('updateRoom',{
                        "operation" : "close",
                        "roomName" : roomName,
                        "roomStatus" : {}
                    })
                }
                else{
                    let room = gameRoom[roomName];
                    let players = room["players"];
                    if(players[username] !== 'undefined'){
                        if(players[username]["team"] === "red"){
                            gameRoom[roomName]["redTeamCount"] = gameRoom[roomName]["redTeamCount"] - 1;
                        }
                        else{
                            gameRoom[roomName]["greenTeamCount"] = gameRoom[roomName]["greenTeamCount"] - 1;
                        }
                        delete players[username];
                        socket.leave(socket.room);
                        io.socket.emit('updateRoom',{
                            "operation" : "update",
                            "roomName" : roomName,
                            "roomStatus" : gameRoom[roomName]
                        })
                    }
                    else{
                        socket.emit('updateRoom',`error when ${username} leave ${roomName} username not found`);
                    }
                }
            }
            else{
                socket.emit('updateRoom',`error when ${username} leave ${roomName} room name not found`);
            }
        });
        
        socket.on('userReady',(username,roomName)=>{
            gameRoom[roomName]["players"][username]["ready"] = true;
        });

        socket.on('userNotReady',(username,roomName)=>{
            gameRoom[roomName]["players"][username]["ready"] = false;
        });

        socket.on('startGame',(roomName)=>{
            let timer;
            if(typeof gameRoom[roomName] !== 'undefined'){
                // for real 6 vs 6
                if(!gameRoom[roomName]["isTutorial"]){
                    if(gameRoom[roomName]["gaming"]){
                        timer = gameRoom[roomName]["timer"];
                    }
                    else{
                        timer = createTimer();
                        gameRoom[roomName]["timer"] = timer;
                        let timerFun = setInterval(()=>{
                            updateTimer(io,timer,socket);
                        },1000);
                        let problemFun = setInterval(()=>{
                            updateProblem(gameRoom,roomName);
                            emitProblem(io,roomName,socket,gameRoom[roomName]["problem"]);
                        },5000);
                        gameRoom[roomName]["timerFun"] = timerFun;
                        gameRoom[roomName]["problemFun"] = problemFun;
                        gameRoom[roomName]["gaming"] = true;
                    }
                }
                else{
                    timer = gameRoom[roomName]["timer"];
                }
            }
            else{
                // toturial
                timer = createTimer();
                gameRoom[roomName] = {};
                gameRoom[roomName]["timer"] = timer;
                let timerFun = setInterval(()=>{
                    updateTimer(io,timer,socket);
                },1000);
                let problemFun = setInterval(()=>{
                    updateProblem(gameRoom,roomName);
                    emitProblem(io,roomName,socket,gameRoom[roomName]["problem"]);
                },5000);
                gameRoom[roomName]["timerFun"] = timerFun;
                gameRoom[roomName]["problemFun"] = problemFun;
                gameRoom[roomName]["isTutorial"] = true;
            }
            socket.room = roomName;
            socket.join(roomName);
            updateTimer(io,timer,socket);
            initProblem(gameRoom,roomName);
            emitProblem(io,roomName,socket,gameRoom[roomName]["problem"]);
        });

        socket.on('closeGame',(roomName)=>{
            if(typeof gameRoom[roomName] !== 'undefined'){
                socket.room = "";
                socket.leave(roomName);
                let timerFun = gameRoom[roomName]["timerFun"];
                let problemFun = gameRoom[roomName]["problemFun"];
                clearInterval(timerFun);
                clearInterval(problemFun);
                gameRoom[roomName]["gaming"] = false;
            }
        });

    });
}



export {createIo}