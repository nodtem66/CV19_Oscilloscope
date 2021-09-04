var ui = {
    // Channel 1 UI
    inputType: {
        title: "Source",
        value: 2,
        values: [["Off", 0], ["Audio (5 V peak amplitude)",1], ["Sine Wave (amplitude 5 V)",2], ["Square Wave (amplitude 5 V)",3]]
    },
    freeze: {
        title: "Freeze Live Input",
        value: false,
    },
    freq: {
        title: "Input Wave Frequency",
        value: 250,
        range:[1,1000],
        resolution:1,
        units: "Hz"
    },
    gain: {
        title: "Oscilloscope gain",
        value: 1,
        range:[0,5],
        resolution:0.1,
    },
    vertOffset: {
        title: "Vertical Offset",
        value: 0,
        range:[-1000,1000],
        resolution: 1,
        input: "hidden"
    },
    // Channel 2 UI
    inputType2: {
        title: "Source",
        value: 0,
        parent: "#ui-container3",
        values: [["Off", 0], ["Audio (5 V peak amplitude)",1], ["Sine Wave (amplitude 5 V)",2], ["Square Wave (amplitude 5 V)",3]]
    },
    freeze2: {
        title: "Freeze Live Input",
        parent: "#ui-container3",
        value: false,
    },
    freq2: {
        title: "Input Wave Frequency",
        value: 250,
        range:[1,1000],
        resolution:1,
        parent: "#ui-container3",
        units: "Hz"
    },
    gain2: {
        title: "Oscilloscope gain",
        value: 1,
        range:[0,5],
        resolution:0.1,
        parent: "#ui-container3"
    },
    vertOffset2: {
        title: "Vertical Offset",
        value: 0,
        range:[-1000,1000],
        resolution: 1,
        parent: '#ui-container3',
        input: "hidden"
    },
    // Horizontal Grid UI
    timeScale: {
        title: "Seconds / div",
        value: 1,
        parent: '#ui-container2',
        values: [["50 µs", 0.05],["100 µs", 0.1],["200 µs", 0.2],["500 µs", 0.5],["1 ms", 1], ["2 ms", 2],["5 ms", 5], ["10ms", 10], ["50ms", 50], ["100ms", 100], ["500ms", 500], ["1s", 1000]]
    },
    volts: {
        title: "Volts / div",
        value: 1,
        parent: '#ui-container2',
        values: [["5mV", 0.001],["10mV", 0.002],["25mV", 0.005], ["50mv", 0.01], ["100mV", 0.02], ["250mV", 0.05], ["500mV", 0.1], ["1V", 0.2],["2V", 0.4],["5V", 1],["10V", 2]]
    },
    horizOffset: {
        title: "Horizontal Offset",
        value: 0,
        range:[-1000,1000],
        resolution: 1,
        color: "#999",
        parent: '#ui-container2',
        input: "hidden"
    }
};

var ui_data = [];
const generator_interface = [
    'timeScale', 'horizOffset',
    'inputType', 'inputType2',
    'freq', 'freq2',
    'gain', 'gain2',
    'vertOffset', 'vertOffset2'
];

const AuxLines = { cross_1: 0, cross_2: 1, marker1_1: 2, marker1_2: 3, marker2_1: 4, marker2_2: 5, length: 6 }; 

/*
 *    Canvas and WebGL initialization
 */
// 1. Create canvas element
parent = document.getElementById('canvas');
var canvas = document.createElement("canvas"); // for gridlines
var devicePixelRatio = window.devicePixelRatio || 1;
canvas.width = parent.clientWidth * devicePixelRatio;
canvas.height = parent.clientHeight * devicePixelRatio;
parent.appendChild(canvas);

// 2. Helper function to convert pixel to WebGL coordinates (-1, 1)
var mapRange = function(from, to, s) {
    return to[0] + (s - from[0]) * (to[1] - to[0]) / (from[1] - from[0]);
};

mapRange.ToWebGL = {
    x: function(s) {return mapRange([0, canvas.width], [-1, 1], s);},
    y: function(s) {return mapRange([0, canvas.height], [-1, 1], s);}
};

// 3. WebGL Colors
var colors = {
    white: new WebglPlotBundle.ColorRGBA(1, 1, 1, 1),
    grey80: new WebglPlotBundle.ColorRGBA(0.8, 0.8, 0.8, 1),
    grey60: new WebglPlotBundle.ColorRGBA(0.6, 0.6, 0.6, 1),
    grey40: new WebglPlotBundle.ColorRGBA(0.4, 0.4, 0.4, 1),
    grey30: new WebglPlotBundle.ColorRGBA(0.3, 0.3, 0.3, 1),
    grey20: new WebglPlotBundle.ColorRGBA(0.2, 0.2, 0.2, 1),
    grey10: new WebglPlotBundle.ColorRGBA(0.1, 0.1, 0.1, 1),
    bg: new WebglPlotBundle.ColorRGBA(33/255, 37/255, 41/255, 1),
    black: new WebglPlotBundle.ColorRGBA(0, 0, 0, 1),
    blue: new WebglPlotBundle.ColorRGBA(0, 0.85, 1, 1),
    teal: new WebglPlotBundle.ColorRGBA(32/255, 201/255, 151/255, 1),
    pink: new WebglPlotBundle.ColorRGBA(214/255, 51/255, 132/255, 1),
    random: function() {
        var r=0,g=0,b=0;
        while(r+g+b < 1.2) {
            r = Math.random();
            g = Math.random();
            b = Math.random();
        }
        return new WebglPlotBundle.ColorRGBA(r, g, b, 1)
    },
    fromHex: function(h) {
        var r = 0, g = 0, b = 0;
        // 3 digits
        if (h.length == 4) {
            r = "0x" + h[1] + h[1];
            g = "0x" + h[2] + h[2];
            b = "0x" + h[3] + h[3];
        // 6 digits
        } else if (h.length == 7) {
            r = "0x" + h[1] + h[2];
            g = "0x" + h[3] + h[4];
            b = "0x" + h[5] + h[6];
        }
        return new WebglPlotBundle.ColorRGBA((+r)/255, (+g)/255, (+b)/255, 1);
    }
};

// 4. Global variables
const wglp = new WebglPlotBundle.WebglPlot(canvas);
const midPoint = {x: canvas.width/2, y: canvas.height/2};

// 5. Add line helper
function addLine(coords, color=colors.grey30) {
    var line = new WebglPlotBundle.WebglLine(color, 2);
    line.xy = new Float32Array(coords);
    line.intensity = 10;
    wglp.addAuxLine(line);
}

addLine.fromCanvas = function (from, to, color) {
    return addLine([
        mapRange.ToWebGL.x(from[0]),
        mapRange.ToWebGL.y(from[1]),
        mapRange.ToWebGL.x(to[0]),
        mapRange.ToWebGL.y(to[1])
    ], color);
}

// 6. Grid creation
function createGrid(){

    gridLineX = midPoint.x - 100;
    while (gridLineX >= 0){
      addLine.fromCanvas([gridLineX, 0], [gridLineX, canvas.height]);
      gridLineX -= 100;
    }
    gridLineX = midPoint.x + 100;
    while (gridLineX <= canvas.width) {
        addLine.fromCanvas([gridLineX, 0], [gridLineX, canvas.height]);
        gridLineX += 100;
    }
    gridLineY = midPoint.y - 100;
    while (gridLineY >= 0) {
        addLine.fromCanvas([0, gridLineY], [canvas.width, gridLineY]);
        gridLineY -= 100;
    }
    gridLineY = midPoint.y + 100;
    while (gridLineY <= canvas.height) {
        addLine.fromCanvas([0, gridLineY], [canvas.width, gridLineY]);
        gridLineY += 100;
    }
    
    dashesX = midPoint.x - 20;
    while (dashesX >= 0) {
        addLine.fromCanvas([dashesX, midPoint.y - 5], [dashesX, midPoint.y + 5]);
        dashesX -= 20;
    }
    while (dashesX <= canvas.width) {
        addLine.fromCanvas([dashesX, midPoint.y - 5], [dashesX, midPoint.y + 5]);
        dashesX += 20;
    }
    
    dashesY = midPoint.y - 20;
    while (dashesY >= 0) {
        addLine.fromCanvas([midPoint.x - 5, dashesY], [midPoint.x + 5, dashesY]);
        dashesY -= 20;
    }
    dashesY = midPoint.y + 20;
    while (dashesY <= canvas.height) {
        addLine.fromCanvas([midPoint.x - 5, dashesY], [midPoint.x + 5, dashesY]);
        dashesY += 20;
    }

    addLine([0, 1, 0, -1], colors.grey60);
    addLine([-1, 0., 1, 0], colors.grey60);
}


// Create Auxlines 
for (var i=0; i<AuxLines.length; i++) {
    wglp.addAuxLine(new WebglPlotBundle.WebglLine(colors.white, 2));
}
createGrid();


// 7. Begin Audio section ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var AudioContext = (window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.oAudioContext || window.msAudioContext);

if (AudioContext){
  var audioContext = new AudioContext({latencyHint: 'interactive', sampleRate: 8000});
  var gainNode = audioContext.createGain();
  var analyser = audioContext.createAnalyser();
  gainNode.gain.value = 3;
  analyser.smoothingTimeConstant = .9;
  try {
    analyser.fftSize = 4096;
  } catch(e) {
    analyser.fftSize = 2048;
  }
  gainNode.connect(analyser);
  // frequencyBinCount is readonly and set to fftSize/2;
  // Set Buffer to fftSize
  // https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/getByteTimeDomainData
  var timeDomain = new Uint8Array(analyser.fftSize);
  var sampleRate = audioContext.sampleRate;
  var numSamples = timeDomain.length;
  $('#sampling_rate').text(sampleRate+' Hz (60 fps)');
} else {
  var analyser = {};
  analyser.frequencyBinCount = 512;
}

// unit seconds
var fullSampledTime = function() {
    return Math.ceil(canvas.width/100)*parseFloat(ui.timeScale.value)/1000;
}

// unit samples
var fullSamples = function() {
    return fullSampledTime()*sampleRate;
}

var animateId;
var generator_refresh = false;
var streaming = [false, false];
streaming.All = function() {
    return streaming.every(function (b) {return b;});
};

streaming.None = function() {
    return streaming.every(function (b) {return !b;});
};

streaming.Some = function() {
    return streaming.some(function (b) {return b;});
};

streaming.Active = function(channel) {
    if (channel >= streaming.length) return false;
    return (streaming[channel] == true && ui['freeze' + (channel>0?channel+1:'')].value == false);
};

streaming.SomeActive = function() {
    for (var i=0; i<streaming.length; i++) {
        if (streaming.Active(i)) return true;
    }
    return false;
}

function gotStream(stream) {
    // Create an AudioNode from the stream.
    window.mediaStreamSource = audioContext.createMediaStreamSource( stream );

    //for testing
    var osc = audioContext.createOscillator();
    osc.frequency.value = 200;
    osc.start(0);

    // switch these lines
    window.mediaStreamSource.connect(gainNode);
    // osc.connect(gainNode);

    streaming[0] = true;
    $('#inputType-interface select').val(1).change();
    animate();
}

function addUiData(data=[]) {
    [].push.apply(ui_data, data);
    var full_samples = fullSamples();
    if (ui_data.length > full_samples) {
        ui_data.splice(0, ui_data.length-full_samples);
    } else {
        var zeros = new Array(full_samples - ui_data.length).fill(0);
        ui_data = [].concat(zeros, ui_data);
    }
}

function nextPower2(x) {
    return Math.pow(2, Math.ceil(Math.log2(x)));
}

var draw_time = Date.now();
var sampled_time = 0;
function animate(){
    var now = Date.now();
    // Fixed to 60 frames per seconds (1/60 = 16.667ms)
    if (now - draw_time >= 16.667) {
        if (streaming.SomeActive()){
            var new_samples = sampled_time > 0 ? (Date.now() - sampled_time) * sampleRate / 1000.0 : numSamples;
            analyser.getByteTimeDomainData(timeDomain);
            sampled_time = Date.now();
            if (new_samples < numSamples) {
                ui_data = timeDomain.slice(-new_samples);
            } else {
                // Nothing. Let's the missing old data go and focus the present. 
            }
        }
        drawData();
        draw_time = Date.now();
    }
    if (streaming.SomeActive()) {
        window.requestAnimationFrame(animate);
    }
}


function update(el) {
    var start_animation = false;
    var end_animation = false;
    if (el == 'inputType' && ui.inputType.value == 1) {
        streaming[0] = true;
        start_animation = true;
    } else if (el == 'inputType' && ui.inputType.value != 1) {
        streaming[0] = false;
        end_animation = true;
    } else if (el == 'inputType2' && ui.inputType2.value == 1) {
        streaming[1] = true;
        start_animation = true;
    } else if (el == 'inputType2' && ui.inputType2.value != 1) {
        streaming[1] = false;
        end_animation = true;
    } else if (el == 'freeze') {
        if (ui.freeze.value === true) {
            line.freeze = {
                gain: ui.gain.value,
                v_offset: ui.vertOffset.value,
                h_offset: ui.horizOffset.value
            };
        } else {
            delete line.freeze;
        }
    } else if (el == 'freeze2') {
        if (ui.freeze2.value === true) {
            line2.freeze = {
                gain: ui.gain2.value,
                v_offset: ui.vertOffset2.value,
                h_offset: ui.horizOffset.value
            };
        } else {
            delete line2.freeze;
        }
    }

    if (el == 'inputType') {
        switch (parseInt(ui.inputType.value)) {
            case 0:
                line.visible = false;
                streaming[0] = false;
                $('#freq-interface, #freeze-interface, #gain-interface, #vertOffset-interface').hide();
                break;
            case 1:
                line.visible = true;
                streaming[0] = true;
                $('#freq-interface').hide();
                $('#freeze-interface, #gain-interface, #vertOffset-interface').show();
                break;
            default:
                line.visible = true;
                streaming[0] = false;
                $('#freq-interface, #gain-interface, #vertOffset-interface').show();
                $('#freeze-interface').hide();
                break;
        }
    }

    if (el == 'inputType2') {
        switch (parseInt(ui.inputType2.value)) {
            case 0:
                line2.visible = false;
                streaming[1] = false;
                $('#freq2-interface, #freeze2-interface, #gain2-interface, #vertOffset2-interface').hide();
                break;
            case 1:
                line2.visible = true;
                streaming[1] = true;
                $('#freq2-interface').hide();
                $('#freeze2-interface, #gain2-interface, #vertOffset2-interface').show();
                break;
            default:
                line2.visible = true;
                streaming[1] = false;
                $('#freq2-interface, #gain2-interface, #vertOffset2-interface').show();
                $('#freeze2-interface').hide();
                break;
        }
    }

    var generator_enable = (ui.inputType.value > 1) || (ui.inputType2.value > 1);
    if (generator_enable &&  generator_interface.includes(el)) {
        generator_refresh = true;
    }

    if (start_animation) {
        animate();
        if (!animateId)
            animateId = window.requestAnimationFrame(animate);
    } else if (end_animation) {
        if(animateId && streaming.None()) window.cancelAnimationFrame(animateId);
        drawData();
    } else if (streaming.SomeActive()) {
        animate();
    } else {
        drawData();
    }
}

const freeze_interface = [
    {
        gain: 'gain',
        v_offset: 'vertOffset',
        h_offset: 'horizOffset'
    },
    {
        gain: 'gain',
        v_offset: 'vertOffset',
        h_offset: 'horizOffset'
    }
];
function IsFreezeUpdated(channel) {
    if (!wglp) return false;
    if (channel >= wglp.linesData.length) return false;
    var _line = wglp.linesData[channel];
    if (!_line.freeze) return false;
    console.assert(channel < freeze_interface.length);

    for (var key in _line.freeze) {
        if (key in freeze_interface[channel]) {
            const ui_key = freeze_interface[channel][key];
            if (ui[ui_key].value !== _line.freeze[key])
                return true;
        }
    }
    return false;
}

const inputType_key = ['inputType', 'inputType2'];
function updateFreeze(channel) {
    if (!wglp) return;
    if (channel >= wglp.linesData.length) return;
    var _line = wglp.linesData[channel];
    if (!_line.freeze) return;
    console.assert(channel < inputType_key.length);
    if (ui[inputType_key[channel]].value != 1) return;
    if (!IsFreezeUpdated(channel)) return;

    // Update value from ui
    var new_freeze = {};
    for (var key in _line.freeze) {
        new_freeze[key] = _line.freeze[key];
        if (key in freeze_interface[channel]) {
            const ui_key = freeze_interface[channel][key];
            new_freeze[key] = ui[ui_key].value;
        }
    }
    // Replace new points in both X and Y
    for (var i=0; i<_line.numPoints; i++) {
        var y = mapRange([-1, 1], [0, canvas.height], _line.getY(i));
        y += new_freeze.v_offset - _line.freeze.v_offset;
        y *= new_freeze.gain / _line.freeze.gain;
        y = mapRange.ToWebGL.y(y);
        var x = mapRange([-1, 1], [0, canvas.width], _line.getX(i));
        x += new_freeze.h_offset - _line.freeze.h_offset;
        x = mapRange.ToWebGL.x(x);
        _line.setX(i, x);
        _line.setY(i, y);
    }
    _line.freeze = new_freeze;
}

function printStats(data) {
    var mean = data.reduce(function(a,x){return a+x;}) / data.length;
    var variance = data.reduce(function(a,x){return a+Math.pow(x-mean, 2)}) / data.length; 
    console.log(
        "min: " + data.reduce(function(a,x){return Math.min(a,x);}, data[0]),
        "max: " + data.reduce(function(a,x){return Math.max(a,x);}, data[0]),
        "mean: " + mean,
        "sd: " + Math.sqrt(variance)
    );
}

function drawData(){
    // full_samples is the number of samples to fill full width
    // line.numPoints is the number of pixels filled for full width
    // ui_data is a new data from timeDomain
    var full_samples = fullSamples();
    if (streaming.Some()){
        if (ui_data.length > full_samples) {
            ui_data = ui_data.slice(-full_samples);
        }
        var adjust_size = ui_data.length * line.numPoints / full_samples;
        if (full_samples < line.numPoints) {
            ui_data = upsampling(ui_data, adjust_size);
        }
        if (ui.inputType.value == 1 && streaming.Active(0)) {
            var ys = [];
            for (var i=0; i < ui_data.length; i++) {
                var y = ui.gain.value * ((ui_data[i] / 255) - 0.5)*200/(ui.volts.value);
                y += canvas.height/2;
                ys.push(mapRange.ToWebGL.y(y + ui.vertOffset.value));
            }
            line.shiftAdd(ys);
        }
        if (ui.inputType2.value == 1 && streaming.Active(1)) {
            var ys = [];
            for (var i=0; i < ui_data.length; i++) {
                var y = ui.gain2.value * ((ui_data[i] / 255) - 0.5)*200/(ui.volts.value);
                y += canvas.height/2;
                ys.push(mapRange.ToWebGL.y(y + ui.vertOffset2.value));
            }
            line2.shiftAdd(ys);
        }
    }
    if (generator_refresh) {
        for (var i = 0; i < line.numPoints; i++) {
            var xc = i * (canvas.width/line.numPoints);
            //Hardcoding 6 is wrong! Gives incorrect values on small screens
            // var amplitude = c.height/6 / ui.volts.value;
            var amplitude = 100 / ui.volts.value; //100 pixels per division

            // shift graph to middle of oscilloscpe
            xc = Math.round(xc + canvas.width/2);
            if (ui.inputType.value > 1) {
                var y = -amplitude * Math.sin(2*Math.PI*(xc + ui.horizOffset.value)*ui.freq.value*0.00001*ui.timeScale.value);
                // square wave modification
                if (ui.inputType.value == 3){
                    if (y > 0) y = amplitude;
                    else y = -amplitude;
                }
                // apply gain and center vertically
                y = ui.gain.value*y + canvas.height/2;
                line.setY(i, mapRange.ToWebGL.y(y + ui.vertOffset.value));
            }
            if (ui.inputType2.value > 1) {
                var y = -amplitude * Math.sin(2*Math.PI*(xc + ui.horizOffset.value)*ui.freq2.value*0.00001*ui.timeScale.value);;
                // square wave modification
                if (ui.inputType2.value == 3){
                    if (y > 0) y = amplitude;
                    else y = -amplitude;
                }
                // apply gain and center vertically
                y = ui.gain2.value*y + canvas.height/2;
                line2.setY(i, mapRange.ToWebGL.y(y + ui.vertOffset2.value));
            }
        }
        generator_refresh = false;
    }
    updateFreeze(0);
    wglp.update();
}

// 8. Events
$(document).on("uiLoaded", function(){
    if (navigator.mediaDevices){
        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
          .then(function(stream) {
            /* use the stream */
            gotStream(stream);
            $("#alert1").removeClass("show");
          })
          .catch(function(err) {
            /* handle the error */
            console.log(err);
          });
    } else {
        animate();
        $("#alert1").addClass("show");
    };

    // The default inputType for channel 2 is Off then hide the generator interface 
    $('#freq2-interface, #freeze2-interface, #gain2-interface, #vertOffset2-interface').hide();
});

// Measurement UI and handlers
var is_measurement = false;
var measurement_data = [];

function webglGetXY(e) {
    const bounding = canvas.getBoundingClientRect();
    const x = (1 / wglp.gScaleX) *
        ((2 * ((e.pageX - bounding.left) * devicePixelRatio - canvas.width / 2)) / canvas.width -
            wglp.gOffsetX);
    const y = (1 / wglp.gScaleY) *
        ((2 * (canvas.height / 2 - (e.pageY - bounding.top) * devicePixelRatio)) / canvas.height -
            wglp.gOffsetY);
    return {x: x,y: y};
}
function webglCross(x,y) {
    const dx = mapRange.ToWebGL.x(10)+1;
    const dy = mapRange.ToWebGL.y(10)+1;
    return [[x-dx, y+dy, x+dx, y-dy], [x-dx, y-dy, x+dx, y+dy]];
}

function formatUnit(number, unit='', fixed=3, prefix_unit='') {
    var cnt = 0;
    const units = ['', 'm', 'μ', 'n', 'p', 'f', 'a', 'z', 'y'];
    const zero = '0.' + '0'.repeat(fixed);
    while(parseFloat(number).toFixed(fixed) === zero && cnt < units.length) {
        number *= 1000.0;
        cnt++;
    }
    if (cnt == units.length) {
        number /= 1000.0;
        cnt--;
    }
    return parseFloat(number).toFixed(fixed) + prefix_unit + units[cnt] + unit;
}

function measurementHandler() {
    if (is_measurement) {
        $("#measurementButton").text('Measurement');
        is_measurement = false;
        for (var i=0; i<AuxLines.length; i++) {
            wglp.linesAux[i].visible = false;
            wglp.linesAux[i].xy = new Float32Array(4);
        }
    } else {
        is_measurement = true;
        measurement_data = [];
        for (var i=0; i<AuxLines.length; i++) {
            wglp.linesAux[i].visible = true;
            wglp.linesAux[i].color = colors.white;
        }
        $("#measurementButton").text('Cancel');
    }
    wglp.update();
}

$("#measurementButton").click(measurementHandler);
$(document).keyup(function(e) {
    switch (e.key) {
        case 'm':
        case 'M':
            measurementHandler();
            break;
        case 'Escape':
            if (is_measurement) {
                measurementHandler();
            }
            break;
    }
});
canvas.addEventListener("click", function (e) {
    if (!is_measurement) return;
    const xy = webglGetXY(e);
    measurement_data.push(xy);
    if (measurement_data.length >= 2) {
        const d = measurement_data.slice(-2);
        var dx = d[1].x - d[0].x;
        var dy = d[1].y - d[0].y;
        // 100 px = 5V * ui.volts.value
        dy = mapRange([0,2], [0,canvas.height], dy)*ui.volts.value*5/100;
        // 100 px = 1ms * ui.timeScale.value
        dx = mapRange([0,2], [0,canvas.width], dx)*ui.timeScale.value/1000/100;
        $('#measurementDeltaV').text(formatUnit(dy, 'V'));
        $('#measurementDeltaT').text(formatUnit(dx, 's'));
        $('#measurementFreq').text(formatUnit(1/dx, 'Hz'));
        $('#toast1').addClass('show');
        // update markers        
        var marker = webglCross(d[0].x, d[0].y);
        const old_color = wglp.linesAux[AuxLines.marker2_1].color;
        const new_color = colors.random();
        wglp.linesAux[AuxLines.marker1_1].xy = new Float32Array(marker[0]);
        wglp.linesAux[AuxLines.marker1_2].xy = new Float32Array(marker[1]);
        wglp.linesAux[AuxLines.marker1_1].color = old_color;
        wglp.linesAux[AuxLines.marker1_2].color = old_color;
        marker = webglCross(d[1].x, d[1].y);
        wglp.linesAux[AuxLines.marker2_1].xy = new Float32Array(marker[0]);
        wglp.linesAux[AuxLines.marker2_2].xy = new Float32Array(marker[1]);
        wglp.linesAux[AuxLines.cross_1].color = new_color;
        wglp.linesAux[AuxLines.cross_2].color = new_color;
        wglp.linesAux[AuxLines.marker2_1].color = new_color;
        wglp.linesAux[AuxLines.marker2_2].color = new_color;
    } else {
        // only one marker
        const cross = webglCross(xy.x, xy.y);
        wglp.linesAux[AuxLines.marker1_1].xy = new Float32Array(cross[0]);
        wglp.linesAux[AuxLines.marker1_2].xy = new Float32Array(cross[1]);
    }
    wglp.update();
});

canvas.addEventListener("mousemove", function (e) {
    if (!is_measurement) return;
    const xy = webglGetXY(e);
    const cross = webglCross(xy.x, xy.y);
    wglp.linesAux[AuxLines.cross_1].xy = new Float32Array(cross[0]);
    wglp.linesAux[AuxLines.cross_2].xy = new Float32Array(cross[1]);
    wglp.update();
});

// 9. Main program
// line = channel 1
// line2 = channel 2
var line_color = colors.teal;
var line2_color = colors.pink;
var full_samples = fullSamples();
full_samples = full_samples > 8000 ? full_samples : 8000; 
const line = new WebglPlotBundle.WebglLine(line_color, full_samples);
line.arrangeX();
wglp.addLine(line);
const line2 = new WebglPlotBundle.WebglLine(line2_color, full_samples);
line2.arrangeX();
line2.visible = false;
wglp.addLine(line2);

wglp.update();

animate();