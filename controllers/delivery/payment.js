"use strict";
const Markup = require("telegraf/markup");

exports.payment_inline = (ctx, selected_number_button) => {
  try {
    let first, second, third_fourth;
    if (ctx.session['city']) {
      first = selected_number_button.includes(1);
      ctx.session['first'] = first;
      second = selected_number_button.includes(2);
      ctx.session['second'] = second;
    } else {
      third_fourth =
        selected_number_button.includes(1) ||
        selected_number_button.includes(2);
      ctx.session['first_second'] = selected_number_button.includes(1);
      ctx.session['second_second'] = selected_number_button.includes(2);
    }
    return [
      first
        ? [
            Markup.callbackButton(
              `${ctx.i18n.t('to_order.cash')}`, 
              'cash'
            ),
            Markup.callbackButton(
              `${ctx.i18n.t('to_order.terminal')}`,
              'terminal'
            ),
          ]
        : second
        ? [
            Markup.callbackButton(
              `${ctx.i18n.t('to_order.terminal')}`,
              'terminal'
            ),
          ]
        : [],
      third_fourth
        ? [
            Markup.callbackButton(
              `${ctx.i18n.t('to_order.cash_on_delivery')}`,
              'cash_on_delivery'
            ),
          ]
        : [],
      [
        Markup.callbackButton(
          `${ctx.i18n.t('to_order.to_bank_card')}`,
          'to_bank_card'
        ),
      ],
    ];
  } catch (err) {
    console.log('payment_inline', err);
  }
};
