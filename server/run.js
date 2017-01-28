'use strict';

var user = require('./user.class');
var express = require('express');
var app = express();
var server = require('http').createServer(app).listen(3000);
var io = require('socket.io').listen(server);

app.use('/', express.static(__dirname.substr(0, __dirname.indexOf('/server'))));

var users = [];

io.sockets.on('connection', function (socket) {

	var User = new user();
	var id = 0;

	function sendUsers(){
		socket.emit('client:connected', users);
		socket.broadcast.emit('client:connected', users);
	}

	// Если пользователь подключился
	socket.on('client:start', function(data){
		if (!data.id) {
			id = Math.ceil( Math.random() * 1000 );
		}
		else id = data.id;

		User.new(id);

		console.log('User' + id + ': Connected.');

		socket.emit('client:me', id);
		sendUsers();
	});

	socket.on('client:all', function(data){
		sendUsers();
	});

	// Если пользователь перезашел
	socket.on('client:comeback', function(id){
		for (i in users) {
			try {
			  if (typeof users[i].id == 'number')  users[i].is_online = true;
			} catch (err) {}
		}
	});

	// Если пользователь отправил сообщение
	socket.on('on:message', function(data){
		socket.broadcast.emit('new:message', data);
		console.log('User' + id + ': new message!');
	});

	socket.on('disconnect', function () {
		console.log('User' + id + ': Disconnected.');
		User.del(id);
		sendUsers();
	});

});

exports.users = users;