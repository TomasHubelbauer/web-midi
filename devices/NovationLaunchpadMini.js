export default class NovationLaunchpadMini {
  static name = 'Novation LaunchPad Mini';

  constructor(element) {

  }

  manufacturer = 'Focusrite-Novation';
  name = 'Launchpad Mini';

  render(ports) {
    const input = ports.find(p => p.type === 'input' && p.manufacturer === this.manufacturer && p.name === this.name);
    const output = ports.find(p => p.type === 'output' && p.manufacturer === this.manufacturer && p.name === this.name);

  }
}
