#!/usr/bin/env node
var http = require('http');
var io = require('socket.io');
var fs = require('fs');

var slideServer = null;
var slideServerMirrors = [];
var slideClients = [];
var url = null;
var lastStatus = null;

var server = http.createServer(function(req, res) {
	var path = __dirname + '/../' + (req.url == '/' ? '/slides/index.html' : (req.url.substr(0,12) == '/deck-remote' ? req.url.substr(1) : ('slides/' + req.url)));
	fs.readFile(path, function (err, data) {
		if (err) {
			res.writeHead(404);
			return res.end();
		}

		res.writeHead(200);
		res.end(data);
	});
});

server.listen(8080);
io.listen(server).on('connection', function (socket) {
	console.log((new Date()) + " Connection accepted.");
	socket.on('identify', function(data) {
		if (data.name == 'server') {
			slideServer = socket;
			url = data.url;
			for (c in slideClients) {
				slideClients[c].emit('url', url);
			};
		}
		else if (data.name == 'servermirror') {
			slideServerMirrors.push(socket);
			socket.emit('url', url);
			if (lastStatus) {
				socket.emit('slideStatus', lastStatus);
			}
		}
		else {
			slideClients.push(socket);
			socket.emit('slideStatus', lastStatus);
			socket.emit("url", url);
		}
	});
	socket.on('slideStatus', function(data) {
		lastStatus = data;
		for (c in slideClients) {
			slideClients[c].emit('slideStatus', lastStatus);
		};
		for (c in slideServerMirrors) {
			slideServerMirrors[c].emit('slideStatus', lastStatus);
		};
	});
	socket.on('command', function(data) {
		slideServer.emit('command', data);
	});
	socket.on('close', function(socket) {
		console.log((new Date()) + " Peer " + socket.remoteAddress + " disconnected.");
		// splice?
	});
});
