'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }

  return arr2;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}

var __isA = {
  "PointValueExtractor<unknown>": value => typeof value === "function",
  "XYDataPoint": value => value !== undefined && value !== null && __isA["X"](value["x"]) && typeof value["y"] === "number",
  "X": value => typeof value === "number" || value instanceof Date
};
function calculateTriangleArea(pointA, pointB, pointC) {
  return Math.abs((pointA[0] - pointC[0]) * (pointB[1] - pointA[1]) - (pointA[0] - pointB[0]) * (pointC[1] - pointA[1])) / 2;
}
function calculateAverageDataPoint() {
  for (var _len = arguments.length, points = new Array(_len), _key = 0; _key < _len; _key++) {
    points[_key] = arguments[_key];
  }

  var length = points.length;
  if (!length) return undefined;
  var averageX = 0;
  var averageY = 0;

  for (var i = 0; i < length; i++) {
    averageX += points[i][0];
    averageY += points[i][1];
  }

  return [averageX / length, averageY / length];
}
function splitIntoBuckets(data, desiredLength) {
  if (data.length === 2) {
    return [[data[0]], [data[1]]];
  }

  var first = data[0];
  var center = data.slice(1, data.length - 1);
  var last = data[data.length - 1]; // First and last bucket are formed by the first and the last data points
  // so we only have N - 2 buckets left to fill

  var bucketSize = center.length / (desiredLength - 2);
  var splitData = [[first]];

  for (var i = 0; i < desiredLength - 2; i++) {
    var bucketStartIndex = Math.floor(i * bucketSize);
    var bucketEndIndex = Math.floor((i + 1) * bucketSize);
    var dataPointsInBucket = center.slice(bucketStartIndex, bucketEndIndex);
    splitData.push(dataPointsInBucket);
  }

  splitData.push([last]);
  return splitData;
}
var calculateMean = values => {
  var m = 0;

  for (var i = 0; i < values.length; i += 1) {
    m += values[i];
  }

  return m / values.length;
};
var calculateSTD = values => {
  var mean = calculateMean(values);
  var std = 0;

  for (var i = 0; i < values.length; i += 1) {
    std += (values[i] - mean) * (values[i] - mean);
  }

  return Math.sqrt(std / values.length);
};
var mapToArray = (input, callback) => {
  var length = input.length;
  var result = new Array(length);

  for (var i = 0; i < length; i++) {
    result[i] = callback(input[i], i);
  }

  return result;
};
var getPointValueExtractor = accessor => {
  if (__isA["PointValueExtractor<unknown>"](accessor)) return accessor;
  return point => point[accessor];
};
var createNormalize = (x, y) => {
  var getX = getPointValueExtractor(x);
  var getY = getPointValueExtractor(y);
  return data => mapToArray(data, (point, index) => [getX(point, index), getY(point, index)]);
};
var createXYDataPoint = (time, value) => ({
  x: time,
  y: value
});
var createLegacyDataPointConfig = () => ({
  x: point => {
    var t = __isA["XYDataPoint"](point) ? point.x : point[0];
    return t instanceof Date ? t.getTime() : t;
  },
  y: point => 'y' in point ? point.y : point[1],
  toPoint: createXYDataPoint
});
var iterableBasedOn = (input, length) => new input.constructor(length);

var SMANumeric = function SMANumeric(data, windowSize) {
  var slide = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
  var output = [];
  var sum = 0;

  for (var i = 0; i < windowSize; i++) {
    sum += data[i];
  }

  for (var _i = windowSize; _i <= data.length; _i++) {
    if ((_i - windowSize) % slide === 0) {
      output.push(sum / windowSize);
    }

    sum += data[_i] - data[_i - windowSize];
  }

  return output;
};
/**
 * Simple Moving Average (SMA)
 *
 * @param data {Number[]}
 * @param windowSize {Number}
 * @param slide {Number}
 */

var createSMA = config => {
  var timeExtractor = getPointValueExtractor(config.x);
  var valueExtractor = getPointValueExtractor(config.y);
  var pointFactory = config.toPoint;
  return function (values, windowSize) {
    var slide = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
    if (values.length === 0) return values;
    var data = mapToArray(values, valueExtractor);
    var times = mapToArray(values, timeExtractor);
    var output = iterableBasedOn(values, 0);
    var sum = 0;
    var value;

    for (var i = 0; i < windowSize; i++) {
      sum += data[i];
    }

    for (var _i2 = windowSize; _i2 <= data.length; _i2++) {
      if ((_i2 - windowSize) % slide === 0) {
        value = pointFactory((times[_i2 - windowSize] + times[_i2 - 1]) / 2, sum / windowSize, _i2 - windowSize);
        output[output.length] = value;
      }

      sum += data[_i2] - data[_i2 - windowSize];
    }

    return output;
  };
};
var SMA = createSMA(createLegacyDataPointConfig());

/*
 * Free FFT and convolution (JavaScript)
 *
 * Copyright (c) 2014 Project Nayuki
 * https://www.nayuki.io/page/free-small-fft-in-multiple-languages
 *
 * (MIT License)
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 * - The above copyright notice and this permission notice shall be included in
 *   all copies or substantial portions of the Software.
 * - The Software is provided "as is", without warranty of any kind, express or
 *   implied, including but not limited to the warranties of merchantability,
 *   fitness for a particular purpose and noninfringement. In no event shall the
 *   authors or copyright holders be liable for any claim, damages or other
 *   liability, whether in an action of contract, tort or otherwise, arising from,
 *   out of or in connection with the Software or the use or other dealings in the
 *   Software.
 */

/*
 * Computes the discrete Fourier transform (DFT) of the given complex vector, storing the result back into the vector.
 * The vector can have any length. This is a wrapper function.
 */

function fft(real, imag) {
  if (real.length != imag.length) throw 'Mismatched lengths';
  var n = real.length;
  if (n == 0) return;else if ((n & n - 1) == 0) // Is power of 2
    transformRadix2(real, imag); // More complicated algorithm for arbitrary sizes
  else transformBluestein(real, imag);
}
/*
 * Computes the inverse discrete Fourier transform (IDFT) of the given complex vector, storing the result back into the vector.
 * The vector can have any length. This is a wrapper function. This transform does not perform scaling, so the inverse is not a true inverse.
 */

function inverseFFT(real, imag) {
  fft(imag, real);
}
/*
 * Computes the discrete Fourier transform (DFT) of the given complex vector, storing the result back into the vector.
 * The vector's length must be a power of 2. Uses the Cooley-Tukey decimation-in-time radix-2 algorithm.
 */

function transformRadix2(real, imag) {
  // Initialization
  if (real.length != imag.length) throw 'Mismatched lengths';
  var n = real.length;
  if (n == 1) // Trivial transform
    return;
  var levels = -1;

  for (var i = 0; i < 32; i++) {
    if (1 << i == n) levels = i; // Equal to log2(n)
  }

  if (levels == -1) throw 'Length is not a power of 2';
  var cosTable = new Array(n / 2);
  var sinTable = new Array(n / 2);

  for (var _i = 0; _i < n / 2; _i++) {
    cosTable[_i] = Math.cos(2 * Math.PI * _i / n);
    sinTable[_i] = Math.sin(2 * Math.PI * _i / n);
  } // Bit-reversed addressing permutation


  for (var _i2 = 0; _i2 < n; _i2++) {
    var j = reverseBits(_i2, levels);

    if (j > _i2) {
      var temp = real[_i2];
      real[_i2] = real[j];
      real[j] = temp;
      temp = imag[_i2];
      imag[_i2] = imag[j];
      imag[j] = temp;
    }
  } // Cooley-Tukey decimation-in-time radix-2 FFT


  for (var size = 2; size <= n; size *= 2) {
    var halfsize = size / 2;
    var tablestep = n / size;

    for (var _i3 = 0; _i3 < n; _i3 += size) {
      for (var _j = _i3, k = 0; _j < _i3 + halfsize; _j++, k += tablestep) {
        var tpre = real[_j + halfsize] * cosTable[k] + imag[_j + halfsize] * sinTable[k];
        var tpim = -real[_j + halfsize] * sinTable[k] + imag[_j + halfsize] * cosTable[k];
        real[_j + halfsize] = real[_j] - tpre;
        imag[_j + halfsize] = imag[_j] - tpim;
        real[_j] += tpre;
        imag[_j] += tpim;
      }
    }
  }
} // Returns the integer whose value is the reverse of the lowest 'bits' bits of the integer 'x'.


function reverseBits(x, bits) {
  var y = 0;

  for (var i = 0; i < bits; i++) {
    y = y << 1 | x & 1;
    x >>>= 1;
  }

  return y;
}
/*
 * Computes the discrete Fourier transform (DFT) of the given complex vector, storing the result back into the vector.
 * The vector can have any length. This requires the convolution function, which in turn requires the radix-2 FFT function.
 * Uses Bluestein's chirp z-transform algorithm.
 */


function transformBluestein(real, imag) {
  // Find a power-of-2 convolution length m such that m >= n * 2 + 1
  if (real.length != imag.length) throw 'Mismatched lengths';
  var n = real.length;
  var m = 1;

  while (m < n * 2 + 1) {
    m *= 2;
  } // Trignometric tables


  var cosTable = new Array(n);
  var sinTable = new Array(n);

  for (var i = 0; i < n; i++) {
    var j = i * i % (n * 2); // This is more accurate than j = i * i

    cosTable[i] = Math.cos(Math.PI * j / n);
    sinTable[i] = Math.sin(Math.PI * j / n);
  } // Temporary vectors and preprocessing


  var areal = new Array(m);
  var aimag = new Array(m);

  for (var _i4 = 0; _i4 < n; _i4++) {
    areal[_i4] = real[_i4] * cosTable[_i4] + imag[_i4] * sinTable[_i4];
    aimag[_i4] = -real[_i4] * sinTable[_i4] + imag[_i4] * cosTable[_i4];
  }

  for (var _i5 = n; _i5 < m; _i5++) {
    areal[_i5] = aimag[_i5] = 0;
  }

  var breal = new Array(m);
  var bimag = new Array(m);
  breal[0] = cosTable[0];
  bimag[0] = sinTable[0];

  for (var _i6 = 1; _i6 < n; _i6++) {
    breal[_i6] = breal[m - _i6] = cosTable[_i6];
    bimag[_i6] = bimag[m - _i6] = sinTable[_i6];
  }

  for (var _i7 = n; _i7 <= m - n; _i7++) {
    breal[_i7] = bimag[_i7] = 0;
  } // Convolution


  var creal = new Array(m);
  var cimag = new Array(m);
  convolveComplex(areal, aimag, breal, bimag, creal, cimag); // Postprocessing

  for (var _i8 = 0; _i8 < n; _i8++) {
    real[_i8] = creal[_i8] * cosTable[_i8] + cimag[_i8] * sinTable[_i8];
    imag[_i8] = -creal[_i8] * sinTable[_i8] + cimag[_i8] * cosTable[_i8];
  }
}
/*
 * Computes the circular convolution of the given complex vectors. Each vector's length must be the same.
 */


function convolveComplex(xreal, ximag, yreal, yimag, outreal, outimag) {
  if (xreal.length != ximag.length || xreal.length != yreal.length || yreal.length != yimag.length || xreal.length != outreal.length || outreal.length != outimag.length) throw 'Mismatched lengths';
  var n = xreal.length;
  xreal = xreal.slice();
  ximag = ximag.slice();
  yreal = yreal.slice();
  yimag = yimag.slice();
  fft(xreal, ximag);
  fft(yreal, yimag);

  for (var i = 0; i < n; i++) {
    var temp = xreal[i] * yreal[i] - ximag[i] * yimag[i];
    ximag[i] = ximag[i] * yreal[i] + xreal[i] * yimag[i];
    xreal[i] = temp;
  }

  inverseFFT(xreal, ximag);

  for (var _i9 = 0; _i9 < n; _i9++) {
    // Scaling (because this FFT implementation omits it)
    outreal[_i9] = xreal[_i9] / n;
    outimag[_i9] = ximag[_i9] / n;
  }
}

var calculateDiffs = values => {
  var length = values.length - 1;
  if (length < 1) return [];
  var diffs = new Array(length);

  for (var i = 0; i < length; i++) {
    diffs[i] = values[i + 1] - values[i];
  }

  return diffs;
};

var calculateRoughness = values => calculateSTD(calculateDiffs(values));

var calculateKurtosis = values => {
  var length = values.length;
  var mean = calculateMean(values);
  var u4 = 0;
  var variance = 0;
  var diff;
  var diffSqr;

  for (var i = 0; i < length; i++) {
    diff = values[i] - mean;
    diffSqr = diff * diff;
    u4 += diffSqr * diffSqr;
    variance += diffSqr;
  }

  return length * u4 / (variance * variance);
};

var findWindowSize = (head, tail, data, minRoughness, originalKurt, windowSize) => {
  while (head <= tail) {
    var w = Math.round((head + tail) / 2);
    var smoothed = SMANumeric(data, w, 1);
    var kurtosis = calculateKurtosis(smoothed);

    if (kurtosis >= originalKurt) {
      /* Search second half if feasible */
      var roughness = calculateRoughness(smoothed);

      if (roughness < minRoughness) {
        windowSize = w;
        minRoughness = roughness;
      }

      head = w + 1;
    } else {
      /* Search first half */
      tail = w - 1;
    }
  }

  return windowSize;
};

var calculatePeaks = function calculatePeaks(correlations) {
  var threshold = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.2;
  var length = correlations.length;
  if (length <= 1) return [[], 0];
  var maxCorrelation = 0;
  var peaks = [];

  if (correlations.length > 1) {
    var positive = correlations[1] > correlations[0];
    var max = 1;

    for (var i = 2; i < correlations.length; i += 1) {
      if (!positive && correlations[i] > correlations[i - 1]) {
        max = i;
        positive = !positive;
      } else if (positive && correlations[i] > correlations[max]) {
        max = i;
      } else if (positive && correlations[i] < correlations[i - 1]) {
        if (max > 1 && correlations[max] > threshold) {
          peaks.push(max);

          if (correlations[max] > maxCorrelation) {
            maxCorrelation = correlations[max];
          }
        }

        positive = !positive;
      }
    }
  }
  /* If there is no autocorrelation peak within the MAX_WINDOW boundary try windows from the largest to the smallest */


  if (peaks.length <= 1) {
    for (var _i = 2; _i < length; _i += 1) {
      peaks.push(_i);
    }
  }

  return [peaks, maxCorrelation];
};

var calculateAutocorrelation = (values, maxLag) => {
  var length = values.length;
  var mean = calculateMean(values);
  /* Padding to the closest power of 2 */

  var len = Math.pow(2, Math.trunc(Math.log2(length)) + 1);
  var fftreal = new Array(len).fill(0);
  var fftimg = new Array(len).fill(0);

  for (var i = 0; i < length; i += 1) {
    fftreal[i] = values[i] - mean;
  }
  /* F_R(f) = FFT(X) */


  fft(fftreal, fftimg);
  /* S(f) = F_R(f)F_R*(f) */

  for (var _i2 = 0; _i2 < fftreal.length; _i2 += 1) {
    fftreal[_i2] = Math.pow(fftreal[_i2], 2) + Math.pow(fftimg[_i2], 2);
    fftimg[_i2] = 0;
  }
  /*  R(t) = IFFT(S(f)) */


  inverseFFT(fftreal, fftimg); // Calculate correlations

  var correlations = [];

  for (var _i3 = 1; _i3 < maxLag; _i3++) {
    correlations[_i3] = fftreal[_i3] / fftreal[0];
  }

  var _calculatePeaks = calculatePeaks(correlations),
      _calculatePeaks2 = _slicedToArray(_calculatePeaks, 2),
      peaks = _calculatePeaks2[0],
      maxCorrelation = _calculatePeaks2[1];

  return {
    correlations,
    peaks,
    maxCorrelation
  };
};

var createASAP = config => {
  var valueExtractor = getPointValueExtractor(config.y);
  var SMA = createSMA(config);
  return function ASAP(values, resolution) {
    if (values.length === 0) return values;

    if (resolution <= 0) {
      throw new Error("Supplied non-positive resolution parameter to ASAP: ".concat(resolution));
    } // If the resolution is at least twice as big as the number of data points
    // then the values get downsampled to desired resolution first by SMA


    if (values.length >= 2 * resolution) {
      var scale = Math.trunc(values.length / resolution);
      return ASAP(SMA(values, scale, scale), resolution);
    } // First turn data points into a sequence of values


    var data = mapToArray(values, valueExtractor);

    var _calculateAutocorrela = calculateAutocorrelation(data, Math.round(data.length / 10)),
        correlations = _calculateAutocorrela.correlations,
        peaks = _calculateAutocorrela.peaks,
        maxCorrelation = _calculateAutocorrela.maxCorrelation;

    var originalKurtosis = calculateKurtosis(data);
    var minRoughness = calculateRoughness(data);
    var windowSize = 1;
    var lb = 1;
    var largestFeasible = -1;
    var tail = data.length / 10;

    for (var i = peaks.length - 1; i >= 0; i -= 1) {
      var w = peaks[i];

      if (w < lb || w === 1) {
        break;
      } else if (Math.sqrt(1 - correlations[w]) * windowSize > Math.sqrt(1 - correlations[windowSize]) * w) {
        continue;
      }

      var smoothed = SMANumeric(data, w, 1);
      var kurtosis = calculateKurtosis(smoothed);
      var roughness = calculateRoughness(smoothed);

      if (kurtosis >= originalKurtosis) {
        if (roughness < minRoughness) {
          minRoughness = roughness;
          windowSize = w;
        }

        lb = Math.round(Math.max(w * Math.sqrt((maxCorrelation - 1) / (correlations[w] - 1)), lb));

        if (largestFeasible < 0) {
          largestFeasible = i;
        }
      }
    }

    if (largestFeasible > 0) {
      if (largestFeasible < peaks.length - 2) {
        tail = peaks[largestFeasible + 1];
      }

      lb = Math.max(lb, peaks[largestFeasible] + 1);
    }

    windowSize = findWindowSize(lb, tail, data, minRoughness, originalKurtosis, windowSize);
    return SMA(values, windowSize, 1);
  };
};
var ASAP = createASAP(createLegacyDataPointConfig());

function LTTBIndexesForBuckets(buckets) {
  var bucketCount = buckets.length;
  var bucketDataPointIndexes = [0];
  var previousBucketsSize = 1;
  var lastSelectedDataPoint = buckets[0][0];

  for (var index = 1; index < bucketCount - 1; index++) {
    var bucket = buckets[index];
    var nextBucket = buckets[index + 1];
    var averageDataPointFromNextBucket = calculateAverageDataPoint(...nextBucket);
    if (averageDataPointFromNextBucket === undefined) continue;
    var maxArea = -1;
    var maxAreaIndex = -1;

    for (var j = 0; j < bucket.length; j++) {
      var dataPoint = bucket[j];
      var area = calculateTriangleArea(lastSelectedDataPoint, dataPoint, averageDataPointFromNextBucket);

      if (area > maxArea) {
        maxArea = area;
        maxAreaIndex = j;
      }
    }

    lastSelectedDataPoint = bucket[maxAreaIndex];
    bucketDataPointIndexes.push(previousBucketsSize + maxAreaIndex);
    previousBucketsSize += bucket.length;
  }

  bucketDataPointIndexes.push(previousBucketsSize);
  return bucketDataPointIndexes;
} // Largest triangle three buckets data downsampling algorithm implementation

var createLTTB = config => {
  var normalize = createNormalize(config.x, config.y);
  return (data, desiredLength) => {
    if (desiredLength < 0) {
      throw new Error("Supplied negative desiredLength parameter to LTTB: ".concat(desiredLength));
    }

    var length = data.length;
    if (length <= 1 || length <= desiredLength) return data;
    var normalizedData = normalize(data);
    var buckets = splitIntoBuckets(normalizedData, desiredLength);
    var bucketDataPointIndexes = LTTBIndexesForBuckets(buckets);
    var output = iterableBasedOn(data, bucketDataPointIndexes.length);

    for (var i = 0; i < bucketDataPointIndexes.length; i++) {
      output[i] = data[bucketDataPointIndexes[i]];
    }

    return output;
  };
};
var LTTB = createLTTB(createLegacyDataPointConfig());

var mergeBucketAt = (buckets, index) => {
  var bucketA = buckets[index];
  var bucketB = buckets[index + 1];

  if (!bucketA || !bucketB) {
    throw new Error("Bucket index out of range for merging: ".concat(index, " (allowed indexes are 0 - ").concat(buckets.length - 2));
  }

  var mergedBucket = [...bucketA, ...bucketB];
  var newBuckets = buckets.slice();
  newBuckets.splice(index, 2, mergedBucket);
  return newBuckets;
};
var splitBucketAt = (buckets, index) => {
  var bucket = buckets[index];

  if (!bucket) {
    throw new Error("Bucket index out of range for splitting: ".concat(index, " (allowed indexes are 0 - ").concat(buckets.length - 1));
  }

  var bucketSize = bucket.length;

  if (bucketSize < 2) {
    return buckets;
  }

  var bucketALength = Math.ceil(bucketSize / 2);
  var bucketA = bucket.slice(0, bucketALength);
  var bucketB = bucket.slice(bucketALength);
  var newBuckets = buckets.slice();
  newBuckets.splice(index, 1, bucketA, bucketB);
  return newBuckets;
};
var calculateLinearRegressionCoefficients = data => {
  var N = data.length;
  var averageX = 0;
  var averageY = 0;

  for (var i = 0; i < N; i++) {
    averageX += data[i][0];
    averageY += data[i][1];
  }

  averageX /= N;
  averageY /= N;
  var aNumerator = 0;
  var aDenominator = 0;

  for (var _i = 0; _i < N; _i++) {
    var _data$_i = _slicedToArray(data[_i], 2),
        x = _data$_i[0],
        y = _data$_i[1];

    aNumerator += (x - averageX) * (y - averageY);
    aDenominator += (x - averageX) * (x - averageX);
  }

  var a = aNumerator / aDenominator;
  var b = averageY - a * averageX;
  return [a, b];
};
var calculateSSEForBucket = dataPoints => {
  var _calculateLinearRegre = calculateLinearRegressionCoefficients(dataPoints),
      _calculateLinearRegre2 = _slicedToArray(_calculateLinearRegre, 2),
      a = _calculateLinearRegre2[0],
      b = _calculateLinearRegre2[1];

  var sumStandardErrorsSquared = 0;

  for (var i = 0; i < dataPoints.length; i++) {
    var dataPoint = dataPoints[i];
    var standardError = dataPoint[1] - (a * dataPoint[0] + b);
    sumStandardErrorsSquared += standardError * standardError;
  }

  return sumStandardErrorsSquared;
};
var calculateSSEForBuckets = buckets => {
  // We skip the first and last buckets since they only contain one data point
  var sse = [0];

  for (var i = 1; i < buckets.length - 1; i++) {
    var previousBucket = buckets[i - 1];
    var currentBucket = buckets[i];
    var nextBucket = buckets[i + 1];
    var bucketWithAdjacentPoints = [previousBucket[previousBucket.length - 1], ...currentBucket, nextBucket[0]];
    sse.push(calculateSSEForBucket(bucketWithAdjacentPoints));
  }

  sse.push(0);
  return sse;
};
var findLowestSSEAdjacentBucketsIndex = (sse, ignoreIndex) => {
  var minSSESum = Number.MAX_VALUE;
  var minSSEIndex = undefined;

  for (var i = 1; i < sse.length - 2; i++) {
    if (i === ignoreIndex || i + 1 === ignoreIndex) {
      continue;
    }

    if (sse[i] + sse[i + 1] < minSSESum) {
      minSSESum = sse[i] + sse[i + 1];
      minSSEIndex = i;
    }
  }

  return minSSEIndex;
};
var findHighestSSEBucketIndex = (buckets, sse) => {
  var maxSSE = 0;
  var maxSSEIndex = undefined;

  for (var i = 1; i < sse.length - 1; i++) {
    if (buckets[i].length > 1 && sse[i] > maxSSE) {
      maxSSE = sse[i];
      maxSSEIndex = i;
    }
  }

  return maxSSEIndex;
}; // Largest triangle three buckets data downsampling algorithm implementation

var createLTD = config => {
  var normalize = createNormalize(config.x, config.y);
  return (data, desiredLength) => {
    if (desiredLength < 0) {
      throw new Error("Supplied negative desiredLength parameter to LTD: ".concat(desiredLength));
    }

    var length = data.length;

    if (length <= 2 || length <= desiredLength) {
      return data;
    } // Now we are sure that:
    //
    // - length is [2, Infinity)
    // - threshold is (length, Inifnity)


    var normalizedData = normalize(data); // Require: data . The original data
    // Require: threshold . Number of data points to be returned
    // 1: Split the data into equal number of buckets as the threshold but have the first
    // bucket only containing the first data point and the last bucket containing only
    // the last data point . First and last buckets are then excluded in the bucket
    // resizing
    // 2: Calculate the SSE for the buckets accordingly . With one point in adjacent
    // buckets overlapping
    // 3: while halting condition is not met do . For example, using formula 4.2
    // 4: Find the bucket F with the highest SSE
    // 5: Find the pair of adjacent buckets A and B with the lowest SSE sum . The
    // pair should not contain F
    // 6: Split bucket F into roughly two equal buckets . If bucket F contains an odd
    // number of points then one bucket will contain one more point than the other
    // 7: Merge the buckets A and B
    // 8: Calculate the SSE of the newly split up and merged buckets
    // 9: end while.
    // 10: Use the Largest-Triangle-Three-Buckets algorithm on the resulting bucket configuration
    // to select one point per buckets

    var buckets = splitIntoBuckets(normalizedData, desiredLength);
    var numIterations = length * 10 / desiredLength;

    for (var iteration = 0; iteration < numIterations; iteration++) {
      // 2: Calculate the SSE for the buckets accordingly . With one point in adjacent
      // buckets overlapping
      var sseForBuckets = calculateSSEForBuckets(buckets); // 4: Find the bucket F with the highest SSE

      var highestSSEBucketIndex = findHighestSSEBucketIndex(buckets, sseForBuckets);

      if (highestSSEBucketIndex === undefined) {
        break;
      } // 5: Find the pair of adjacent buckets A and B with the lowest SSE sum . The
      // pair should not contain F


      var lowestSSEAdajacentBucketIndex = findLowestSSEAdjacentBucketsIndex(sseForBuckets, highestSSEBucketIndex);

      if (lowestSSEAdajacentBucketIndex === undefined) {
        break;
      } // 6: Split bucket F into roughly two equal buckets . If bucket F contains an odd
      // number of points then one bucket will contain one more point than the other


      buckets = splitBucketAt(buckets, highestSSEBucketIndex); // 7: Merge the buckets A and B
      // If the lowest SSE index was after the highest index in the original
      // unsplit array then we need to move it by one up since now the array has one more element
      // before this index

      buckets = mergeBucketAt(buckets, lowestSSEAdajacentBucketIndex > highestSSEBucketIndex ? lowestSSEAdajacentBucketIndex + 1 : lowestSSEAdajacentBucketIndex);
    }

    var dataPointIndexes = LTTBIndexesForBuckets(buckets);
    var outputLength = dataPointIndexes.length;
    var output = iterableBasedOn(data, outputLength);

    for (var i = 0; i < outputLength; i++) {
      output[i] = data[dataPointIndexes[i]];
    }

    return output;
  };
};
var LTD = createLTD(createLegacyDataPointConfig());

var createLTOB = config => {
  var normalize = createNormalize(config.x, config.y);
  return (data, desiredLength) => {
    if (desiredLength < 0) {
      throw new Error("Supplied negative desiredLength parameter to LTOB: ".concat(desiredLength));
    }

    var length = data.length;

    if (length <= 1 || length <= desiredLength) {
      return data;
    } // Now we are sure that:
    //
    // - length is [2, Infinity)
    // - threshold is (length, Inifnity)


    var bucketSize = length / desiredLength;
    var normalizedData = normalize(data);
    var outputLength = Math.max(2, desiredLength);
    var output = iterableBasedOn(data, outputLength);
    output[0] = data[0];
    output[outputLength - 1] = data[length - 1];

    for (var bucket = 1; bucket < desiredLength - 1; bucket++) {
      var startIndex = Math.floor(bucket * bucketSize);
      var endIndex = Math.min(length - 1, (bucket + 1) * bucketSize);
      var maxArea = -1;
      var maxAreaIndex = -1;

      for (var j = startIndex; j < endIndex; j++) {
        var previousDataPoint = normalizedData[j - 1];
        var dataPoint = normalizedData[j];
        var nextDataPoint = normalizedData[j + 1];
        var area = calculateTriangleArea(previousDataPoint, dataPoint, nextDataPoint);

        if (area > maxArea) {
          maxArea = area;
          maxAreaIndex = j;
        }
      } // sampledData.push(data[maxAreaIndex]);


      output[bucket] = data[maxAreaIndex];
    } // sampledData.push(data[length - 1]);
    // output[desiredLength - 1] = data[length - 1];


    return output;
  };
};
var LTOB = createLTOB(createLegacyDataPointConfig());

var index = {
  ASAP,
  LTD,
  LTOB,
  LTTB,
  SMA,
  createASAP,
  createLTD,
  createLTOB,
  createLTTB,
  createSMA
};

exports.ASAP = ASAP;
exports.LTD = LTD;
exports.LTOB = LTOB;
exports.LTTB = LTTB;
exports.SMA = SMA;
exports.createASAP = createASAP;
exports.createLTD = createLTD;
exports.createLTOB = createLTOB;
exports.createLTTB = createLTTB;
exports.createSMA = createSMA;
exports.default = index;
//# sourceMappingURL=index.js.map
