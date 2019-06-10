import *  as fs from 'fs';
import {getRangeRandom , getRandomProblem } from './Ramdom';
import * as path from 'path';

const problems = {
    "keys": ["basic", "function", "special"],
    "basic": ["<", "==", ">", "%"],
    "function": ["isSquare(x)", "isPrime(x)", "inFibonacci(x)", "isPower2(x)"],
    "special": ["x-2x+1", "x+2x+1"]
};
function updateProblem(gameRoom,roomName){
    let problem = getRandomProblem(problems);
    gameRoom[roomName]["problem"] = problem;
}
function emitProblem(io,room,socket,problem){
    io.sockets.in(socket.room).emit('updateProblem', { problem:problem});
}
function initProblem(gameRoom,roomName){
    if(typeof gameRoom[roomName]["problem"] === 'undefined'){
        updateProblem(gameRoom,roomName);
    }
}
export {updateProblem,emitProblem,initProblem}