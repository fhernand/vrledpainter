
var io = require('socket.io-client');

this.strokeActive = false;
this.LEDallblack = true;
this.activeRed = 0;
this.activeGreen = 0;
this.activeBlue = 0;
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

	this.socket.on('newStroke', event => {
		if(event.stroke.owner === self.socket.owner) return;
		console.log("New stroke");
		this.activeRed = Math.round(event.stroke.color[0] * 255);
		this.activeGreen = Math.round(event.stroke.color[1] * 255);
		this.activeBlue = Math.round(event.stroke.color[2] * 255);
		self.strokeActive = true;
	  });

	  this.socket.on('endStroke', () => {
		console.log("End stroke");
		self.strokeActive = false;
	  });

	  this.socket.on('newPoints', event => {
		if(!event[0] || event[0].stroke.owner === self.socket.owner) return;
		//console.log("New points");
	  });

}

var ws281x = require('rpi-ws281x-native');

var NUM_LEDS = 32,
pixelData = new Uint32Array(NUM_LEDS);
blackpixelData = new Uint32Array(NUM_LEDS);
for (var i = 0; i < NUM_LEDS; i++) {
			blackpixelData[i] = rgb2Int(0,0,0);
}
ws281x.init(NUM_LEDS);

// ---- trap the SIGINT and reset before exit
process.on('SIGINT', function () {
  ws281x.reset();
  process.nextTick(function () { process.exit(0); });
});

// ---- animation-loop
setInterval(function () {
	if (self.strokeActive){
		var currentColor = rgb2Int(self.activeRed,self.activeGreen,self.activeBlue);
		for (var i = 0; i < NUM_LEDS; i++) {
			pixelData[i] = currentColor;//colorwheel((offset + i) % 256);
		}
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
		ws281x.render(blackpixelData);
		self.LEDallblack = true;
	}	
}

function rgb2Int(r, g, b) {
  return ((r & 0xff) << 16) + ((g & 0xff) << 8) + (b & 0xff);
}

