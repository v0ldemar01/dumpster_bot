'use strict';

exports.makeRangeIterator = (start, end = Infinity, step = 1) => {
  let nextIndex = start;
  const rangeIterator = {
    next: () => {
      let result = { value: nextIndex, done: nextIndex <= end };
      nextIndex += step;       
      return result;      
    },
  };
  return rangeIterator;
};
