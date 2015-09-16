'use strict';

// W3C TimeRanges: http://www.w3.org/html/wg/drafts/html/master/semantics.html#timeranges
// Mozilla Implementation: http://mxr.mozilla.org/mozilla-aurora/source/dom/html/TimeRanges.cpp
// WebKit Implementation: https://github.com/WebKit/webkit/blob/d055853e59dd6cc4cfd835b143e79258bb13c552/Source/WebCore/platform/graphics/PlatformTimeRanges.cpp
// Blink Implementation: https://github.com/yoavweiss/Blink/blob/master/Source/core/html/TimeRanges.cpp
// TimeUpdate Frequency http://www.w3.org/html/wg/drafts/html/master/semantics.html#time-marches-on

// Ranges are stored in a two-dimensional array with these indexes
var START = 0;
var END = 1;

function TimeRanges(start, end){
  this.length = 0;
  this._ranges = [];

  if (start !== undefined) {
    this.add(start, end);
  }
}

TimeRanges.create = function(start, end) {
  return new TimeRanges(start, end);
};

TimeRanges.prototype.add = function(start, end, tolerance){
  var ranges = this._ranges;
  var length = ranges.length;
  var addIndex = 0;
  var range;
  var rangeStart;
  var rangeEnd;

  start = Math.max(0, start);

  // In HTML5 video timeupdates can fire as slow as 250ms apart
  // and may also be blocked by the thread
  // We don't want unintentional gaps between ranges
  // during continuous playback. Tolerance can be used for that.
  tolerance = tolerance || 0;

  // If we're close enough to zero, assume zero.
  if (start <= tolerance / 2) {
    start = 0;
  }

  if (end < start) {
    throw new Error('TimeRange end cannot be less than the start.');
  }

  // Loop backwards through the array because most new ranges
  // will be added at the end of the existing ranges
  for (var i = length - 1; i >= 0; i--) {
    range = ranges[i];
    rangeStart = range[0];
    rangeEnd = range[1];

    // <--[added]-[current]--|
    // If the added range ends before the current range
    // we can skip to the preceding range
    if (end < rangeStart - tolerance) {
      continue;
    }

    // <--[current]-[added]--|
    // The added range starts after the current range
    // so insert it here
    if (start > rangeEnd + tolerance) {
      addIndex = i+1;
      break;
    }

    // |---[added/current]---|
    // At this point the added range must overlap the current range.
    // We're going to use start/end to track the min start
    // and max end of all overlapping frames,
    // remove all existing frames that are overlapped
    // and create a new range with the new start/end values
    end = Math.max(end, rangeEnd);

    while (range && start <= range[END] + tolerance) {
      // Remove the current range
      ranges.splice(i, 1);

      // Take the earliest starting point
      start = Math.min(range[START], start);

      // Get the next range (the preceding one in the list)
      range = ranges[--i];
    }

    // Move the pointer forward one because the last checked
    // range didn't overlap or didn't exist
    // Then insert the new range here
    addIndex = ++i;
    break;
  }

  // Add the range to the set index (defaults to zero)
  ranges.splice(addIndex, 0, [start, end]);
  this._updateLength();
};

/**
 * Update the length property of the TimeRanges object
 * Once IE8 is dropped we can use Object.defineProperty instead.
 * @private
 */
TimeRanges.prototype._updateLength = function() {
  this.length = this._ranges.length;
};

TimeRanges.prototype.start = function(index){
  if (index === undefined) {
    throw new TypeError('Failed to execute "start" on "TimeRanges": 1 argument required, but only 0 present.');
  }

  if (!this._ranges[index]) {
    throw new Error('Index does not exist');
  }

  return this._ranges[index][0];
};

TimeRanges.prototype.end = function(index){
  if (index === undefined) {
    throw new TypeError('Failed to execute "start" on "TimeRanges": 1 argument required, but only 0 present.');
  }

  if (!this._ranges[index]) {
    throw new Error('Index does not exist');
  }

  return this._ranges[index][1];
};

// Original Loop
// if (start <= rangeStart) {
//   if (end < rangeStart) {
//     // <>[]
//     ranges.splice(i, 0, createRange(start, end));
//   } else {
//     // <[>]
//     range[START] = start;
//
//     if (end > rangeEnd) {
//       // <[]>
//       range[END] = end;
//
//       // We need to walk through the rest of the ranges
//       // and check for any additional overlap
//       while (ranges[i+1] && end >= ranges[i+1][START]) {
//         if (ranges[i+1][END] > end) {
//           range[END] = ranges[i+1][END];
//         }
//
//         // Remove this range because it's no longer needed
//         // `while` will then check the next item, now i+1
//         ranges.splice(i+1, 1);
//       }
//     }
//   }
//
// // start > rangeStart && start <= rangeEnd
// } else {
//   if (end > rangeEnd) {
//     // [<]>
//     range[END] = end;
//
//     // We need to walk through the rest of the ranges
//     // and check for any additional overlap
//     // (duplicated from above. need to optimize)
//     while (ranges[i+1] && end >= ranges[i+1][START]) {
//       if (ranges[i+1][END] > end) {
//         range[END] = ranges[i+1][END];
//       }
//
//       // Remove this range because it's no longer needed
//       // `while` will then check the next item, now i+1
//       ranges.splice(i+1, 1);
//     }
//   }
//   // [<>]
// }
//
// // If start is less than or equal to range end
// // we should have handled all cases
// this.length = this._ranges.length;
// return;
// }

module.exports = TimeRanges;
