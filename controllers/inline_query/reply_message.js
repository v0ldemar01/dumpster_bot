'use strict';

exports.message_text = (
  result,
  i18n,
  exchange_rate,
  [status_new, status_used]
) => {
  try {
    const message = [
      `<b>${result.name}</b>`,
      `\n${i18n.t('goods_card.status')}: <b>${
        result.status === 'Used' ? status_used : status_new
      }</b>`,
      `\n${i18n.t('goods_card.description')}`,
      i18n.locale() == 'ua'
        ? result.product_description
        : result.product_description_ru,
      `\n<b>${i18n
        .t('general.cost')
        .replace('...', `${result.price}`)
        .replace('...', `${result.price * exchange_rate}`)}</b>`,
      `<a href="${result.img_src}">&#160;</a>`,
    ];
    return message.join('\n');
  } catch (err) {
    console.log('message_text', err);
  }
};
