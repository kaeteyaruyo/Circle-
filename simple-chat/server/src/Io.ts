import {updateProblem,emitProblem,initProblem} from './Problem';
import {updateTimer,createTimer,closeGame} from './Timer';

let gameRoom = {};
let roomCount = 0;
let tutorialRoom = {};
/*
room info
gameRoom = {
    room1 : { // 房間 :JSON
        players = { // 玩家資訊 :JSON
            name1 : { // 玩家1 :JSON
                team : "red", // 所屬隊伍
                ready : false // 準備好了嗎？
            },
            name2 : {
                ...
            }
        },
        director = "name1", // 房長 :STRING
        gaming = false, // 是否遊戲中 :BOOLEAN
        redTeamCount = 1, // 紅隊人數 :INT
        greenTeamCount = 0, // 綠隊人數 :INT
        redPoint = 0, // 紅隊分數 :INT
        greenPoint = 0 // 綠隊分數 :INT
    },
    room2 :{
        ...
    }
    ...
}
*/


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
                gameRoom[roomName]["redTeamCount"] = 1;
                gameRoom[roomName]["greenTeamCount"] = 0;
                gameRoom[roomName]["redPoint"] = 0;
                gameRoom[roomName]["greenPoint"] = 0;
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
        socket.on('startTutorial',(roomName)=>{
            let timer;
            // toturial
            if(typeof tutorialRoom[roomName] !== 'undefined'){
                if(tutorialRoom[roomName]["gaming"]){
                    timer = tutorialRoom[roomName]["timer"];
                }
            }
            else{
                timer = createTimer();
                tutorialRoom[roomName] = {};
                tutorialRoom[roomName]["timer"] = timer;
                let timerFun = setInterval(()=>{
                    let time = updateTimer(io,timer,socket);
                    closeGame(io,socket,time,tutorialRoom[roomName]);
                },1000);
                let problemFun = setInterval(()=>{
                    updateProblem(tutorialRoom,roomName);
                    emitProblem(io,roomName,socket,tutorialRoom[roomName]["problem"]);
                },5000);
                tutorialRoom[roomName]["timerFun"] = timerFun;
                tutorialRoom[roomName]["problemFun"] = problemFun;
                socket.isTutorial = true;
                tutorialRoom[roomName]["gaming"] = true;
            }
            socket.room = roomName;
            socket.join(roomName);
            updateTimer(io,timer,socket);
            initProblem(tutorialRoom,roomName);
            emitProblem(io,roomName,socket,tutorialRoom[roomName]["problem"]);
        });

        socket.on('startGame',(roomName)=>{
            let timer;
            if(typeof gameRoom[roomName] !== 'undefined'){
                // for real 6 vs 6
                if(gameRoom[roomName]["gaming"]){
                    timer = gameRoom[roomName]["timer"];
                }
                else{
                    timer = createTimer();
                    gameRoom[roomName]["timer"] = timer;
                    let timerFun = setInterval(()=>{
                        let time = updateTimer(io,timer,socket);
                        closeGame(io,socket,time,gameRoom[roomName]);
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
        
        socket.on('updatePoint',(roomName,point,team)=>{
            if(typeof gameRoom[roomName] !== 'undefined'){
                if(team ==='red'){
                    gameRoom[roomName]["redPoint"] = point;
                }
                else if(team === 'green'){
                    gameRoom[roomName]["greenPoint"] = point;
                }
                io.sockets.emit('updatePoint',gameRoom[roomName]["redPoint"],gameRoom[roomName]["greenPoint"]);
            }
            else{
                socket.emit('error','error cannot find room');
            }
        })
    });
}



export {createIo}