export default class AkaiApcMini {
  make(tagName, attributes) {
    const element = document.createElementNS('http://www.w3.org/2000/svg', tagName);
    for (const attribute in attributes) {
      element.setAttribute(attribute, attributes[attribute]);
    }

    return element;
  }

  constructor(element) {
    const svg = this.make('svg', { width: '23.5cm', height: '19.9cm' });
    svg.append(this.make('rect', { x: '2mm', y: '2mm', width: '23.1cm', height: '19.5cm', rx: '6mm', stroke: 'black', 'stroke-width': '2mm', fill: '#333' }));


    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const rect = this.make('rect', { x: `${6 + 25 * x}mm`, y: `${19.5 + 13.75 * y}mm`, width: '21mm', height: '1cm', rx: '.5mm', stroke: 'black', 'stroke-width': '.5mm', fill: '#777' });
        svg.append(rect);
        this[`button${(7 - y) * this.width + x}`] = rect;
      }
    }

    for (let y = 0; y < 8; y++) {
      svg.append(this.make('rect', { x: '21.2cm', y: `${19.5 + 13.75 * y}mm`, width: '1cm', height: '1cm', rx: '5mm', stroke: 'black', 'stroke-width': '.5mm', fill: '#777' }));
    }

    for (let x = 0; x < 8; x++) {
      svg.append(this.make('rect', { x: `${12.5 + 25 * x}mm`, y: '13cm', width: '1cm', height: '1cm', rx: '5mm', stroke: 'black', 'stroke-width': '.5mm', fill: '#777' }));
    }

    svg.append(this.make('rect', { x: `${12.5 + 25 * 8}mm`, y: `${19.5 + 13.75 * 8}mm`, width: '1cm', height: '1cm', rx: '5mm', stroke: 'black', 'stroke-width': '.5mm', fill: '#777' }));

    for (let x = 0; x < 9; x++) {
      svg.append(this.make('rect', { x: `${6 + 25 * x}mm`, y: '14.5cm', width: '2.1cm', height: '4.8cm', rx: '1mm', stroke: 'black', 'stroke-width': '1mm', fill: '#333' }));
      svg.append(this.make('rect', { x: `${6 + 25 * x + 9}mm`, y: '15.1cm', width: '3mm', height: '37mm', rx: '.1mm' }));

      const rectA = this.make('rect', { x: `${6 + 25 * x + 3}mm`, y: '14.8cm', width: '1.5cm', height: '1.5cm', rx: '1mm', stroke: 'black', 'stroke-width': '.5mm', fill: '#222' });
      svg.append(rectA);
      this[`fader${48 + x}-a`] = rectA;

      const rectB = this.make('rect', { x: `${6 + 25 * x + 3}mm`, y: '15.3cm', width: '1.5cm', height: '.5cm', rx: '1mm' });
      svg.append(rectB);
      this[`fader${48 + x}-b`] = rectB;

      const rectC = this.make('rect', { x: `${6 + 25 * x + 3}mm`, y: '15.51cm', width: '1.5cm', height: '1mm', rx: '.5mm', fill: '#ddd' });
      svg.append(rectC);
      this[`fader${48 + x}-c`] = rectC;
    }

    element.append(svg);
  }

  fade(fader, ratio) {
    const number = 48 + fader;
    this[`fader${number}-a`].setAttribute('y', `${14.8 + ratio * 2.7}cm`);
    this[`fader${number}-b`].setAttribute('y', `${15.3 + ratio * 2.7}cm`);
    this[`fader${number}-c`].setAttribute('y', `${15.51 + ratio * 2.7}cm`);
  }

  color(button, color) {
    this[`button${button}`].setAttribute('fill', color);
  }
}
