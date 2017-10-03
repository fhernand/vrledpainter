var ws281x = require('rpi-ws281x-native');

var UnicornHatHD = require('unicornhat-hd');
 
var unicornHatHD = new UnicornHatHD('/dev/spidev0.0');
 
unicornHatHD.setBrightness(1.0);
UnicornHatHD.clear();

var NUM_LEDS = 32;

/*
// ---- trap the SIGINT and reset before exit
process.on('SIGINT', function () {
  ws281x.reset();
  process.nextTick(function () { process.exit(0); });
});
*/

// ---- animation-loop
var offset = 0;
setInterval(function () {
  for (var i = 0; i < NUM_LEDS; i++) {
	unicornHatHD.setPixel(i, red(i), green(i), blue(i));
    //pixelData[i] = colorwheel((offset + i) % 256);
  }

  offset = (offset + 1) % 256;
}, 1000 / 30);

console.log('Press <ctrl>+C to exit.');


function red(pos){
  pos = 255 - pos;
  if (pos < 85) { return 255 - pos * 3; }
  else if (pos < 170) { return 0; }
  else { pos -= 170; return pos * 3; }
	
}

function green(pos){
  pos = 255 - pos;
  if (pos < 85) { return 0; }
  else if (pos < 170) { pos -= 85; return pos * 3; }
  else { pos -= 170; return 255 - pos * 3; }
	
}

function blue(pos) {
  pos = 255 - pos;
  if (pos < 85) { return pos * 3; }
  else if (pos < 170) { pos -= 85; return 255 - pos * 3; }
  else { pos -= 170; return 0; }
}
