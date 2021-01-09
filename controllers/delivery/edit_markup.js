'use strict';
const { general_toogle } = require('../callback_query/toggle');
const {
  is_recipient,
  set_type_delivery,
  set_type_payment,
  set_confirm,
} = require('../../util/state/invoice');
const { get_invoice_id } = require('../../util/state/state');

exports.edit_markup = async (ctx, check) => {
  try {
    let isChange;
    let in_keyboard = ctx.update.callback_query?.message?.reply_markup;
    if (!in_keyboard) return ctx.scene.leave();
    let { inline_keyboard } = in_keyboard;
    const callback = ctx.update.callback_query?.data;
    const user_id =
      ctx.update.callback_query?.message?.chat.id ||
      ctx.update.callback_query?.from.id;
    const { invoice_id } = await get_invoice_id(user_id);
    if (callback == 'me') {
      await is_recipient(invoice_id, true);
    } else if (callback == 'other') {
      await is_recipient(invoice_id, false);
    } else if (callback.includes('lviv') || callback.includes('nova_poshta')) {
      await set_type_delivery(invoice_id, callback);
    } else if (
      callback.includes('cash') ||
      callback.includes('terminal') ||
      callback.includes('card')
    ) {
      await set_type_payment(invoice_id, callback);
    } else if (callback.includes('confirm')) {
      await set_confirm(invoice_id, callback.includes('yes') ? true : false);
    }
    const selected_number_button = [];
    inline_keyboard = Array.isArray(inline_keyboard)
      ? inline_keyboard.map((inline_keyboard_element, index) => {
          if (inline_keyboard_element[0].callback_data == callback) {
            general_toogle(inline_keyboard_element[0], check ? null : '✔️');
            isChange = true;
            selected_number_button.push(index + 1);
          }
          return inline_keyboard_element;
        })
      : [];
    if (isChange)
      await ctx.editMessageReplyMarkup({
        inline_keyboard,
      });
    return selected_number_button;
  } catch (err) {
    console.log('edit_markup', err);
  }
};
