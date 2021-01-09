'use strict';
const Markup = require('telegraf/markup');
const { mailing_feedback } = require('../../util/state/mailing');
const { set_mailing_goods_ref } = require('../../util/state/state');

const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));

const ref_to_goods = async (button_name, button_ref, users) => {
  try {
    for (const user_id of users) {
      await set_mailing_goods_ref(user_id, button_ref);
    }
    return Markup.inlineKeyboard([
      [Markup.callbackButton(button_name.trim(), 'mailing_goods_ref')],
    ]).extra();
  } catch (err) {
    console.log('ref_to_goods', err);
  }
};

exports.mailing = async (ctx, users, message, mailing_id) => {
  try {
    let count = 0;
    let markup =
      message.button && message.button_ref
        ? await ref_to_goods(message.button, message.button_ref, users)
        : null;
    const img = message.href;
    const img_format = img ? `\n\n<a href="${img.trim()}">&#160;</a>` : '';
    let text = message.text;
    if (!text) return;
    img_format ? (text += img_format) : null;
    const full_markup = markup
      ? Object.assign({}, { parse_mode: 'HTML' }, markup)
      : Object.assign({}, { parse_mode: 'HTML' });
    for (const user_id of users) {
      await ctx.telegram.sendCopy(user_id, { text }, full_markup);
      if (count % 20 == 0) await sleep(1000);
      count++;
    }
    await mailing_feedback(mailing_id, count);
  } catch (err) {
    console.log('mailing', err);
  }
};
