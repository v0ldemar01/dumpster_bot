'use strict'
const { select_all_goods_in_cart } = require('../../util/state/goods');
const Markup = require('telegraf/markup');
const { set_cart_message_id } = require('../../util/state/state');

const sum_message_local = (ctx, sum_all) =>
  `${ctx.i18n.t('goods_сart.order_sum')}: ${sum_all} ${ctx.i18n.t(
    'general.UAH'
  )}`;

exports.sum_message = (ctx, sum_all) => sum_message_local(ctx, sum_all);

exports.message_text = async ctx => {
  try {
    const user_id = ctx.update.callback_query.from.id;
    const goods_in_card = await select_all_goods_in_cart(user_id);
    let sum_all = 0;

    for (let i = 0; i < goods_in_card.length; i++) {
      const { name, ms_goods_id, price, count } = goods_in_card[i];
      await ctx.reply(
        `${name}  \n${ctx.i18n.t('goods_cart.count')}: ${count}, ${ctx.i18n.t(
          'general.price'
        )}: ${price * count} ${ctx.i18n.t('general.UAH')}`,
        Markup.inlineKeyboard([
          [
            Markup.callbackButton(
              ctx.i18n.t('goods_сart.delete'),
              `delete_${ms_goods_id}`
            ),
          ],
        ]).extra()
      );
      sum_all += price * count;
    }
    const res = await ctx.reply(
      sum_message_local(ctx, sum_all),
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

    const message_id =
      ctx.update.callback_query?.message?.message_id ||
      ctx.update.message?.message_id;
    await set_cart_message_id(user_id, message_id);
    await set_cart_message_id(user_id, res?.message_id, true);
  } catch (err) {
    console.log('message_text', err);
  }
};
