import * as express from 'express';
import { createServer, Server } from 'http';
import * as path from 'path';
import * as socketIo from 'socket.io';
import *  as fs from 'fs';
import {getRangeRandom , getRandomProblem } from './ramdom';

const app = express();
const http = createServer(app);
const io = socketIo(http);



app.get('/', (req,res)=>{
    res.sendFile(path.join(__dirname ,'../../client/index.html'));
});

app.get('/2', (req,res)=>{
    res.sendFile(path.join(__dirname ,'../../client/index2.html'));
});

// usernames which are currently connected to the chat
let usernames = {};

// rooms which are currently available in chat
let rooms = ['room1','room2','room3'];

setInterval(() => {
	let date = new Date();
    io.sockets.emit('updateTimer', { 
		hour: date.getHours(),
		min: date.getMinutes(),
		sec: date.getSeconds(),
	});
  }, 1000);

setInterval(() => {
	fs.readFile(path.join(__dirname ,'./problems.json'), (err, data) => {  
		if (err) throw err;
		let problems = JSON.parse(data.toString());
		let problem = getRandomProblem(problems);
		io.sockets.emit('updateProblem', { problem:problem});
	}); 
  }, 3000);


io.sockets.on('connection',  (socket) =>{

	// when the client emits 'adduser', this listens and executes
	socket.on('adduser', (username)=>{
		// store the username in the socket session for this client
		socket.username = username;
		// store the room name in the socket session for this client
		socket.room = 'room1';
		// add the client's username to the global list
		usernames[username] = username;
		// send client to room 1
		socket.join('room1');
		// echo to client they've connected
		socket.emit('updatechat', 'SERVER', 'you have connected to room1');
		// echo to room 1 that a person has connected to their room
		socket.broadcast.to('room1').emit('updatechat', 'SERVER', username + ' has connected to this room');
		socket.emit('updaterooms', rooms, 'room1');
	});

	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat',  (data)=> {
		// we tell the client to execute 'updatechat' with 2 parameters
		io.sockets.in(socket.room).emit('updatechat', socket.username, data);
	});

	socket.on('switchRoom', (newroom)=>{
		// leave the current room (stored in session)
		socket.leave(socket.room);
		// join new room, received as function parameter
		socket.join(newroom);
		socket.emit('updatechat', 'SERVER', 'you have connected to '+ newroom);
		// sent message to OLD room
		socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' has left this room');
		// update socket session room title
		socket.room = newroom;
		socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username+' has joined this room');
		socket.emit('updaterooms', rooms, newroom);
	});

	// when the user disconnects.. perform this
	socket.on('disconnect', ()=>{
		// remove the username from global usernames list
		delete usernames[socket.username];
		// update list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
		// echo globally that this client has left
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
		socket.leave(socket.room);
	});
});

http.listen(3000, ()=> {
    console.log('Example app listening on port 3000!');
});