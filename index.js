window.addEventListener('load', async () => {
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

  black = [0, 0, 0, 255];
  green = [0, 255, 0, 255];
  red = [255, 0, 0, 255];
  yellow = [255, 255, 0, 255];

  colors = [this.green, this.green, this.green, this.red, this.red, this.red, this.yellow, this.yellow];
  rgbaColors = { [this.black]: 0, [this.green]: 1, [this.red]: 3, [this.yellow]: 5 };

  noScroll = -this.width; // Start scrolling from the right side not left side
  scroll = this.noScroll;

  rate = 75;

  constructor(ports, element) {
    this.ports = ports;

    this.img = document.createElement('img');
    this.img.src = [ // sprite.png
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAAAICAYAAAC8sLAqAAAAAXNSR0',
      'IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsEAAA7BAbiRa+0AAAIBSURBVFhH7Zbbbg',
      'IxDES7/P8/b5nIB3mNszjJAn3okaLEk/GFUKRu+77/bNu2/9y5nzftxAJNVHxRO/P4OJ69Btldpg',
      'nF2rnz5+gj9j4fi5hjx7K351Ps76Im3qGb1MCD7nOEr5N5RvKgV6/qE5k2gvKVy27ygRuXGE1vTb',
      '1W9Qk0Cw9xr847oId2kxpZX3zkmHz6Dl4XUfNeNJ39/g2Yyc+QzSriOXoyTaBb2MCHnuUSaykWmS',
      '/ThL9vQgfydY41PDfbh6DwKqt1/If853pm33cmL/qv/G57f/wVpn4gf4GVB1TeyqPNMDKrn6/yOU',
      'f98Mob74h93lk+M4HiqGW8muuMbK7ZWqL9QLLB0WaKZ7Xs+ID6FqYzXMHK4wjmqtSJXu1ozXARWT',
      '160Vv4/vEuxlWyvF59v+uOhSZ09nEGOVo6R62ZCoz6RfuBqBmNAW20oMhq2fFBr5+FD3r95Z2ZDa',
      'r5I3NlPvJXZq2g+lkfZmIXeC0s08uTpkVvYs7ae8TcDPpGH5qFT98JMXv0V5j6FysO8i3ig30Ses',
      'cH9zOtzNarn+F95LWLD1Dt9YmZ+Ows/ybNMIhqdH8gWZOoiTPNwgO9Oj1G/PgsfImvV+0Tfdrt6o',
      'noNflAxQN4/W5XwyifpZiaWmd18WgpruZlvkzL6PkyTWeWSSm6V67OvsZR27dfeX12KOVsFwkAAA',
      'AASUVORK5CYII=',
      '',
    ].join('');

    this.input = document.createElement('input');
    this.input.placeholder = 'Type text to marquee';
    this.input.pattern = this.chars;

    const canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;

    element.append(this.img, this.chars, this.input, canvas);

    this.context = canvas.getContext('2d');
    this.context.imageSmoothingEnabled = false;

    this.render();
  }


  manufacturer = 'AKAI  Professional M.I. Corp.';
  name = 'APC MINI';

  render(ports) {
    // Clear the canvas here so it does not keep the last frame if disconnected
    this.context.clearRect(0, 0, this.width, this.height);

    // Persist new ports unless called from the interval in which case reuse
    this.ports = ports || this.ports;
    const input = this.ports.find(p => p.type === 'input' && p.manufacturer === this.manufacturer && p.name === this.name);
    const output = this.ports.find(p => p.type === 'output' && p.manufacturer === this.manufacturer && p.name === this.name);

    if (!input || input.state === 'disconnected' || !output || output.state === 'disconnected') {
      this.input.disabled = true;
      return;
    }
    else {
      this.input.disabled = false;
    }

    this.scroll++;

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
          if (this.rgbaColors[rgba] === 0) {
            imageData.data.set(this.colors[color % this.colors.length], index);
          }
        }
      }

      this.context.putImageData(imageData, 0, 0);

      offset += size + this.space;
      color++;
    }

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
    }

    window.setTimeout(() => this.render(), this.rate);
  }
}
