# WebMIDI

## To-Do

### Handle device discovery and (re-)connection better

Have each device class have a static method which receives the combined inputs
and outputs array and determines which of these ports it recognizes and then
track these as its dependencies and if any of them go missing, destroy the
device class instance and recreate it the next time they all show up.

### Make the Akai APCmini device make its own UI and mount it in the discovery

In general have the devices build their own UIs and return a wrapper element
which is set to the device `div` if the device is recognized or the text about
the device not being recognized is set to the div instead.

### Implement an OP-1 device and another for the keyboard

### Consider implementing the input and output lists as devices, too

It would unmount and remount as the devices go in and out like any other device.
