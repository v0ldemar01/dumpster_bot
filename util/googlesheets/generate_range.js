'use strict';
const { makeRangeIterator } = require('./iterator');

exports.generate_range = (char_range, number_range) => {
  try {
    const char_range_elements = char_range
      .split(':')
      .map((element) => element.charCodeAt(0));
    const firstChar = char_range_elements[0];
    const count = char_range_elements[1] - char_range_elements[0] + 1;
    const alphabet = [...Array(count)]
      .map((_, i) => String.fromCharCode(firstChar + i))
      .join('');
    const it = makeRangeIterator(...number_range);
    return {
      alphabet,
      it,
    };
  } catch (err) {
    console.log('generate_range', err);
  }
};
