#include <TimerOne.h>

// This example creates a PWM signal with 25 kHz carrier.
//
// Arduino's analogWrite() gives you PWM output, but no control over the
// carrier frequency.  The default frequency is low, typically 490 or
// 3920 Hz.  Sometimes you may need a faster carrier frequency.
//
// The specification for 4-wire PWM fans recommends a 25 kHz frequency
// and allows 21 to 28 kHz.  The default from analogWrite() might work
// with some fans, but to follow the specification we need 25 kHz.
//
// http://www.formfactors.org/developer/specs/REV1_2_Public.pdf
//
// Connect the PWM pin to the fan's control wire (usually blue).  The
// board's ground must be connected to the fan's ground, and the fan
// needs +12 volt power from the computer or a separate power supply.

const int pwmPin = 9;
const int adcPin = A0;

void setup(void)
{
  pinMode(adcPin, INPUT);
  pinMode(pwmPin, OUTPUT);
  Timer1.initialize(10000);  // 10,000 us = 100 Hz
  Timer1.pwm(pwmPin, 512); // 50% PWM
  Serial.begin(115200);
}

void loop(void)
{
  Serial.println(analogRead(adcPin));
  delay(1); // delay 1ms
}
