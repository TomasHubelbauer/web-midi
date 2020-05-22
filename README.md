# [Web MIDI](https://tomashubelbauer.github.io/web-midi)

In this repository I am experimenting with the JavaScript Web MIDI API to talk
to various MIDI devices.

## Running

`npx serve .` because CORS does not work with `file://`.

## Akai APCmini Launchpad

I've implemented two hacks both having to do with the launchpad grid button
lights. If you have this launchpad, you can connect it to your laptop and view
this site in a Web MIDI supporting browser (Chrome, Edge).

### Text Marquee

[![](https://i3.ytimg.com/vi/ZD0jvqGuul0/maxresdefault.jpg)](https://www.youtube.com/watch?v=ZD0jvqGuul0)

### Fader Levels

Turn off the marquee animation first using the stop button.

[![](https://i3.ytimg.com/vi/XP5PGQ_B-Jg/maxresdefault.jpg)](https://www.youtube.com/watch?v=XP5PGQ_B-Jg)

### Audio Visualizer

Turn off the marquee animation first using the stop button and then click the
document body to initiate playback.

[![](https://i3.ytimg.com/vi/feNGAObR10Y/maxresdefault.jpg)](https://www.youtube.com/watch?v=feNGAObR10Y)

## To-Do

### Implement an OP-1 device and another for the keyboard

### Figure out how to query the initial values of the faders

I captured the Ableton communication in my `akai-apc-mini` repository so maybe
there will be a hint in that.

### Model the launchpad in 3D and use my SVG 3D projector to render it

This will look cooler, prop it up so that it is slightly tilted back and to the
right.

The SVG 3D projector repo of mine is called `svg-3d`.

### Implement Snake or Etch-a-sketch or something silly like that

### Implement a spectrum visualizer using the grid and Web Audio API
