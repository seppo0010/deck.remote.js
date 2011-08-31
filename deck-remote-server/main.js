#!/usr/bin/env node
var WebSocketServer = require('./websocket-server').server;
var http = require('http');

var server = http.createServer(function(request, response) {
	    console.log((new Date()) + " Received request for " + request.url);
	        response.writeHead(404);
		    response.end();
});
server.listen(8080, function() {
	    console.log((new Date()) + " Server is listening on port 8080");
});

wsServer = new WebSocketServer({
	    httpServer: server,
	        autoAcceptConnections: true
});

var slideServer = null;
var slideServerMirrors = [];
var slideClients = [];
var url = null;
var lastStatus = '{}';
wsServer.on('connect', function(connection) {
	console.log((new Date()) + " Connection accepted.");
	connection.on('message', function(message) {
		if (message.type === 'utf8') {
			console.log("Received Message: " + message.utf8Data);
			var data = JSON.parse(message.utf8Data);
			if (data.type == 'identify') {
				if (data.data == 'server') {
					slideServer = connection;
					url = data.url;
					for (c in slideClients) {
						slideClients[c].sendUTF('{"type":"url", "data":"' + url + '"}');
					};
				}
				else if (data.data == 'servermirror') {
					slideServerMirrors.push(connection);
					connection.sendUTF(lastStatus);
				}
				else {
					slideClients.push(connection);
					connection.sendUTF(lastStatus);
					connection.sendUTF('{"type":"url", "data":"' + url + '"}');
				}
			}
			else if (data.type == 'command') {
				slideServer.sendUTF(message.utf8Data);
			}
			else if (data.type == 'status') {
				lastStatus = message.utf8Data;
				for (c in slideClients) {
					slideClients[c].sendUTF(lastStatus);
				};
				for (c in slideServerMirrors) {
					slideServerMirrors[c].sendUTF(lastStatus);
				};
			}
			//connection.sendUTF(message.utf8Data);
		}
		else if (message.type === 'binary') {
			console.log("Received Binary Message of " + message.binaryData.length + " bytes");
			//connection.sendBytes(message.binaryData);
		}
	});
	connection.on('close', function(connection) {
		console.log((new Date()) + " Peer " + connection.remoteAddress + " disconnected.");
	});
});
/*
server.addListener("connection", function(connection){
	console.log("connected");
	connection.addListener("message", function(msg){
		console.log(msg);
		//server.send(msg);
	});
});

server.listen(8080);
*/
