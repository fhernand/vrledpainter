
var express = require('express');  
var app = express();  
var server = require('http').createServer(app);
var io = require('socket.io-client');
 
this.strokeBuffer = [];
this.lastBufferProcess = 0;

if(io){
	this.socket = io.connect('http://102.168.0.185:3002');
	var self = this;
	self.joinedRoom = 'theRoom';
	this.socket.on('connect', function (socket) {
		console.log('Connected!');
	});

	this.socket.on('giveOwner', owner => {
		self.socket.owner = owner;
		self.socket.emit('joinRoom', self.joinedRoom);
		console.log('Owner: ', self.socket.owner);
		console.log('Room: ', self.joinedRoom);
	});

	this.socket.on('joinedRoom', function (roomlog){
		console.log(roomlog);
	});
	
	this.socket.on('removeStroke', event => {
        if(event.stroke.owner === self.socket.owner) event.stroke.owner = 'local';
        this.system.removeStoke(event);
      });

	  this.socket.on('newStroke', event => {
		if(event.stroke.owner === self.socket.owner) return;
		this.strokeBuffer.push(event);
	  });

	  this.socket.on('newPoints', event => {
		if(!event[0] || event[0].stroke.owner === self.socket.owner) return;
		this.strokeBuffer.push(event);
	  });

	  this.socket.on('userMove', event => {
		if(event.owner === self.socket.owner) return;
		this.system.userMove(event);
	  });

	  this.socket.on('userLeave', event => {
		if(event.owner === self.socket.owner) return;
		this.system.userLeave(event);
	  });	
	  
  });		  
}


