import Inputs from './devices/Inputs.js';
import Outputs from './devices/Outputs.js';
import AkaiApcMini from './devices/AkaiApcMini.js';
import NovationLaunchpadMini from './devices/NovationLaunchpadMini.js';

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

  const deviceTypes = [Inputs, Outputs, AkaiApcMini, NovationLaunchpadMini];
  const devices = [];
  for (const deviceType of deviceTypes) {
    const key = `web-midi-${deviceType.name}`;

    const deviceDetails = document.createElement('details');
    deviceDetails.open = localStorage.getItem(key) !== 'false';
    const deviceSummary = document.createElement('summary');
    const deviceH2 = document.createElement('h2');
    deviceH2.textContent = deviceType.name;
    deviceSummary.append(deviceH2);
    deviceDetails.append(deviceSummary);
    window.document.body.append(deviceDetails);

    deviceDetails.addEventListener('toggle', () => localStorage.setItem(key, deviceDetails.open.toString()));

    const device = new deviceType(deviceDetails);
    device.render(ports);
    devices.push(device);
  }

  midiAccess.addEventListener('statechange', () => {
    const ports = [...Array.from(midiAccess.inputs.values()), ...Array.from(midiAccess.outputs.values())];
    for (const device of devices) {
      device.render(ports);
    }
  });
});
