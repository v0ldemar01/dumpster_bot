'use strict';
const {
  set_address_number_department,
  set_correct,
} = require('../../util/state/invoice');
const { template_delivery_info } = require('./template_delivery_info');
const { get_invoice_id } = require('../../util/state/state');

exports.np_message = async (ctx, is_local) => {
  try {
    await ctx.reply(`${ctx.i18n.t('to_order.write_send_to')}`);
  } catch (err) {
    console.log('np_message_local', err);
  }
};

exports.np_location = async (ctx, is_local, other) => {
  try {
    const user_id =
      ctx.update.message?.from?.id || ctx.update.callback_query?.from?.id;
    const { text } = ctx.update.message;
    const { invoice_id } = await get_invoice_id(user_id);
    await set_address_number_department(invoice_id, text);
    if (other) return;
    return await template_delivery_info(ctx, user_id, null, null, is_local);
  } catch (err) {
    console.log('np_location_local', err);
  }
};
