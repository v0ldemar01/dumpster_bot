'use strict';
const { select_all_goods_in_cart } = require('../../util/state/goods');
const { url_message } = require('../start/url_message');

exports.message_text = async ctx => {
  try {
    const user_id =
      ctx.update?.message?.chat?.id ||
      ctx.update.callback_query?.message?.chat?.id ||
      ctx.update.callback_query?.from?.id;
    const ordering = ctx.i18n.t('goods_cart.ordering');
    const parse_ordering = ordering.split("\n").filter((element) => element);

    let message = `${parse_ordering.shift()}\n`;
    const goods_in_card = await select_all_goods_in_cart(user_id);

    if (!goods_in_card || !goods_in_card.length) return false;
    let sum_price = 0;
    goods_in_card.forEach(({ name, price, count }, index) => {
      message += `\n${index + 1}) ${name}  \n${ctx.i18n.t(
        'goods_cart.count'
      )}: ${count}, ${ctx.i18n.t('general.price')}: <b>${
        price * count
      }</b> ${ctx.i18n.t('general.UAH')}`;
      sum_price += price * count;
    });

    message += `\n\n${parse_ordering
      .shift()
      .replace("...", `${sum_price} `)}\n`;

    const other_message = url_message(parse_ordering.join('\n'));
    message += other_message;

    return message;
  } catch (err) {
    console.log('message_text', err);
  }
};
