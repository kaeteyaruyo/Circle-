import * as express from 'express';
import * as socketIo from 'socket.io';
import { createServer, Server } from 'http';
import * as path from 'path';

class IoChat{
    protected io;

    constructor(http){
        this.io = socketIo(http);
    }
    
    public getIo(){
        return this.io;
    }

    public openConnetion(connectionName : String, callback : Function){
        
    }
}

export { IoChat };