import {RandomInt} from './Random'
import {ApiTrait} from './ApiTrait'

class Lobby{
    protected trait;
    constructor(){
        this.trait = new ApiTrait();
    }
    public createRoom(io: any, socket: any, gameRoom: object, username: string) :void {
        try {
            if(username in gameRoom) {
                throw "exist this user create room";
            }
            gameRoom[username] = {};
            gameRoom[username]["players"] = {};
            gameRoom[username]["owner"] = username;
            gameRoom[username]["gaming"] = false;
            gameRoom[username]["redTeamCount"] = 0;
            gameRoom[username]["greenTeamCount"] = 0;
            gameRoom[username]["redPoint"] = 0;
            gameRoom[username]["greenPoint"] = 0;
            gameRoom[username]["summaryCount"] = 0;
            socket.join(username);
            io.sockets.emit('createRoom',{
                "roomName" : username,
                "roomStatus" : gameRoom[username]
            });
        } catch (err) {
            io.sockets.emit('createRoom', this.trait.returnError(403, "error when create room"));
        }
    }

    public closeRoom(io: any, socket: any, gameRoom: object, roomName: string) :void {
        io.sockets.emit('closeRoom',{
            "roomName" : roomName,
            "roomStatus" : gameRoom[roomName]
        });
        delete gameRoom[roomName];
    }

    public joinRoom(io: any, socket: any, gameRoom: object, username: string, roomName: string) :void {
        try {
            let thisRoom = gameRoom[roomName];
            if(thisRoom["redTeamCount"] + thisRoom["greenTeamCount"] == 2) {
                throw "too many people into room";
            }
            socket.join(roomName);
            let repeat = true;
            if(! (username in gameRoom[roomName]["players"])) {
                let team = thisRoom["redTeamCount"] > thisRoom["greenTeamCount"] ? 2 : 1;
                team === 1 ?  thisRoom["redTeamCount"] += 1 : thisRoom["greenTeamCount"] += 1;
                thisRoom["players"][username] = {
                    "team" : team,
                    "ready" : false,
                    "bullets" : Array.from({length: 5}, (v, i) => RandomInt(0,14))
                };
                repeat = false;
            }
            if(repeat) {
                socket.emit('joinRoom',{
                    "joinedPlayer": username,
                    "roomName" : roomName,
                    "roomStatus" : thisRoom,
                });
            } else {
                io.sockets.emit('joinRoom',{
                    "joinedPlayer": username,
                    "roomName" : roomName,
                    "roomStatus" : thisRoom,
                });
            }
            
        } catch (err) {
            // not yet
            socket.emit('updateRoom', this.trait.returnError(403, "error when create room"));
        }
    }

    public leaveRoom(io: any, socket: any, gameRoom: object, username: string, roomName: string) :void {
        try {
            let thisRoom = gameRoom[roomName];
            let players = thisRoom["players"];
            players[username]["team"] === 1 ? thisRoom["redTeamCount"] -= 1 : thisRoom["greenTeamCount"] -= 1;
            delete players[username];
            socket.leave(roomName);
            io.sockets.emit('leaveRoom',{
                "leavedPlayer": username,
                "roomName" : roomName,
                "roomStatus" : thisRoom
            });
        } catch (err) {
            socket.emit('leaveRoom', this.trait.returnError(403, "error when leave room"));
        }
    }

    public enterLobby (io: any, socket: any, gameRoom: object) :void {
        let result = [];
        Object.keys(gameRoom).forEach(element => {
            let number = Object.keys(gameRoom[element]["players"]).length
            result.push({
                roomName : element,
                attendance : number
            });
        });
        socket.emit('enterLobby',{
            rooms : result
        })
    }

    public setUserReady (io: any, socket: any, gameRoom: object, username: string, roomName: string) :void {
        gameRoom[roomName]["players"][username]["ready"] = true;
    }

    public unsetUserReady (io: any, socket: any, gameRoom: object, username: string, roomName: string) :void {
        gameRoom[roomName]["players"][username]["ready"] = false;
    }

    public enterGame(io: any, socket: any, gameRoom:object, roomName: string) :void {
        io.sockets.emit('enterGame',{
            "roomName" : roomName
        });
    }
}

export {Lobby};