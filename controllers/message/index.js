'use strict';
const {
  set_locality,
  get_info_is_recipient,
} = require('../../util/state/invoice');
const {
  update_city,
  save_inline_message_id,
} = require('../../util/state/state');
const { get_invoice_id } = require('../../util/state/state');
const { clear_space } = require('../clear');

const filter = ['м. ', 'c. '];

exports.message = async ctx => {
  try {
    const user_id = ctx.update.message?.from?.id;
    const message = ctx.update.message?.text;
    if (message && filter.some(filter_element => message.includes(filter_element))) {
      const { invoice_id } = await get_invoice_id(user_id);
      await set_locality(invoice_id, message);
      const { is_recipient } = await get_info_is_recipient(invoice_id);
      if (is_recipient) await update_city(invoice_id, message);
      return;
    }
    const inline_message = ctx.update.message?.via_bot?.is_bot;
    if (inline_message) {
      const message_id = ctx.update.message?.message_id;
      await save_inline_message_id(user_id, message_id);
      await clear_space(ctx, message_id);
    }
  } catch (err) {
    console.log('message', err);
  }
};
