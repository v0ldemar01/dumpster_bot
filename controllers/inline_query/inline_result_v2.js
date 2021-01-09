'use strict';

exports.inline_result_v2 = async (results) => {
  try {
    if (!results) return console.log('!results');
    if (!results.length) return console.log('!result_v2.length');

    return results.map((result, i) => ({
      type: 'article',
      id: i,
      title: 'Населений пункт',
      description: `${result.name}, ${result.characteristic} `,
      input_message_content: {
        message_text: `${result.name}, ${result.characteristic} `,
      },
    }));
  } catch (err) {
    console.log('inline_result_v2', err);
  }
};
