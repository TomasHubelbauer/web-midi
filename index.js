window.addEventListener('load', async () => {
  const inputTbody = document.getElementById('inputTbody');
  const outputTbody = document.getElementById('outputTbody');
  const messagesDiv = document.getElementById('messagesDiv');
  const akaiApcMiniTextInput = document.getElementById('akaiApcMiniInput');
  const akaiApcMiniCanvas = document.getElementById('akaiApcMiniCanvas');
  const akaiApcMiniDiv = document.getElementById('akaiApcMiniDiv');
  const teenageEngineeringOp1Div = document.getElementById('teenageEngineeringOp1Div');

  const midiAccess = await navigator.requestMIDIAccess();
  midiAccess.addEventListener('statechange', () => render());

  let akaiApcMiniInput;
  let akaiApcMiniOutput;
  let akaiApcMiniRunning;

  let teenageEngineeringOp1Input;

  function render() {
    inputTbody.innerHTML = '';
    for (const key of midiAccess.inputs.keys()) {
      const input = midiAccess.inputs.get(key);
      input.addEventListener('statechange', () => render());
      input.addEventListener('midimessage', event => handleMidiMessage(input, event.data));

      const inputTr = renderPortTr(input);
      inputTbody.append(inputTr);

      if (input.manufacturer === 'AKAI  Professional M.I. Corp.' && input.name === 'APC MINI') {
        akaiApcMiniInput = input;
      }
    }

    outputTbody.innerHTML = '';
    for (const key of midiAccess.outputs.keys()) {
      const output = midiAccess.outputs.get(key);
      output.addEventListener('statechange', () => render());

      const outputTr = renderPortTr(output);
      outputTbody.append(outputTr);

      if (output.manufacturer === 'AKAI  Professional M.I. Corp.' && output.name === 'APC MINI') {
        akaiApcMiniOutput = output;
      }
    }

    if (akaiApcMiniInput) {
      akaiApcMiniDiv.textContent = 'Akai APC Mini is connected.';
    }
    else {
      akaiApcMiniDiv.textContent = 'Akai APC Mini is not connected.';
    }

    if (akaiApcMiniInput && akaiApcMiniOutput && !akaiApcMiniRunning) {
      // akaiApcMiniOutput.send([0x90, 64, 2]);
      // akaiApcMiniOutput.send([0x90, 65, 2]);
      // akaiApcMiniOutput.send([0x90, 66, 2]);
      // akaiApcMiniOutput.send([0x90, 67, 2]);
      // akaiApcMiniOutput.send([0x90, 68, 2]);
      // akaiApcMiniOutput.send([0x90, 69, 2]);
      // akaiApcMiniOutput.send([0x90, 70, 2]);
      // akaiApcMiniOutput.send([0x90, 71, 2]);
      test();
      akaiApcMiniRunning = true;
    }

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

    // Recognize Akai APC Mini messages
    if (akaiApcMiniInput && array.length === 3) {
      // TODO
      switch (array[0]) {

      }
    }
  }

  let scroll = 0;
  function test() {
    scroll++;

    const context = akaiApcMiniCanvas.getContext('2d', { alpha: false });
    context.fillStyle = 'red';
    context.fillRect(0, 0, 8, 8);
    context.fillStyle = 'green';
    const text = (akaiApcMiniTextInput.value || '(no text)').split('').join(' ');
    const width = context.measureText(text).width;
    context.fillText(text, -(scroll % width), 7);
    context.fillText(text, -(scroll % width), 7);
    context.fillText(text, -(scroll % width), 7);

    const imageData = context.getImageData(0, 0, 8, 8);

    for (let index = 0; index < 64; index++) {
      // Flip index in the launchpad (left to right, bottom to top) to normal
      const realIndex = (7 - ~~(index / 8)) * 8 + (index % 8);
      const r = imageData.data[realIndex * 4 + 0];
      const g = imageData.data[realIndex * 4 + 1];
      const b = imageData.data[realIndex * 4 + 2];

      const color = r > 200 ? 3 : 1;

      akaiApcMiniOutput.send([0x90, index, color]);
    }

    window.setTimeout(test, 100);
  }

  render();
});
