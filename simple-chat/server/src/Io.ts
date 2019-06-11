import {updateProblem,emitProblem,initProblem} from './Problem';
import {updateTimer,createTimer,closeGame} from './Timer';
/*
room info
gameRoom = {
    room1 : { // 房間 :JSON
        players = { // 玩家資訊 :JSON
            name1 : { // 玩家1 :JSON
                team : 1, // 所屬隊伍
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
        timer = 152 :INT // 計時器
        problem : STRING // 問題
    },
    room2 :{
        ...
    }
    ...
}
*/

module.exports = class CircleIO{
    protected gameRoom;
    protected roomCount;
    protected tutorialRoom;

    constructor(){
        this.gameRoom = {};
        this.roomCount = 0;
        this.tutorialRoom = {};
    }
    public createIo(io){
        io.sockets.on('connection',  (socket) =>{

            socket.on('createRoom',(username)=>{
               this.createRoom(io,socket,username); 
            });

            socket.on('closeRoom',(roomName)=>{
                this.closeRoom(io,socket,roomName);
            })

            socket.on('joinRoom', (username,roomName)=>{
                this.joinRoom(io,socket,username,roomName);
            });
        
            socket.on('leaveRoom', (username)=>{
                this.leaveRoom(io,socket,username);
            });
            
            socket.on('enterLobby',()=>{
                this.enterLobby(io,socket);
            })

            socket.on('setUserReady',(username,roomName)=>{
                this.setUserReady(io,socket,username,roomName);
            });

            socket.on('unsetUserReady',(username,roomName)=>{
                 this.unsetUserReady(io,socket,username,roomName);
            });

            socket.on('startTutorial',(roomName)=>{
                this.startTutorial(io,socket,roomName);
            });

            socket.on('enterGame',(roomName)=>{
                this.enterGame(io,socket,roomName);
            })

            socket.on('startGame',(roomName)=>{
                this.startGame(io,socket,roomName);
            });

            socket.on('closeGame',(roomName)=>{
                this.closeGame(io,socket,roomName);
            });
            
            socket.on('updatePoint',(roomName,point,team)=>{
                this.updatePoint(io,socket,roomName,point,team);
            });
        });
    }

    protected createRoom(io,socket,username){
        if(this.gameRoom[username] !== undefined){
            socket.emit('createRoom',"error roomName conflict");
        }
        else{
            this.roomCount = this.roomCount + 1;
            this.gameRoom[username] = {};
            this.gameRoom[username]["players"] = {};
            // this.gameRoom[username]["players"][username] = {
            //     "team" : 1,
            //     "ready" : false
            // };
            this.gameRoom[username]["owner"] = username;
            this.gameRoom[username]["gaming"] = false;
            this.gameRoom[username]["redTeamCount"] = 0;
            this.gameRoom[username]["greenTeamCount"] = 0;
            this.gameRoom[username]["redPoint"] = 0;
            this.gameRoom[username]["greenPoint"] = 0;
            socket.room = username;
            io.sockets.emit('createRoom',{
                "roomName" : username,
                "roomStatus" : this.gameRoom[username]
            });
        }
    }

    protected closeRoom(io,socket,roomName){
        this.roomCount = this.roomCount - 1;
        io.sockets.emit('closeRoom',{
            "roomName" : roomName,
            "roomStatus" : this.gameRoom[roomName]
        });
        delete this.gameRoom[roomName];
    }

    protected joinRoom(io,socket,username,roomName){
        // console.log(roomName);
        // console.log(this.gameRoom);
        socket.room = roomName;
        let thisRoom = this.gameRoom[roomName];
        let joinPerson = username;
        if(thisRoom !== undefined){
            socket.join(roomName);
            let team;
            if(thisRoom["redTeamCount"] > thisRoom["greenTeamCount"]){
                team = 2;
                thisRoom["greenTeamCount"] = thisRoom["greenTeamCount"] + 1;
            }
            else{
                team = 1;
                thisRoom["redTeamCount"] = thisRoom["redTeamCount"] + 1;
            }
            thisRoom["players"][username] = {
                "team" : team,
                "ready" : false
            };
            io.sockets.emit('joinRoom',{
                "joinedPlayer": username,
                "roomName" : roomName,
                "roomStatus" : thisRoom
            });
        }
        else{
            socket.emit('updateRoom',`error when ${username} join ${roomName}`);
        }
    }

    protected leaveRoom(io,socket,username){
        let roomName = socket.room;
        let thisRoom = this.gameRoom[roomName];
        let leavePlayer = username;
        // open room person leave room
        if(thisRoom !== undefined){
            let players = thisRoom["players"];
            if(players[username] !== undefined){
                if(players[username]["team"] === 1){
                    thisRoom["redTeamCount"] = thisRoom["redTeamCount"] - 1;
                }
                else{
                    thisRoom["greenTeamCount"] = thisRoom["greenTeamCount"] - 1;
                }
                delete players[username];
                socket.leave(socket.room);
                io.sockets.emit('leaveRoom',{
                    "leavedPlayer": username,
                    "roomName" : roomName,
                    "roomStatus" : thisRoom
                })
            }
            else{
                socket.emit('leaveRoom',`error when ${username} leave ${roomName} username not found`);
            }
        }
    }

    protected enterLobby(io,socket){
        let rooms = Object.keys(this.gameRoom);
        let players = [];
        let result = [];
        rooms.forEach(element => {
            let number = Object.keys(this.gameRoom[element]["players"]).length
            result.push({
                roomName : element,
                attendance : number
            })
        });
        socket.emit('enterLobby',{
            rooms : result
        })
    }

    protected setUserReady(io,socket,username,roomName){
        this.gameRoom[roomName]["players"][username]["ready"] = true;
    }

    protected unsetUserReady(io,socket,username,roomName){
        this.gameRoom[roomName]["players"][username]["ready"] = false;
    }

    protected startTutorial(io,socket,roomName){
        let timer;
        // toturial
        if(this.tutorialRoom[roomName] !== undefined){
            if(this.tutorialRoom[roomName]["gaming"]){
                timer = this.tutorialRoom[roomName]["timer"];
            }
        }
        else{
            timer = createTimer();
            this.tutorialRoom[roomName] = {};
            this.tutorialRoom[roomName]["timer"] = timer;
            let timerFun = setInterval(()=>{
                let time = updateTimer(io,timer,socket);
                closeGame(io,socket,time,this.tutorialRoom[roomName]);
            },1000);
            let problemFun = setInterval(()=>{
                updateProblem(this.tutorialRoom,roomName);
                emitProblem(io,roomName,socket,this.tutorialRoom[roomName]["problem"]);
            },5000);
            this.tutorialRoom[roomName]["timerFun"] = timerFun;
            this.tutorialRoom[roomName]["problemFun"] = problemFun;
            socket.isTutorial = true;
            this.tutorialRoom[roomName]["gaming"] = true;
        }
        socket.room = roomName;
        socket.join(roomName);
        updateTimer(io,timer,socket);
        initProblem(this.tutorialRoom,roomName);
        emitProblem(io,roomName,socket,this.tutorialRoom[roomName]["problem"]);
    }

    protected enterGame(io,socket,roomName){
        io.sockets.in(roomName).emit('enterGame');
    }

    protected startGame(io,socket,roomName){
        let timer;
        if(this.gameRoom[roomName] !== undefined){
            // for real 6 vs 6
            if(this.gameRoom[roomName]["gaming"]){
                timer = this.gameRoom[roomName]["timer"];
            }
            else{
                timer = createTimer();
                this.gameRoom[roomName]["timer"] = timer;
                let timerFun = setInterval(()=>{
                    let time = updateTimer(io,timer,socket);
                    closeGame(io,socket,time,this.gameRoom[roomName]);
                },1000);
                let problemFun = setInterval(()=>{
                    updateProblem(this.gameRoom,roomName);
                    emitProblem(io,roomName,socket,this.gameRoom[roomName]["problem"]);
                },5000);
                this.gameRoom[roomName]["timerFun"] = timerFun;
                this.gameRoom[roomName]["problemFun"] = problemFun;
                this.gameRoom[roomName]["gaming"] = true;
            }
        }
        socket.room = roomName;
        socket.join(roomName);
        updateTimer(io,timer,socket);
        initProblem(this.gameRoom,roomName);
        emitProblem(io,roomName,socket,this.gameRoom[roomName]["problem"]);
    }

    protected closeGame(io,socket,roomName){
        if(this.gameRoom[roomName] !== undefined){
            socket.room = "";
            socket.leave(roomName);
            let timerFun = this.gameRoom[roomName]["timerFun"];
            let problemFun = this.gameRoom[roomName]["problemFun"];
            clearInterval(timerFun);
            clearInterval(problemFun);
            this.gameRoom[roomName]["gaming"] = false;
        }
    }

    protected updatePoint(io,socket,roomName,point,team){
        if(this.gameRoom[roomName] !== undefined){
            if(team ==='1'){
                this.gameRoom[roomName]["redPoint"] = point;
            }
            else if(team === '2'){
                this.gameRoom[roomName]["greenPoint"] = point;
            }
            io.sockets.emit('updatePoint',this.gameRoom[roomName]["redPoint"],this.gameRoom[roomName]["greenPoint"]);
        }
        else{
            socket.emit('error','error cannot find room');
        }
    }
}
