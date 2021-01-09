'use strict';
const Markup = require('telegraf/markup');
const { toggle_goods_in_cart } = require('../../util/state/goods');
const { get_cart_message_id } = require('../../util/state/state');
const { select_all_goods_in_cart } = require('../../util/state/goods');
const { sum_message } = require('../edit_cart/reply_message');
const { clear_space } = require('../clear');

exports.edit_cart_inline = async (ctx, user_id) => {
  try {
    const ms_goods_id = ctx.update?.callback_query?.data
      ? ctx.update?.callback_query?.data?.split('_')[1]
      : null;
    if (!ms_goods_id) return console.log('!ms_goods_id');

    const chat_id = ctx.update.callback_query?.message?.chat?.id;
    const { message_id } = ctx.update.callback_query.message;
    await toggle_goods_in_cart(user_id, ms_goods_id, 0, true);

    const { sum_message_id } = await get_cart_message_id(user_id, true);
    const goods_in_card = await select_all_goods_in_cart(user_id);
    let all_sum = goods_in_card.reduce((acc, { price, count }) => {
      return acc + price * count;
    }, 0);
    all_sum = 100;
    const new_message = sum_message(ctx, all_sum);
    await ctx.telegram.editMessageText(
      chat_id,
      sum_message_id,
      null,
      new_message,
      Markup.inlineKeyboard([
        [
          Markup.callbackButton(
            ctx.i18n.t('goods_cart.save_changes_cart'),
            'save_changes'
          ),
        ],
        [
          Markup.callbackButton(
            ctx.i18n.t('goods_card.continue_search'),
            'self_search_to'
          ),
        ],
      ]).extra()
    );
    await ctx.telegram.deleteMessage(chat_id, message_id);
    if (!goods_in_card.length) {
      await clear_space(ctx, null, 2, 1);
      await ctx.telegram.sendMessage(
        user_id,
        ctx.i18n.t('to_order.cart_empty'),
        Markup.inlineKeyboard([
          [
            Markup.callbackButton(
              ctx.i18n.t('greeting.select_category'),
              'self_search'
            ),
          ],
          [
            Markup.callbackButton(
              ctx.i18n.t('greeting.enter_search'),
              'search'
            ),
          ],
        ]).extra()
      );
    }
  } catch (err) {
    console.log('edit_cart_inline', err);
  }
};
