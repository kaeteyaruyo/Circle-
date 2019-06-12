import {updateProblem,emitProblem,initProblem} from './Problem';
import {updateTimer,createTimer,closeGame} from './Timer';
import {getRangeRandom,getRandomBoardNumber,initBoardTeam,getAllIndex,updateBullet,initBullet} from './Random'
import {allUserReady,objectToArray,flatten} from './Tool'
/*
room info
gameRoom = {
    room1 : { // 房間 :JSON
        players = { // 玩家資訊 :JSON
            name1 : { // 玩家1 :JSON
                team : 1, // 所屬隊伍
                ready : false // 準備好了嗎
                bullets : [1,2,3,4,5] // 子彈
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

            socket.on('createRoom',(username,isTutorial)=>{
               this.createRoom(io,socket,username,isTutorial); 
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

            socket.on('enterGame',(roomName)=>{
                this.enterGame(io,socket,roomName);
            })

            socket.on('initGame',(roomName)=>{
                this.initGame(io,socket,roomName);
            });

            socket.on('startGame',(username,roomName)=>{
                socket.room = roomName;
                this.startGame(io,socket,username,roomName);
            });
            
            socket.on('getScore',(roomName,point,team)=>{
                this.getScore(io,socket,roomName,point,team);
            });

            socket.on('shuffleBoard',(roomName)=>{
                this.shuffleBoard(io,socket,roomName);
            });

            socket.on('updateCell',(roomName, data)=>{
                this.updateCell(io,socket,roomName,data);
            });

            socket.on('updateBullet',(roomName,data)=>{
                this.updateBullet(io,socket,roomName,data);
            })
        });
    }

    protected createRoom(io,socket,username,isTutorial){
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
            this.gameRoom[username]["isTutorial"] = isTutorial;
            if(isTutorial){
                 this.gameRoom[username]["players"][username] = {
                     "team" : 1,
                     "ready" : false,
                     "bullets" : [0,0,0,0,0]
                 };
                this.gameRoom[username]["redTeamCount"] = 1;
            }
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
                "ready" : false,
                "bullets" : [0,0,0,0,0]
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
                });
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
            });
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

    protected enterGame(io,socket,roomName){
        console.log("enterGame");
        io.sockets.emit('enterGame',{
            "roomName" : roomName
        });
    }

    protected initGame(io,socket,roomName){
        let timer;
        if(this.gameRoom[roomName] !== undefined){
            // for real 6 vs 6
            if(this.gameRoom[roomName]["gaming"]){
                timer = this.gameRoom[roomName]["timer"];
            }
            else{
                timer = createTimer();
                this.gameRoom[roomName]["timer"] = timer;
                this.gameRoom[roomName]["boardNumber"] = getRandomBoardNumber();
                this.gameRoom[roomName]["boardTeam"] = initBoardTeam();
                let timerFun = setInterval(()=>{
                    let time = updateTimer(io,timer,socket,roomName);
                    //console.log("hi");
                    closeGame(io,socket,time,this.gameRoom,roomName);
                },1000);
                let problemFun = setInterval(()=>{
                    updateProblem(this.gameRoom,roomName);
                    emitProblem(io,roomName,socket,this.gameRoom[roomName]["problem"]);
                },30000);
                this.gameRoom[roomName]["timerFun"] = timerFun;
                this.gameRoom[roomName]["problemFun"] = problemFun;
                this.gameRoom[roomName]["gaming"] = true;
            }
        }
    }

    protected startGame(io,socket,username,roomName){
        console.log('startGame',username);
        if(roomName === undefined) socket.emit("startGame","you are not in any room");
        else{
            if(this.gameRoom[roomName]["isTutorial"]){
                this.initGame(io,socket,roomName);
                io.sockets.emit('startGame',{
                    roomName : roomName,
                    players : this.gameRoom[roomName]["players"]
                });
                updateTimer(io,this.gameRoom[roomName]["timer"],socket,roomName);
                initProblem(this.gameRoom,roomName);
                emitProblem(io,roomName,socket,this.gameRoom[roomName]["problem"]);
                let num  = this.gameRoom[roomName]["boardNumber"];
                let num_flat = flatten(num);
                let team = this.gameRoom[roomName]["boardTeam"];
                let team_flat = flatten(team);
                console.log(objectToArray({
                    "index" : getAllIndex(),
                    "number" : num_flat,
                    "team" : team_flat,
                }))
                console.log(roomName)
                this.updateCell(io,socket,roomName,objectToArray({
                    "index" : getAllIndex(),
                    "number" : num_flat,
                    "team" : team_flat,
                }));
            }
            else{
                this.gameRoom[roomName]["players"][username]["ready"] = true;
                if(allUserReady(this.gameRoom[roomName]["players"])){
                    this.initGame(io,socket,roomName);
                    io.sockets.emit('startGame',{
                        roomName : roomName,
                        players : this.gameRoom[roomName]["players"]
                    });
                    updateTimer(io,this.gameRoom[roomName]["timer"],socket,roomName);
                    initProblem(this.gameRoom,roomName);
                    emitProblem(io,roomName,socket,this.gameRoom[roomName]["problem"]);
                    let num  = this.gameRoom[roomName]["boardNumber"];
                    let num_flat = flatten(num);
                    let team = this.gameRoom[roomName]["boardTeam"];
                    let team_flat = flatten(team);
                    console.log(objectToArray({
                        "index" : getAllIndex(),
                        "number" : num_flat,
                        "team" : team_flat,
                    }))
                    console.log(roomName)
                    this.updateCell(io,socket,roomName,objectToArray({
                        "index" : getAllIndex(),
                        "number" : num_flat,
                        "team" : team_flat,
                    }));
                }
            }
        }
    }

    protected getScore(io,socket,roomName,team,score){
        let currentScore;
        if(team === 1){
            currentScore = this.gameRoom[roomName]["redPoint"]  = this.gameRoom[roomName]["redPoint"] + score;
        }
        else if(team === 2){
            currentScore = this.gameRoom[roomName]["greenPoint"]  = this.gameRoom[roomName]["greenPoint"] + score;
        }
        io.sockets.emit('updateScore',{
            "roomName" : roomName,
            "team": team,
            "score": currentScore, // score of my team
        });
    }

    protected shuffleBoard(io,socket,roomName){
        let boardNumber = getRandomBoardNumber();
        this.gameRoom[roomName]["boardNumber"] = boardNumber;
        let index = getAllIndex();
        io.sockets.emit('updateCell',objectToArray({
            "roomName" : roomName,
            "index" : index,
            "number" : this.gameRoom[roomName]["boardNumber"],
            "team" : this.gameRoom[roomName]["boardTeam"], // score of my team
        }));
    }

    protected updateCell(io,socket,roomName, data){
        data.forEach(element => {
            let row = element["index"][0];
            let col = element["index"][1];
            let number = element["number"];
            let team = element["team"];
            this.gameRoom[roomName]["boardNumber"][row][col] = number;
            this.gameRoom[roomName]["boardTeam"][row][col] = team;
        });
        io.sockets.emit('updateCell',{
            "roomName" : roomName,
            data : data
        });
    }

    protected summary(io,socket,roomName){
        io.sockets.emit('summary',{
            "roomName" : roomName,
            "redScore" : this.gameRoom[roomName]["redPoint"],
            "greenScore" : this.gameRoom[roomName]["greenPoint"]
        });
    }

    protected updateBullet(io,socket,roomName,data){
        let username = data["username"];
        let index = data["index"];
        let value = [];
        console.log(this.gameRoom[roomName]["players"][username]["bullets"]);
        index.forEach(element => {
           let temp = updateBullet(this.gameRoom[roomName]["players"][username]["bullets"],element); 
           value.push(temp);
        });
        console.log(this.gameRoom[roomName]["players"][username]["bullets"]);
        socket.emit('updateBullet',objectToArray({
            "index" : index,
            "bullet" : value
        }));
    }
}

