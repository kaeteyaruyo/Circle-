import * as express from 'express';
import * as socketIo from 'socket.io';
import { createServer, Server } from 'http';
import * as path from 'path';

var x = path.join('Users', 'Refsnes', 'demo_path.js');
const app = express();
const http = createServer(app);
const io = socketIo(http);

 
app.get('/', (req,res)=>{
    res.sendFile(path.join(__dirname ,'../../client/index.html'));
});

io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });
});

http.listen(3000, ()=> {
    console.log('Example app listening on port 3000!');
});