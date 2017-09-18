
var io = require('socket.io-client');
 
this.strokeBuffer = [];
this.lastBufferProcess = 0;

this.strokeActive = false;
this.LEDallblack = true;
this.activeColor = '#ffffff'
var self = this;

if(io){
	this.socket = io.connect('http://192.168.0.220:3002');
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
		console.log("Joined the Room!");
	});
	
	this.socket.on('removeStroke', event => {
        if(event.stroke.owner === self.socket.owner) event.stroke.owner = 'local';
        //this.system.removeStoke(event);
	console.log("Remove Stroke");
      });

	  this.socket.on('newStroke', event => {
		if(event.stroke.owner === self.socket.owner) return;
		//this.strokeBuffer.push(event);
		console.log("New stroke");
		self.activeColor = event.stroke.color  
		console.log(self.activeColor);  
		self.strokeActive = true;
	  });

	  this.socket.on('endStroke', () => {
		console.log("End stroke");
		self.strokeActive = false;
	  });

	  this.socket.on('newPoints', event => {
		if(!event[0] || event[0].stroke.owner === self.socket.owner) return;
		//this.strokeBuffer.push(event);
		//console.log("New points");
	  });

	  this.socket.on('userMove', event => {
		if(event.owner === self.socket.owner) return;
		//this.system.userMove(event);
	  });

	  this.socket.on('userLeave', event => {
		if(event.owner === self.socket.owner) return;
		//this.system.userLeave(event);
	  });	
	  	  
}

var ws281x = require('rpi-ws281x-native');

var NUM_LEDS = 3,
    pixelData = new Uint32Array(NUM_LEDS);
    blackpixelData = new Uint32Array(NUM_LEDS);
ws281x.init(NUM_LEDS);

// ---- trap the SIGINT and reset before exit
process.on('SIGINT', function () {
  ws281x.reset();
  process.nextTick(function () { process.exit(0); });
});

// ---- animation-loop
var offset = 0;
setInterval(function () {
	if (self.strokeActive){
		for (var i = 0; i < NUM_LEDS; i++) {
			pixelData[i] = colorwheel((offset + i) % 256);
		}
		offset = (offset + 1) % 256;
		ws281x.render(pixelData);
		if(self.LEDallblack){
			self.LEDallblack = false;
		}
	} else {
		clearLEDs();
	}
}, 1000 / 30);

function clearLEDs(){
	if (!self.LEDallblack){
		for (var i = 0; i < NUM_LEDS; i++) {
			blackpixelData[i] = rgb2Int(0,0,0);
		}
		ws281x.render(blackpixelData);
		self.LEDallblack = true;
	}	
}
// rainbow-colors, taken from http://goo.gl/Cs3H0v
function colorwheel(pos) {
  pos = 255 - pos;
  if (pos < 85) { return rgb2Int(255 - pos * 3, 0, pos * 3); }
  else if (pos < 170) { pos -= 85; return rgb2Int(0, pos * 3, 255 - pos * 3); }
  else { pos -= 170; return rgb2Int(pos * 3, 255 - pos * 3, 0); }
}

function rgb2Int(r, g, b) {
  return ((r & 0xff) << 16) + ((g & 0xff) << 8) + (b & 0xff);
}

