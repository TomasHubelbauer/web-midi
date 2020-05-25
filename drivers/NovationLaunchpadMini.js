import Marquee from '../Marquee.js';

export default class NovationLaunchpadMini {
  static name = 'Novation LaunchPad Mini';

  constructor(element) {
    this.marquee = new Marquee();
    window.setInterval(() => this.render(), 200);
  }

  manufacturer = 'Focusrite-Novation';
  name = 'Launchpad Mini';

  // 1     2     3      4    5     6     7     8
  // (off) (off) (off) (off) (off) (off) (off) (off) (off      )
  // [  0] [  1] [  2] [  3] [  4] [  5] [  6] [  7] (  8 -  15) A
  // [ 16] [ 17] [ 18] [ 19] [ 20] [ 21] [ 22] [ 23] ( 24 -  31) B
  // [ 32] [ 33] [ 34] [ 35] [ 36] [ 37] [ 38] [ 39] ( 40 -  47) C
  // [ 48] [ 49] [ 50] [ 51] [ 52] [ 53] [ 54] [ 55] ( 56 -  63) D
  // [ 64] [ 65] [ 66] [ 67] [ 68] [ 69] [ 70] [ 71] ( 72 -  79) E
  // [ 80] [ 81] [ 82] [ 83] [ 84] [ 85] [ 86] [ 87] ( 88 -  95) F
  // [ 96] [ 97] [ 98] [ 99] [100] [101] [102] [103] (104 - 111) G
  // [112] [113] [114] [115] [116] [117] [118] [119] (120 - 127) H

  // values 0-31   = value % 4: dim red, dim-mid red, lit-mid red, lit red
  // values 32-127 = value % 4: green, yellow, half orange, full orange
  // e.g.: 0 = off, 3 = red, 32 = green, 33 = yellow, 35 = orange

  colors = [0, 3, 32, 33, 35];
  color = 0;

  red = [255, 0, 0, 255];
  green = [0, 255, 0, 255];
  yellow = [255, 255, 0, 255];
  orange = [255, 128, 0, 255];

  animation = 'marquee'; // colors | marquee
  scroll = 0;

  render(ports) {
    // Remember the ports for when called from the interval
    this.ports = ports || this.ports;

    const output = this.ports.find(p => p.type === 'output' && p.manufacturer === this.manufacturer && p.name === this.name);
    if (!output) {
      return;
    }

    const text = 'TEST';
    const chars = text.split('').map(char => ({ char, color: this.red }))
    this.marquee.render(chars, this.scroll++);
    if (this.scroll === 16) {
      this.scroll = -8;
    }

    let counter = 0;
    for (let index = 0; index < 128; index++) {
      if (index % 16 >= 8) {
        output.send([0x90, index, 0]);
        continue;
      }

      switch (this.animation) {
        case 'colors': {
          output.send([0x90, index, this.colors[this.color % this.colors.length]]);
          break;
        }
        case 'marquee': {
          output.send([0x90, index, this.marquee.pixel(counter++).toString() === '255,0,0,255' ? 3 : 0]);
          break;
        }
      }
    }

    this.color++;
  }
}
