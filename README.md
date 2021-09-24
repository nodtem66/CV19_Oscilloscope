# CV19 Oscilloscope
Virtual oscilloscope that uses WebAudio, WebSerial, and WebGL to display the signal from the audio input or serial COM port.
Inspired by [Academo](https://academo.org/demos/virtual-oscilloscope/).

## Functionality
- Audio input from microphone jack
- Serial input (e.g. data from Arduino)
- Simulate Sine wave / Square wave
- Sampling rate at 48000Hz (60 fps)
- Time scale is up to 1s
- Measurement mode for examining voltage, time, and frequency.

## Arduino and WebSerial
It's possible to use Arduino and Webserial to probe the low-frequency signal. The 100Hz square wave was generated from TimerOne library and used to find the exact sampling rate for this virtual scope by adjusting the value until the measured frequency is correct.

[PWM_100Hz.ino](./examples/PWM_100Hz.ino) contains the source code for used with this method.

- Upload this source code to the target microcontroller.
- Open virtual oscilloscope, and set the sampling rate to 750.
- Connect D9 to A0.
- The 100Hz square wave will be shown in the virtual scope.  

## Screenshot

![Screenshot1](./img/screenshot_1.jpg?raw=true)

![Screenshot2](./img/screenshot_2.jpg?raw=true)
