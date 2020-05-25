import Widget from '../devices/AkaiApcMini.js';

export default class AkaiApcMini {
  width = 8; // 8 columns on the launchpad button grid
  height = 8; // 8 rows on the launchpad button grid

  none = [129, 129, 129, 255];
  green = [0, 255, 0, 255];
  red = [255, 0, 0, 255];
  yellow = [255, 255, 0, 255];

  colors = [this.green, this.green, this.green, this.red, this.red, this.red, this.yellow, this.yellow];
  rgbaColors = { [this.green]: 1, [this.red]: 3, [this.yellow]: 5 };

  noScroll = -8; // Start scrolling from the right side not left side
  scroll = this.noScroll;
  marquee = true;
  timeout = undefined;

  rate = 250;

  listener = undefined;

  static name = 'Akai APCmini';

  constructor(element) {
    this.input = document.createElement('input');
    this.input.placeholder = 'Type text to marquee';
    this.input.pattern = this.chars;

    this.marqueeButton = document.createElement('button');
    this.marqueeButton.addEventListener('click', () => this.marquee = !this.marquee);

    this.slideLeftButton = document.createElement('button');
    this.slideLeftButton.textContent = '⏪️';
    this.slideLeftButton.addEventListener('click', () => {
      this.scroll++;
      this.render();
    });

    this.slideRightButton = document.createElement('button');
    this.slideRightButton.textContent = '⏩️';
    this.slideRightButton.addEventListener('click', () => {
      this.scroll--;
      this.render();
    });

    const marqueeFieldSet = document.createElement('fieldset');
    const marqueeLegend = document.createElement('legend');
    marqueeLegend.textContent = 'Marquee';
    marqueeFieldSet.append(marqueeLegend, this.chars, this.img, this.input, this.marqueeButton, this.slideLeftButton, this.slideRightButton);

    const fadersFieldset = document.createElement('fieldset');
    const fadersLegend = document.createElement('legend');
    fadersLegend.textContent = 'Faders';
    const fadersP = document.createElement('p');
    fadersP.textContent = 'Stop the Marquee animation and move the faders to see their columns display the level.';
    fadersFieldset.append(fadersLegend, fadersP);

    const visualizerFieldset = document.createElement('fieldset');
    const visualizerLegend = document.createElement('legend');
    visualizerLegend.textContent = 'Visualizer';
    const visualizerP = document.createElement('p');
    visualizerP.textContent = 'Stop the Marquee animation and click the button to see the faders and their columns visualize a song.';
    const visualizerButton = document.createElement('button');
    visualizerButton.textContent = 'Play';
    visualizerButton.addEventListener('click', async () => {
      const audio = document.createElement('audio');
      audio.src = 'thefatrat-the-calling-feat-laura-brehm.mp3';
      await audio.play();

      const audioContext = new AudioContext();
      const source = audioContext.createMediaElementSource(audio);
      const analyzer = audioContext.createAnalyser();
      source.connect(analyzer);
      analyzer.connect(audioContext.destination);

      analyzer.fftSize = 32;
      const data = new Uint8Array(analyzer.frequencyBinCount);
      window.setInterval(() => {
        analyzer.getByteTimeDomainData(data);
        const levels = new Array(8);
        for (let index = 0; index < data.length; index++) {
          const bin = ~~((index / data.length) * levels.length);
          if (!levels[bin]) {
            levels[bin] = [];
          }

          levels[bin].push(data[index]);
        }

        for (let index = 0; index < 8; index++) {
          this.fade(48 + index, ((levels[index].reduce((a, c) => a + c, 0) / levels[index].length) / 255));
        }
      }, 100);
    });

    visualizerFieldset.append(visualizerLegend, visualizerP, visualizerButton);

    element.append(marqueeFieldSet, fadersFieldset, visualizerFieldset);
    this.widget = new Widget(element);
  }

  manufacturer = 'AKAI  Professional M.I. Corp.';
  name = 'APC MINI';

  fade(number, ratio) {
    if (!this.ports) {
      return;
    }

    const output = this.ports.find(p => p.type === 'output' && p.manufacturer === this.manufacturer && p.name === this.name);
    if (!output || output.state === 'disconnected' || number === 56) {
      return;
    }

    const fader = number - 48;
    this.widget.fade(fader, ratio);

    const level = 7 - ~~(ratio * 7);
    for (let index = 0; index < 8; index++) {
      const rgbaColor = [this.green, this.green, this.green, this.yellow, this.yellow, this.yellow, this.red, this.red][index];
      const color = this.rgbaColors[rgbaColor];
      this.widget.color(fader + index * 8, `rgba(${index <= level ? rgbaColor : this.none})`);
      output.send([0x90, fader + index * 8, index <= level ? color : 0]);
    }
  }

  render(ports) {
    // Ditch the render attempt as the animation going on will take care of it
    if (this.timeout) {
      return;
    }

    // Remember the ports for the fader
    this.ports = this.ports || ports;

    const input = this.ports.find(p => p.type === 'input' && p.manufacturer === this.manufacturer && p.name === this.name);
    const output = this.ports.find(p => p.type === 'output' && p.manufacturer === this.manufacturer && p.name === this.name);

    if (!input || input.state === 'disconnected' || !output || output.state === 'disconnected') {
      this.input.disabled = true;
      this.marqueeButton.disabled = true;
      this.marqueeButton.textContent = 'AKAI APCmini is not connected.';
      return;
    }
    else {
      this.input.disabled = false;
      this.marqueeButton.disabled = false;
      this.marqueeButton.textContent = this.marquee ? '⏹️' : '▶️';
    }

    if (this.listener !== input) {
      this.listener = input;
      input.addEventListener('midimessage', ({ data }) => {
        if (data[0] === 176) {
          this.fade(data[1], 1 - data[2] / 127);
        }
      });
    }

    this.slideLeftButton.disabled = this.marquee;
    this.slideRightButton.disabled = this.marquee;

    if (this.marquee) {
      this.scroll++;
    }

    const chars = (this.input.value || new Date().toISOString().slice(11, 19)).map((char, index) => ({ char, color: this.colors[index % this.colors.length] }));
    this.marquee.render(chars, this.scroll);

    if (this.marquee) {
      // Reset scroll once it passes the length of the text which might change mid-scroll
      if (this.scroll >= offset) {
        // Start scrolling from the right side not left side
        this.scroll = this.noScroll;
      }

      for (let index = 0; index < 8 * 8; index++) {
        // Flip index from launchpad left to right, bottom to top to canvas left to right, top to bottom
        const rgba = this.marquee.pixel((8 - 1 - ~~(index / 8)) * 8 + (index % 8));
        output.send([0x90, index, this.rgbaColors[rgba] || 0]);
        this.widget.color(index, `rgba(${rgba.join() === this.none.toString() ? this.none : rgba})`);
      }
    }

    this.timeout = window.setTimeout(() => {
      this.timeout = undefined;
      this.render();
    }, this.rate);
  }
}
