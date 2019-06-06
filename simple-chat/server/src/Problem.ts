import *  as fs from 'fs';
import {getRangeRandom , getRandomProblem } from './Ramdom';
import * as path from 'path';

function updateProblem(io){
    fs.readFile(path.join(__dirname ,'./problems.json'), (err, data) => {  
        if (err) throw err;
        let problems = JSON.parse(data.toString());
        let problem = getRandomProblem(problems);
        io.sockets.emit('updateProblem', { problem:problem});
    }); 
}

export {updateProblem}