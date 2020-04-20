import { getRandomProblem } from './Random';

const problems = {
    "keys": ["basic", "function"],
    "basic": ["<", "==", ">", "%"],
    "function": ["isSquare(x)", "isPrime(x)", "inFibonacci(x)", "isPower2(x)"],
};

function updateProblem(gameRoom,roomName){
    gameRoom[roomName]["problem"] = getRandomProblem(problems);
}

function emitProblem(io, socket, roomName ,problem){
    io.in(`${roomName}-game`).emit('updateQuiz', { 
        "problem" : problem,
    });
}

function initProblem(gameRoom,roomName){
    if(gameRoom[roomName]["problem"] === undefined){
        updateProblem(gameRoom,roomName);
    }
}

export {updateProblem,emitProblem,initProblem}