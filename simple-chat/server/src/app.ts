import * as express from 'express';
import { createServer, Server } from 'http';
import * as path from 'path';
import * as socketIo from 'socket.io';
import {updateProblem} from './Problem';
import {updateTimer} from './Timer';
import {createIo} from './Io';
const app = express();
const http = createServer(app);
const io = socketIo(http);



app.get('/', (req,res)=>{
    res.sendFile(path.join(__dirname ,'../../client/index.html'));
});

app.get('/2', (req,res)=>{
    res.sendFile(path.join(__dirname ,'../../client/index2.html'));
});


createIo(io);

http.listen(3000, ()=> {
    console.log('Example app listening on port 3000!');
});
