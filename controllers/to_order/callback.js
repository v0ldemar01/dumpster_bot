'use strict';
const { initial_state_invoice } = require('../../util/state/init');
const { set_invoice_id } = require('../../util/state/state');
const {
  set_sum,
  set_invoice_goods_id,
  set_current_invoice_date,
} = require('../../util/state/invoice');
const { select_all_goods_in_cart } = require('../../util/state/goods');

exports.to_order = async (ctx) => {
  try {
    const text_array = ctx.update.callback_query?.message?.text
      ?.split('\n')
      .filter((element) => element);
    const sum_template_text = ctx.i18n
      .t('goods_cart.ordering')
      .split('\n')
      .filter((element) => element)[1]
      ?.split(':')[0];
    const sum_number = text_array
      .filter((element_text) => element_text.includes(sum_template_text))[0]
      ?.split(':')[1]
      ?.split(' ')[1];

    const user_id = ctx.update.callback_query?.from?.id;
    const invoice_id = await initial_state_invoice(user_id);

    await set_invoice_id(user_id, invoice_id);
    await set_sum(invoice_id, sum_number);
    await set_current_invoice_date(invoice_id);

    const res = await select_all_goods_in_cart(user_id);
    if (!res || !res.length)
      return ctx.reply(ctx.i18n.t('to_order.cart_empty'));
    const goods_ids = res.map(
      ({ ms_goods_id, count }) => `${ms_goods_id}$${count}`
    );
    await set_invoice_goods_id(invoice_id, goods_ids.join(', '));

    return ctx.scene.enter('to_order');
  } catch (err) {
    console.log('to_order', err);
  }
};
