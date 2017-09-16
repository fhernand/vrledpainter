var UnicornHatHD = require('unicornhat-hd');

var unicornHatHD = new UnicornHatHD('/dev/spidev0.0');

unicornHatHD.setBrightness(1.0);

unicornHatHD.setPixel(0, 0, 255, 0, 0);
unicornHatHD.setPixel(1, 0, 0, 255, 0);
unicornHatHD.setPixel(2, 0, 0, 0, 255);

var flipHorizontal = true;
var flipVertical = false;

unicornHatHD.show(flipHorizontal, flipVertical);
