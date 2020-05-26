import {updateProblem,emitProblem,initProblem} from './Problem';
import {updateTimer,createTimer,closeGame} from './Timer';
import {RandomInt,getRandomBoardNumber,initBoardTeam,getAllIndex,updateBullet,initBullet} from './Random'
import {allUserReady,objectToArray,flatten} from './Tool'
import { Lobby } from "./Lobby"
import { Game } from './Game';
import { Summary } from './Summary';
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
        summaryCount : 3 //多少人取得 summary : INT
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
    protected lobby;
    protected game;
    protected summary;

    constructor(){
        this.gameRoom = {};
        this.roomCount = 0;
        this.lobby = new Lobby();
        this.game = new Game();
        this.summary = new Summary();
    }
    public createIo(io){
        io.sockets.on('connection',  (socket) =>{

            socket.on('createRoom',(username)=>{
                this.lobby.createRoom(io, socket, this.gameRoom, username);
            });

            socket.on('closeRoom',(roomName)=>{
                this.lobby.closeRoom(io, socket, this.gameRoom, roomName);
            })

            socket.on('joinRoom', (username, roomName)=>{
                this.lobby.joinRoom(io, socket, this.gameRoom, username, roomName);
            });
        
            socket.on('leaveRoom', (username, roomName)=>{
                this.lobby.leaveRoom(io, socket, this.gameRoom, username, roomName);
            });
            
            socket.on('enterLobby',()=>{
                this.lobby.enterLobby(io, socket, this.gameRoom);
            })

            socket.on('setUserReady',(username, roomName)=>{
                this.lobby.setUserReady(io, socket, this.gameRoom, username, roomName);
            });

            socket.on('unsetUserReady',(username, roomName)=>{
                this.lobby.unsetUserReady(io, socket, this.gameRoom, username, roomName);
            });

            socket.on('enterGame',(roomName)=>{
                this.lobby.enterGame(io, socket, this.gameRoom, roomName);
            })

            socket.on('joinGameRoom', (roomName)=>{
                this.game.joinGameRoom(io, socket, this.gameRoom, roomName);
            })

            socket.on('startGame',(username, roomName)=>{
                this.game.startGame(io, socket, this.gameRoom, username, roomName);
            });
            
            socket.on('getScore',(roomName, point, team)=>{
                this.game.getScore(io, socket, this.gameRoom, roomName, point, team);
            });

            socket.on('shuffleBoard',(roomName)=>{
                this.game.shuffleBoard(io, socket, this.gameRoom, roomName);
            });

            socket.on('updateCell',(roomName, data)=>{
                this.game.updateCell(io, socket, this.gameRoom, roomName, data);
            });

            socket.on('updateBullet',(roomName, data)=>{
                this.game.updateBullet(io, socket, this.gameRoom, roomName, data);
            });

            socket.on('getBullet',(roomName,username)=>{
                this.game.getBullet(io, socket, this.gameRoom, roomName, username);
            })

            socket.on('summary',(roomName)=>{
                this.summary.result(io, socket, this.gameRoom, roomName);
            })
        });
    }
}

