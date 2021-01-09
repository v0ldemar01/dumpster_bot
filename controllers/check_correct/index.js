'use strict';
const WizardScene = require('telegraf/scenes/wizard');
const { template_user_info } = require('../to_order/user_info_data');
const { get_data_from_invoice } = require('../../util/state/invoice');
const { get_invoice_id, get_current_key } = require('../../util/state/state');
const { mainKeyboard, keyboard_action } = require('../../util/keyboard');
const { clear_space } = require('../clear');
const {
  request_contact_message,
  check_regexp_contact,
  request_full_name,
  check_correct_full_name,
  request_city,
  check_correct_city,
} = require('../to_order/function');
const {
  delivery_type_message,
  payment_type_message,
  confirm_message,
  check_callback,
} = require('../delivery/function');
const { np_message, np_location } = require('../delivery_nova_poshta/function');

module.exports = new WizardScene(
  'check_correct', 
  async (ctx) => {
    try {
      await clear_space(ctx);
      if (ctx.update.message?.text == '/start')
        return await ctx.scene.enter('start');
      const user_id =
        ctx.update.callback_query?.from?.id || ctx.update.message?.from?.id;
      const callback = ctx.update.callback_query?.data;
      const { invoice_id } = await get_invoice_id(user_id);
      
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
      const session_check_parametr = Object.keys(ctx.session).some((element) =>
        element.includes('error')
      );
      let checker = Object.keys(ctx.session).some((element) =>
        element.includes('check')
      );
      if (callback && callback == 'write_yes') {
        ctx.session["first_iteration"] = true;
        return await ctx.scene.enter('payment');
      } else if (
        (callback && callback.includes('check')) ||
        session_check_parametr
      ) {
        if (callback == 'check_full_name' || ctx.session['error_full_name']) {
          ctx.session['check_full_name'] = true;
          return await request_full_name(ctx);
        } else if (callback == 'check_contact' || ctx.session['error_contact']) {
          ctx.session['check_contact'] = true;
          return await request_contact_message(ctx);
        } else if (callback == 'check_city' || ctx.session['error_city']) {
          ctx.session['check_city'] = true;
          return await request_city(ctx);
        } else if (
          callback == 'check_delivery_type' ||
          ctx.session['error_delivery_type']
        ) {
          ctx.session['check_delivery_type'] = true;
          return await delivery_type_message(ctx);
        } else if (
          callback == 'check_payment_type' ||
          ctx.session['error_payment_type']
        ) {
          ctx.session['check_payment_type'] = true;
          return await payment_type_message(ctx);
        } else if (callback == 'check_confirm' || ctx.session['error_confirm']) {
          ctx.session['check_confirm'] = true;
          return await confirm_message(ctx);
        }
      } else if (ctx.session['check_full_name']) {
        const check_full_name = await check_correct_full_name(ctx);
        check_full_name
          ? (ctx.session['error_full_name'] = true)
          : (ctx.session['check_full_name'] = false);
      } else if (ctx.session['check_contact']) {
        const check_contact = await check_regexp_contact(ctx);
        check_contact
          ? (ctx.session['error_contact'] = true)
          : (ctx.session['check_contact'] = false);
      } else if (ctx.session['check_np_location']) {
        const check_np_location = await np_location(ctx, true);
        !check_np_location
          ? (ctx.session['error_np_location'] = true)
          : (ctx.session['check_np_location'] = false);
      } else if (ctx.session['check_to_message']) {
        await np_message(ctx);
        ctx.session['check_to_message'] = false;
        ctx.session['check_np_location'] = true;
        return;
      } else if (ctx.session['check_city']) {
        const check_city = await check_correct_city(ctx);
        check_city
          ? (ctx.session['error_city'] = true)
          : (ctx.session['check_city'] = false);
        ctx.session['check_to_message'] = true;
        checker = true;
      } else if (ctx.session['check_delivery_type']) {
        const check_delivery_type = await check_callback(ctx);
        ctx.session['check_delivery_type'] = false;
      } else if (ctx.session['check_payment_type']) {
        const check_payment_type = await check_callback(ctx);
        check_payment_type
          ? (ctx.session['error_payment_type'] = true)
          : (ctx.session['check_payment_type'] = false);
      } else if (ctx.session["check_confirm"]) {
        const check_confirm = await check_callback(ctx);
        check_confirm
          ? (ctx.session['error_confirm'] = true)
          : (ctx.session['check_confirm'] = false);
      } else if (ctx.session['to_chEck_correct']) {
        const user_data = await get_data_from_invoice(user_id);
        if (user_data && user_data.length) {
          const result_bool =
            callback && callback == 'no_rewrite'
              ? await template_user_info(
                  ctx,
                  user_id,
                  user_data,
                  invoice_id,
                  true,
                  true
                )
              : await template_user_info(
                  ctx,
                  user_id,
                  user_data,
                  invoice_id,
                  true
                );
          delete ctx.session['to_chEck_correct'];      
          return result_bool ? null : await ctx.scene.enter('to_order');
        }
      }
      if (checker) {
        await ctx.wizard.selectStep(ctx.wizard.cursor);
        return await ctx.wizard.step(ctx);
      }
    } catch (err) {
      console.log('check_correct', err);
    }
});
