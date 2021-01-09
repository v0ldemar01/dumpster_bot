'use strict';

exports.url_message = (message, isStart, array) => {
  try {
    let message_text = message?.split('https://')[0].split('\n');
    message_text = isStart ? message_text : message_text?.filter((e) => e);
    const url_txt = '\n' + message_text?.pop();
    const url = 'https://' + message?.split('https://')[1];
    return !array
      ? (message_text.length ? message_text.join('\n') : '') +
          `<a 
        href="${url}">${url_txt}        
      </a>`
      : [url_txt, url];
  } catch (err) {
    console.log('url_message', err);
  }
};
