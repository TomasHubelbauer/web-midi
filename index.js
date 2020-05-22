window.addEventListener('load', async () => {
  const inputTbody = document.getElementById('inputTbody');
  const outputTbody = document.getElementById('outputTbody');
  const messagesDiv = document.getElementById('messagesDiv');
  const akaiApcMiniDiv = document.getElementById('akaiApcMiniDiv');
  const teenageEngineeringOp1Div = document.getElementById('teenageEngineeringOp1Div');

  const midiAccess = await navigator.requestMIDIAccess();
  midiAccess.addEventListener('statechange', () => render());

  let akaiApcMini;
  let teenageEngineeringOp1;

  function render() {
    inputTbody.innerHTML = '';
    for (const key of midiAccess.inputs.keys()) {
      const input = midiAccess.inputs.get(key);
      input.addEventListener('statechange', () => render());
      input.addEventListener('midimessage', event => handleMidiMessage(input, event.data));

      const inputTr = renderPortTr(input);
      inputTbody.append(inputTr);
    }

    outputTbody.innerHTML = '';
    for (const key of midiAccess.outputs.keys()) {
      const output = midiAccess.outputs.get(key);
      output.addEventListener('statechange', () => render());

      const outputTr = renderPortTr(output);
      outputTbody.append(outputTr);
    }

    const akaiApcMiniInput = Array.from(midiAccess.inputs.values()).find(i => i.manufacturer === 'AKAI  Professional M.I. Corp.' && i.name === 'APC MINI');
    const akaiApcMiniOutput = Array.from(midiAccess.outputs.values()).find(i => i.manufacturer === 'AKAI  Professional M.I. Corp.' && i.name === 'APC MINI');
    if (akaiApcMiniInput && akaiApcMiniOutput && !akaiApcMini) {
      akaiApcMini = new AkaiApcMini(akaiApcMiniInput, akaiApcMiniOutput);
    }


    akaiApcMiniDiv.textContent = (akaiApcMiniInput && akaiApcMiniOutput) ? '' : 'Akai APC Mini is not connected.';
    teenageEngineeringOp1Div.textContent = 'TODO';
  }

  function renderPortTr(port) {
    const portTr = document.createElement('tr');

    const connectionTd = document.createElement('td');
    connectionTd.textContent = port.connection;
    portTr.append(connectionTd);

    const idTd = document.createElement('td');
    idTd.textContent = port.id;
    portTr.append(idTd);

    const manufacturerTd = document.createElement('td');
    manufacturerTd.textContent = port.manufacturer;
    portTr.append(manufacturerTd);

    const nameTd = document.createElement('td');
    nameTd.textContent = port.name;
    portTr.append(nameTd);

    const stateTd = document.createElement('td');
    stateTd.textContent = port.state;
    portTr.append(stateTd);

    const typeTd = document.createElement('td');
    typeTd.textContent = port.type;
    portTr.append(typeTd);

    const versionTd = document.createElement('td');
    versionTd.textContent = port.version;
    portTr.append(versionTd);

    return portTr;
  }

  function handleMidiMessage(input, data) {
    const array = Array.from(data);
    const dec = array.join(', ');
    const hex = array.map(i => i.toString(16)).join(', ');
    messagesDiv.textContent += `in: ${input.id} ${dec} (${hex})\n`;
  }

  render();
});

class AkaiApcMini {
  constructor(midiInput, midiOutput) {
    this.midiInput = midiInput;
    this.midiOutput = midiOutput;
    this.input = document.getElementById('akaiApcMiniInput');
    this.img = document.getElementById('akaiApcMiniImg');
    this.code = document.getElementById('akaiApcMiniCode');
    this.canvas = document.getElementById('akaiApcMiniCanvas');

    // sprite.png
    this.img.src = [
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

    // Space between the chars in the sprite for legibility
    this.space = 1;
    this.width = 8;
    this.height = 8;
    this.chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789☺:-()., ';
    this.sizes = '44443344144355445443455554434444444451222121'.split('').map(Number);
    this.black = [0, 0, 0, 255];
    this.green = [0, 255, 0, 255];
    this.red = [255, 0, 0, 255];
    this.yellow = [255, 255, 0, 255];
    this.indexColors = [this.green, this.green, this.green, this.red, this.red, this.red, this.yellow, this.yellow];
    this.rgbaColors = { [this.black]: 0, [this.green]: 1, [this.red]: 3, [this.yellow]: 5 };

    this.input.pattern = this.chars;
    this.code.textContent = this.chars;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.context = this.canvas.getContext('2d');
    this.context.imageSmoothingEnabled = false;

    // Start scrolling from the right side not left side
    this.noScroll = -this.width;
    this.scroll = this.noScroll;
    this.render();
  }

  render() {
    this.scroll++;

    this.context.clearRect(0, 0, this.width, this.height);

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
            imageData.data.set(this.indexColors[color % this.indexColors.length], index);
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
      this.midiOutput.send([0x90, index, this.rgbaColors[rgba] || 0]);
    }

    window.setTimeout(() => this.render(), 75);
  }
}
