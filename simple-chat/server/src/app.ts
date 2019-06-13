import * as express from 'express';
import { createServer, Server } from 'http';
import * as path from 'path';
import * as socketIo from 'socket.io';
import {updateProblem} from './Problem';
import {updateTimer} from './Timer';
const app = express();
const http = createServer(app);
const io = socketIo(http);



app.get('/', (req,res)=>{
    res.sendFile(path.join(__dirname ,'../../client/index.html'));
});

app.get('/2', (req,res)=>{
    res.sendFile(path.join(__dirname ,'../../client/index2.html'));
});



http.listen(3000, ()=> {
    
});
