"use strict";
exports.__esModule = true;
var express = require("express");
var http_1 = require("http");
var path = require("path");
var socketIo = require("socket.io");
var Io_1 = require("./Io");
var app = express();
var http = http_1.createServer(app);
var io = socketIo(http);
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '../../client/index.html'));
});
app.get('/2', function (req, res) {
    res.sendFile(path.join(__dirname, '../../client/index2.html'));
});
Io_1.createIo(io);
http.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});
