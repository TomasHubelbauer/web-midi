window.addEventListener('load', async () => {
  try {
    await navigator.requestMIDIAccess();
  }
  catch (error) {
    alert('Bummer, Web MIDI is not supported by your browser. Try Chrome or Edge.');
    return;
  }

  const midiAccess = await navigator.requestMIDIAccess();
  const ports = [...Array.from(midiAccess.inputs.values()), ...Array.from(midiAccess.outputs.values())];

  const inputsDiv = document.getElementById('inputsDiv');
  const inputs = new Inputs(ports, inputsDiv);

  const outputsDiv = document.getElementById('outputsDiv');
  const outputs = new Outputs(ports, outputsDiv);

  const akaiApcMiniDiv = document.getElementById('akaiApcMiniDiv');
  const akaiApcMini = new AkaiApcMini(ports, akaiApcMiniDiv);

  midiAccess.addEventListener('statechange', () => {
    const ports = [...Array.from(midiAccess.inputs.values()), ...Array.from(midiAccess.outputs.values())];
    inputs.render(ports);
    outputs.render(ports);
    akaiApcMini.render(ports);
  });
});

class Ports {
  titles = ['connection', 'id', 'manufacturer', 'name', 'state', 'type', 'version'];
  constructor(type, ports, element) {
    this.type = type;
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');
    for (const title of this.titles) {
      const th = document.createElement('th');
      th.textContent = title;
      tr.append(th);
    }

    thead.append(tr);

    this.tbody = document.createElement('tbody');

    table.append(thead, this.tbody);
    element.append(table);
    this.render(ports);
  }

  render(ports) {
    const tbody = document.createElement('tbody');
    for (const port of ports) {
      if (port.type !== this.type) {
        continue;
      }

      const tr = document.createElement('tr');

      const connectionTd = document.createElement('td');
      connectionTd.textContent = port.connection;
      tr.append(connectionTd);

      const idTd = document.createElement('td');
      idTd.textContent = port.id;
      tr.append(idTd);

      const manufacturerTd = document.createElement('td');
      manufacturerTd.textContent = port.manufacturer;
      tr.append(manufacturerTd);

      const nameTd = document.createElement('td');
      nameTd.textContent = port.name;
      tr.append(nameTd);

      const stateTd = document.createElement('td');
      stateTd.textContent = port.state;
      tr.append(stateTd);

      const typeTd = document.createElement('td');
      typeTd.textContent = port.type;
      tr.append(typeTd);

      const versionTd = document.createElement('td');
      versionTd.textContent = port.version;
      tr.append(versionTd);

      tbody.append(tr);
    }

    this.tbody.replaceWith(tbody);
    this.tbody = tbody;
  }
}

class Inputs extends Ports {
  constructor(ports, element) {
    super('input', ports, element);
  }
}

class Outputs extends Ports {
  constructor(ports, element) {
    super('output', ports, element);
  }
}

class AkaiApcMini {
  width = 8; // 8 columns on the launchpad button grid
  height = 8; // 8 rows on the launchpad button grid

  space = 1; // Space between the chars in the sprite
  chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789☺:-()., ';
  sizes = '44443344144355445443455554434444444451222121'.split('').map(Number);

  none = [129, 129, 129, 255];
  green = [0, 255, 0, 255];
  red = [255, 0, 0, 255];
  yellow = [255, 255, 0, 255];

  colors = [this.green, this.green, this.green, this.red, this.red, this.red, this.yellow, this.yellow];
  rgbaColors = { [this.green]: 1, [this.red]: 3, [this.yellow]: 5 };

  noScroll = -this.width; // Start scrolling from the right side not left side
  scroll = this.noScroll;
  marquee = true;
  timeout = undefined;

  rate = 250;

  listener = undefined;

  constructor(ports, element) {
    this.ports = ports;

    this.img = document.createElement('img');
    this.img.src = 'sprite.png';

    this.input = document.createElement('input');
    this.input.placeholder = 'Type text to marquee';
    this.input.pattern = this.chars;

    const canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;

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

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '23.5cm');
    svg.setAttribute('height', '19.9cm');

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', '2mm');
    rect.setAttribute('y', '2mm');
    rect.setAttribute('width', '23.1cm');
    rect.setAttribute('height', '19.5cm');
    rect.setAttribute('rx', '6mm');
    rect.setAttribute('stroke', 'black');
    rect.setAttribute('stroke-width', '2mm');
    rect.setAttribute('fill', '#333');
    svg.append(rect);

    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', `${6 + 25 * x}mm`);
        rect.setAttribute('y', `${19.5 + 13.75 * y}mm`);
        rect.setAttribute('width', '21mm');
        rect.setAttribute('height', '1cm');
        rect.setAttribute('rx', '.5mm');
        rect.setAttribute('stroke', 'black');
        rect.setAttribute('stroke-width', '.5mm');
        rect.setAttribute('fill', '#777');
        svg.append(rect);

        this[`button${(7 - y) * this.width + x}`] = rect;
      }
    }

    for (let y = 0; y < 8; y++) {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', '21.2cm');
      rect.setAttribute('y', `${19.5 + 13.75 * y}mm`);
      rect.setAttribute('width', '1cm');
      rect.setAttribute('height', '1cm');
      rect.setAttribute('rx', '5mm');
      rect.setAttribute('stroke', 'black');
      rect.setAttribute('stroke-width', '.5mm');
      rect.setAttribute('fill', '#777');
      svg.append(rect);
    }

    for (let x = 0; x < 8; x++) {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', `${12.5 + 25 * x}mm`);
      rect.setAttribute('y', '13cm');
      rect.setAttribute('width', '1cm');
      rect.setAttribute('height', '1cm');
      rect.setAttribute('rx', '5mm');
      rect.setAttribute('stroke', 'black');
      rect.setAttribute('stroke-width', '.5mm');
      rect.setAttribute('fill', '#777');
      svg.append(rect);
    }

    {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', `${12.5 + 25 * 8}mm`);
      rect.setAttribute('y', `${19.5 + 13.75 * 8}mm`);
      rect.setAttribute('width', '1cm');
      rect.setAttribute('height', '1cm');
      rect.setAttribute('stroke', 'black');
      rect.setAttribute('stroke-width', '.5mm');
      rect.setAttribute('fill', '#777');
      svg.append(rect);
    }

    for (let x = 0; x < 9; x++) {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', `${6 + 25 * x}mm`);
      rect.setAttribute('y', '14.5cm');
      rect.setAttribute('width', '2.1cm');
      rect.setAttribute('height', '4.8cm');
      rect.setAttribute('rx', '1mm');
      rect.setAttribute('stroke', 'black');
      rect.setAttribute('stroke-width', '1mm');
      rect.setAttribute('fill', '#333');
      svg.append(rect);

      {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', `${6 + 25 * x + 9}mm`);
        rect.setAttribute('y', '15.1cm');
        rect.setAttribute('width', '3mm');
        rect.setAttribute('height', '37mm');
        rect.setAttribute('rx', '.1mm');
        svg.append(rect);
      }

      {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', `${6 + 25 * x + 3}mm`);
        rect.setAttribute('y', '14.8cm');
        rect.setAttribute('width', '1.5cm');
        rect.setAttribute('height', '1.5cm');
        rect.setAttribute('rx', '1mm');
        rect.setAttribute('stroke', 'black');
        rect.setAttribute('stroke-width', '.5mm');
        rect.setAttribute('fill', '#222');
        svg.append(rect);
        this[`fader${48 + x}-a`] = rect;
      }

      {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', `${6 + 25 * x + 3}mm`);
        rect.setAttribute('y', '15.3cm');
        rect.setAttribute('width', '1.5cm');
        rect.setAttribute('height', '.5cm');
        rect.setAttribute('rx', '1mm');
        svg.append(rect);
        this[`fader${48 + x}-b`] = rect;
      }

      {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', `${6 + 25 * x + 3}mm`);
        rect.setAttribute('y', '15.51cm');
        rect.setAttribute('width', '1.5cm');
        rect.setAttribute('height', '1mm');
        rect.setAttribute('rx', '.5mm');
        rect.setAttribute('fill', '#ddd');
        svg.append(rect);
        this[`fader${48 + x}-c`] = rect;
      }

      this.fade(48 + x, Math.random());
    }

    element.append(marqueeFieldSet, fadersFieldset, svg);

    this.context = canvas.getContext('2d');
    this.context.imageSmoothingEnabled = false;

    this.render();

    window.document.body.addEventListener('click', () => {
      const audio = document.createElement('audio');
      audio.src = 'thefatrat-the-calling-feat-laura-brehm.mp3';
      audio.play();

      const audioContext = new AudioContext();
      const source = audioContext.createMediaElementSource(audio);
      const analyzer = audioContext.createAnalyser();
      source.connect(analyzer);
      analyzer.connect(audioContext.destination);

      analyzer.fftSize = 32;
      const data = new Uint8Array(analyzer.frequencyBinCount);
      window.setInterval(() => {
        analyzer.getByteTimeDomainData(data);
        const levels = new Array(this.width);
        for (let index = 0; index < data.length; index++) {
          const bin = ~~((index / data.length) * levels.length);
          if (!levels[bin]) {
            levels[bin] = [];
          }

          levels[bin].push(data[index]);
        }

        for (let index = 0; index < this.width; index++) {
          this.fade(48 + index, ((levels[index].reduce((a, c) => a + c, 0) / levels[index].length) / 255));
        }
      }, 100);
    });


  }

  manufacturer = 'AKAI  Professional M.I. Corp.';
  name = 'APC MINI';

  fade(number, ratio) {
    this[`fader${number}-a`].setAttribute('y', `${14.8 + ratio * 2.7}cm`);
    this[`fader${number}-b`].setAttribute('y', `${15.3 + ratio * 2.7}cm`);
    this[`fader${number}-c`].setAttribute('y', `${15.51 + ratio * 2.7}cm`);
    const output = this.ports.find(p => p.type === 'output' && p.manufacturer === this.manufacturer && p.name === this.name);
    if (!output || output.state === 'disconnected' || number === 56) {
      return;
    }

    const fader = number - 48;
    const level = 7 - ~~(ratio * 7);
    for (let index = 0; index < 8; index++) {
      const rgbaColor = [this.green, this.green, this.green, this.yellow, this.yellow, this.yellow, this.red, this.red][index];
      const color = this.rgbaColors[rgbaColor];
      this[`button${fader + index * 8}`].setAttribute('fill', `rgba(${index <= level ? rgbaColor : this.none})`);
      output.send([0x90, fader + index * 8, index <= level ? color : 0]);
    }
  }

  render(ports) {
    // Ditch the render attempt as the animation going on will take care of it
    if (this.timeout) {
      return;
    }

    // Clear the canvas here so it does not keep the last frame if disconnected
    this.context.fillStyle = `rgb(${this.none.slice(0, 3)})`;
    this.context.fillRect(0, 0, this.width, this.height);

    // Persist new ports unless called from the interval in which case reuse
    this.ports = ports || this.ports;
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

    /** @type {ImageData} */
    let imageData;

    let offset = 0;
    let color = 0;
    for (const char of this.input.value || new Date().toISOString().slice(11, 19)) {
      if (!this.chars.includes(char)) {
        continue;
      }

      const index = this.chars.indexOf(char);
      const shift = this.sizes.slice(0, index).reduce((a, c) => a + c + this.space, 0);
      const size = this.sizes[index];

      // Draw the black glyph from the sprite
      this.context.drawImage(this.img, shift, 0, size, this.height, -this.scroll + offset, 0, size, this.height);

      // Color the black glyph the current color
      imageData = this.context.getImageData(0, 0, this.width, this.height);
      for (let x = 0; x < this.width; x++) {
        for (let y = 0; y < this.height; y++) {
          const index = y * this.width * 4 + x * 4;
          const rgba = imageData.data.slice(index, index + 4);
          if (rgba.toString() === '0,0,0,255') {
            imageData.data.set(this.colors[color % this.colors.length], index);
          }
        }
      }

      this.context.putImageData(imageData, 0, 0);

      offset += size + this.space;
      color++;
    }

    if (this.marquee) {
      // Reset scroll once it passes the length of the text which might change mid-scroll
      if (this.scroll >= offset) {
        // Start scrolling from the right side not left side
        this.scroll = this.noScroll;
      }

      for (let index = 0; index < this.width * this.height; index++) {
        // Flip index from launchpad left to right, bottom to top to canvas left to right, top to bottom
        const realIndex = (this.height - 1 - ~~(index / this.width)) * this.height + (index % this.width);
        const rgba = imageData.data.slice(realIndex * 4, realIndex * 4 + 4);
        output.send([0x90, index, this.rgbaColors[rgba] || 0]);
        this[`button${index}`].setAttribute('fill', `rgba(${rgba.join() === this.none.toString() ? this.none : rgba})`);
      }
    }

    this.timeout = window.setTimeout(() => {
      this.timeout = undefined;
      this.render();
    }, this.rate);
  }
}
