import { allUserReady, objectToArray, flatten} from './Tool'
import { updateProblem, emitProblem } from './Problem';
import { updateTimer, createTimer, closeGame } from './Timer';
import { RandomInt, getRandomBoardNumber, initBoardTeam, getAllIndex, updateBullet } from './Random'

class Game {
    public joinGameRoom(io: any, socket: any, gameRoom: object, roomName: string) :void {
        socket.join(`${roomName}-game`);
        socket.emit("joinGameRoom");
    }

    public startGame(io: any, socket: any, gameRoom: object, username: string ,roomName: string) :void {
        try {
            gameRoom[roomName]["players"][username]["ready"] = true;
            if(allUserReady(gameRoom[roomName]["players"])){
                try {
                    if(! gameRoom[roomName]["gaming"]){
                        let timer = createTimer();
                        gameRoom[roomName]["timer"] = timer;
                        gameRoom[roomName]["boardNumber"] = getRandomBoardNumber();
                        gameRoom[roomName]["boardTeam"] = initBoardTeam();
                        updateProblem(gameRoom,roomName);
                        let timerFun = setInterval(()=>{
                            let time = updateTimer(io, timer, socket, roomName);
                            closeGame(io,socket, time, gameRoom,roomName);
                        },1000);
                        let problemFun = setInterval(()=>{
                            updateProblem(gameRoom, roomName);
                            emitProblem(io, socket, roomName, gameRoom[roomName]["problem"]);
                        },30000);
                        gameRoom[roomName]["timerFun"] = timerFun;
                        gameRoom[roomName]["problemFun"] = problemFun;
                        gameRoom[roomName]["gaming"] = true;
                    }
                } catch(err) {
                    console.log(err);
                }
                io.in(`${roomName}-game`).emit('startGame',{
                    roomName : roomName,
                    players : gameRoom[roomName]["players"]
                });
                updateTimer(io, gameRoom[roomName]["timer"], socket,roomName);
                updateProblem(gameRoom, roomName);
                emitProblem(io, socket, roomName ,gameRoom[roomName]["problem"]);
                let num  = gameRoom[roomName]["boardNumber"];
                let num_flat = flatten(num);
                let team = gameRoom[roomName]["boardTeam"];
                let team_flat = flatten(team);
                this.updateCell(io, socket, gameRoom, roomName, objectToArray({
                    "index" : getAllIndex(),
                    "number" : num_flat,
                    "team" : team_flat,
                }));
            }
        } catch (err) {
            console.log(err);
            socket.emit("startGame","you are not in any room");
        }
    }

    public getScore(io: any, socket: any, gameRoom: object, roomName: string, point: number, team: number) :void {
        let currentScore = 0;
        if(team === 1){
            currentScore = gameRoom[roomName]["redPoint"]  = gameRoom[roomName]["redPoint"] + point;
        }
        else if(team === 2){
            currentScore = gameRoom[roomName]["greenPoint"]  = gameRoom[roomName]["greenPoint"] + point;
        }
        io.in(`${roomName}-game`).emit('updateScore',{
            "team": team,
            "score": currentScore, // score of my team
        });
    }

    public shuffleBoard(io: any, socket: any, gameRoom: object, roomName: string) :void {
        for(let row = 0; row < 7; ++row){
            let maxColumn = (7 - Math.abs(row - 3));
            for(let column = 0; column < maxColumn; ++column){
                if(gameRoom[roomName]["boardTeam"][row][column] === 0)
                    gameRoom[roomName]["boardNumber"][row][column] = RandomInt(0,99);
            }
        }
        let index = getAllIndex();
        let num  = gameRoom[roomName]["boardNumber"];
        let num_flat = flatten(num);
        let team = gameRoom[roomName]["boardTeam"];
        let team_flat = flatten(team);
        let arr = objectToArray({
            "index" : index,
            "number" : num_flat,
            "team" : team_flat, // score of my team
        });
        io.in(`${roomName}-game`).emit('updateCell',{
            data: arr
        });
    }
    
    public updateCell(io: any, socket: any, gameRoom: object, roomName: string, data: Array<any>) :void {
        data.forEach((element, index, itself) => {
            let row = element["index"][0];
            let col = element["index"][1];
            let number = element["number"];
            let team = element["team"];
            gameRoom[roomName]["boardNumber"][row][col] = number % 100;
            gameRoom[roomName]["boardTeam"][row][col] = team;
            itself[index]["number"] = itself[index]["number"] % 100;
        });
        io.in(`${roomName}-game`).emit('updateCell', {
            data : data
        });
    }

    public updateBullet(io: any, socket: any, gameRoom: object, roomName: string, data: object) :void {
        let username = data["username"];
        let index = data["index"];
        let value = [];
        index.forEach(element => {
           let temp = updateBullet(gameRoom[roomName]["players"][username]["bullets"],element); 
           value.push(temp);
        });
        socket.emit('updateBullet',objectToArray({
            "index" : index,
            "bullet" : value
        }));

    }

    public getBullet(io: any, socket: any, gameRoom: object, roomName: string, username: string) :void {
        socket.emit('updateBullet', objectToArray({
            "index" : [0,1,2,3,4],
            "bullet" : gameRoom[roomName]["players"][username]["bullets"]
        }));
    }
}

export {Game};