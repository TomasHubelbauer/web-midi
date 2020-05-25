export default class Marquee {
  space = 1; // Space between the chars in the sprite
  chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789☺:-()., ';
  sizes = '44443344144355445443455554434444444451222121'.split('').map(Number);

  constructor() {
    this.img = document.createElement('img');
    this.img.src = 'sprite.png';
    const canvas = document.createElement('canvas');
    canvas.width = 8;
    canvas.height = 8;
    this.context = canvas.getContext('2d');
    this.context.imageSmoothingEnabled = false;

    canvas.style.zoom = 10;
    window.document.body.append(canvas);
  }

  render(/** @type {{ char: string; color: number; }} */ chars, scroll = 0) {
    this.context.clearRect(0, 0, 8, 8);

    let offset = 0;
    for (const { char, color } of chars) {
      if (!this.chars.includes(char)) {
        continue;
      }

      const index = this.chars.indexOf(char);
      const shift = this.sizes.slice(0, index).reduce((a, c) => a + c + this.space, 0);
      const size = this.sizes[index];

      // Draw the black glyph from the sprite
      this.context.drawImage(this.img, shift, 0, size, 8, -scroll + offset, 0, size, 8);

      // Color the black glyph the current color
      this.imageData = this.context.getImageData(0, 0, 8, 8);
      for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
          const index = y * 8 * 4 + x * 4;
          const rgba = this.imageData.data.slice(index, index + 4);
          if (rgba.toString() === '0,0,0,255') {
            this.imageData.data.set(color, index);
          }
        }
      }

      this.context.putImageData(this.imageData, 0, 0);

      offset += size + this.space;
    }
  }

  pixel(index) {
    return this.imageData.data.slice(index, index + 4);
  }
}
