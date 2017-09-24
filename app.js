
var io = require('socket.io-client');

this.strokeActive = false;
this.LEDallblack = true;
this.activeRed = 0;
this.activeGreen = 0;
this.activeBlue = 0;
this.blackColor =  rgb2Int(0,0,0);

this.sizeZero     = ['0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0'];  
this.sizeOne      = ['0','0','0','0','0','0','0','0','0','0','0','1','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0'];  
this.sizeTwo      = ['0','0','0','0','0','0','0','0','0','0','0','2','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0'];  
this.sizeThree    = ['0','0','0','0','0','0','0','0','0','0','0','3','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0'];  
this.sizeFour     = ['0','0','0','0','0','0','0','0','0','0','0','3','3','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0'];  
this.sizeFive     = ['0','0','0','0','0','0','0','0','0','0','1','3','3','1','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0'];  
this.sizeSix      = ['0','0','0','1','1','0','0','0','0','0','2','3','3','2','0','0','0','0','0','1','1','0','0','0','0','0','0','0','0','0','0','0'];  
this.sizeSeven    = ['0','0','1','1','1','1','0','0','0','1','3','3','3','3','1','0','0','0','1','2','2','1','0','0','0','0','0','1','1','0','0','0'];  
this.sizeEight    = ['0','0','1','2','2','1','0','0','0','2','3','3','3','3','2','0','0','0','2','3','3','2','0','0','0','0','1','2','2','1','0','0'];  
this.sizeNine     = ['0','0','2','3','3','2','0','0','1','3','3','3','3','3','3','1','0','1','3','3','3','3','1','0','0','0','2','3','3','2','0','0'];  
this.sizeTen      = ['0','1','3','3','3','3','1','0','2','3','3','3','3','3','3','2','0','2','3','3','3','3','2','0','0','1','2','3','3','2','1','0'];  
this.sizeEleven   = ['1','3','3','3','3','3','3','1','3','3','3','3','3','3','3','3','1','3','3','3','3','3','3','1','0','2','3','3','3','3','2','0'];  
this.sizeTwelve   = ['2','3','3','3','3','3','3','2','3','3','3','3','3','3','3','3','2','3','3','3','3','3','3','2','1','2','3','3','3','3','2','1'];  
this.sizeThirteen = ['3','3','3','3','3','3','3','3','3','3','3','3','3','3','3','3','2','3','3','3','3','3','3','2','2','2','3','3','3','3','2','2'];  
this.sizeFourteen = ['3','3','3','3','3','3','3','3','3','3','3','3','3','3','3','3','3','3','3','3','3','3','3','3','2','3','3','3','3','3','3','2'];  
this.sizeFifteen  = ['3','3','3','3','3','3','3','3','3','3','3','3','3','3','3','3','3','3','3','3','3','3','3','3','3','3','3','3','3','3','3','3'];  

this.brushSizes = [sizeZero,sizeOne, sizeTwo, sizeThree,sizeFour, sizeFive, sizeSix, sizeSeven, sizeEight, sizeEleven, sizeTwelve, sizeThirteen, sizeFourteen, sizeFifteen];

this.activeSize = brushSizes[0];

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
	
	  this.socket.on('newSize', event => {
		if(!event[0] || event[0].stroke.owner === self.socket.owner) return;
		console.log("Size changed");
		self.activeSize = self.brushSizes[event.stroke.size];	 
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
		var lowModifier = 4;
		var mediumModifier = 2;
		var currentColor = rgb2Int(self.activeRed,self.activeGreen,self.activeBlue);
		var currentColorLow = rgb2Int(Math.round(self.activeRed / lowModifier), Math.round(self.activeGreen / lowModifier), Math.round(self.activeBlue / lowModifier)); 
		var currentColorMedium = rgb2Int(Math.round(self.activeRed / mediumModifier), Math.round(self.activeGreen / mediumModifier), Math.round(self.activeBlue / mediumModifier)); 
		for (var i = 0; i < NUM_LEDS; i++) {
			switch (activeSize[i]){
				case 0:
					pixelData[i] = self.blackColor;
					break;
				case 1:
					pixelData[i] = currentColorLow;
					break;					
				case 2:
					pixelData[i] = currentColorMedium;
					break;					
				case 3:
					pixelData[i] = currentColor;
					break;
				default:		
					pixelData[i] = colorwheel((offset + i) % 256);
			}
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

