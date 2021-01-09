'use strict';
const WizardScene = require('telegraf/scenes/wizard');
const Markup = require('telegraf/markup');
const {
  get_type_delivery,
  get_type_payment,
} = require('../../util/state/invoice');
const { clear_user_cart } = require('../../util/state/goods');
const {
  generate_url_payment,
  check_payment,
} = require('../../util/monobank/monobank');
const { get_sum, get_invoice_ms_id } = require('../../util/state/invoice');
const { get_invoice_id, get_current_key } = require('../../util/state/state');
const {
  update_statistics_field,
  update_users_crater_info,
} = require('../../util/state/statistics');
const { mainKeyboard, keyboard_action } = require('../../util/keyboard');
const { create_order } = require('./function');

module.exports = new WizardScene(
  'payment', 
  async (ctx) => {
    try {
      ctx.session['np_ttn'] = false;
      const user_id =
        ctx.update?.message?.chat?.id ||
        ctx.update.callback_query?.message?.chat?.id ||
        ctx.update.callback_query?.from?.id;
      await update_users_crater_info(user_id, 'crater.payment');

      if (ctx.session['first_iteration']) {
        await create_order(ctx);
        delete ctx.session['first_iteration'];
        await clear_user_cart(user_id);
      }

      const callback = ctx.update.callback_query?.data;
      const { invoice_id } = await get_invoice_id(user_id);
      const { invoice_ms_id } = await get_invoice_ms_id(invoice_id);

      const direction = await keyboard_action(ctx);
      if (direction == 'check_menu') {
        await ctx.wizard.selectStep(ctx.wizard.cursor);
        return await ctx.wizard.step(ctx);
      } else if (direction) {
        const { current_key } = await get_current_key(user_id);
        const keyboard = mainKeyboard(ctx);
        await ctx.reply(
          `${ctx.i18n.t('main_menu.selected')} ${ctx.i18n.t(current_key)}`,
          keyboard
        );
        return await ctx.scene.enter(direction);
      }
      const { type_payment } = await get_type_payment(invoice_id);
      const { sum } = await get_sum(invoice_id);
      const { type_delivery } = await get_type_delivery(invoice_id);

      const url = ctx.session['url']
        ? ctx.session['url']
        : await generate_url_payment(sum, invoice_ms_id);
      url ? (ctx.session['url'] = url) : null;

      let not_text;
      const message_text = ctx.update.message?.text;
      if (!message_text) not_text = true;
      if (
        (callback && callback == 'check_payment') ||
        type_payment != 'to_bank_card'
      ) {
        const is_payment = await check_payment(invoice_ms_id, sum);
        if (type_payment != 'to_bank_card' || !is_payment) {
          await update_statistics_field('order_payment_count');
          const keyboard = mainKeyboard(ctx);
          if (type_delivery == 'self_pickup_lviv') {
            await ctx.reply(`${ctx.i18n.t('payment.shop_self')}`, keyboard);
          } else if (type_delivery?.includes('nova_poshta')) {
            await ctx.reply(
              `${ctx.i18n
                .t('payment.np_success')
                .replace('№', `${invoice_ms_id}`)}`,
              keyboard
            );
            ctx.session['np_ttn'] = true;
          } else {
            await ctx.reply(`${ctx.i18n.t('payment.local_lviv')}`, keyboard);
          }
        }
        return ctx.session['np_ttn']
          ? ctx.scene.enter('consignment_note')
          : ctx.scene.leave();
      } else if (!not_text && ctx.session['promo_code']) {
        await ctx.reply(
          `${ctx.i18n.t('payment.congratulations_success')}`,
          Markup.inlineKeyboard([
            [Markup.urlButton(`${ctx.i18n.t('payment.to_pay')}`, url ? url : '')],
            [
              Markup.callbackButton(
                `${ctx.i18n.t('payment.check_payment')}`,
                'check_payment'
              ),
            ],
          ]).extra()
        );
      } else if (callback && callback == 'enter_promo_code') {
        await ctx.reply(ctx.i18n.t('payment.exist_promo_code'));
        ctx.session['promo_code'] = true;
      } else {
        await ctx.reply(
          (type_delivery == 'self_pickup_lviv'
            ? `${ctx.i18n.t('payment.shop_self')}`
            : `${ctx.i18n.t('payment.ordering_successful')}`
          ).replace('@', sum),
          Markup.inlineKeyboard([
            [Markup.urlButton(`${ctx.i18n.t('payment.to_pay')}`, url ? url : '')],
            [
              Markup.callbackButton(
                `${ctx.i18n.t('payment.promo_code')}`,
                'enter_promo_code'
              ),
            ],
            [
              Markup.callbackButton(
                `${ctx.i18n.t('payment.check_payment')}`,
                'check_payment'
              ),
            ],
          ]).extra()
        );
      }
    } catch (err) {
      console.log('payment_callback1', err);
    }
});
