'use strict';
const WizardScene = require('telegraf/scenes/wizard');
const { edit_markup } = require('../delivery/edit_markup');
const { set_correct, get_type_delivery } = require('../../util/state/invoice');
const { get_invoice_id, get_current_key } = require('../../util/state/state');
const { mainKeyboard, keyboard_action } = require('../../util/keyboard');
const {
  template_delivery_info,
} = require('../delivery_nova_poshta/template_delivery_info');
const {
  request_contact_message,
  check_regexp_contact,
  request_full_name,
  check_correct_full_name,
} = require('../to_order/function');
const { np_location } = require('../delivery_nova_poshta/function');
const { clear_space } = require('../clear');

module.exports = new WizardScene(
  'other_recipient',
  async ctx => {
    try {
      await clear_space(ctx);
      const user_id =
        ctx.update?.message?.chat?.id ||
        ctx.update.callback_query?.message?.chat?.id ||
        ctx.update.callback_query?.from?.id;
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
      await request_full_name(ctx, true);
      return ctx.wizard.next();
    } catch (err) {
      console.log('other_recipient_callback1', err);
    }
  },
  async ctx => {
    try {
      await clear_space(ctx);
      const user_id =
        ctx.update?.message?.chat?.id ||
        ctx.update.callback_query?.message?.chat?.id ||
        ctx.update.callback_query?.from?.id;
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
      } else if (ctx.session['np']) {
        await np_location(ctx, false, true);
      } else {
        const check_full_name = await check_correct_full_name(ctx, false, true);
        if (!check_full_name) {
          const user_id =
            ctx.update?.message?.chat?.id ||
            ctx.update.callback_query?.message?.chat?.id ||
            ctx.update.callback_query?.from?.id;
          const { invoice_id } = await get_invoice_id(user_id);
          const { type_delivery } = await get_type_delivery(invoice_id);
          if (type_delivery.includes('nova_poshta')) {
            ctx.session['np'] = true;
            return await ctx.reply(`${ctx.i18n.t('to_order.for_not_me_np')}`);
          }
        }
      }
      await request_contact_message(ctx, false, true);
      return await ctx.wizard.next();
    } catch (err) {
      console.log('other_recipient_callback2', err);
    }
  },
  async ctx => {
    try {
      await clear_space(ctx);      
      const user_id =
        ctx.update?.message?.chat?.id ||
        ctx.update.callback_query?.message?.chat?.id ||
        ctx.update.callback_query?.from?.id;
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
      const check_contact = await check_regexp_contact(ctx, false, true);
      if (check_contact) return;
      const result_bool = await template_delivery_info(ctx, user_id);
      //const result_bool = await template_delivery_info(ctx, user_id, true, true);
      if (!result_bool) return ctx.scene.enter('other_recipient');
      return await ctx.wizard.next();
    } catch (err) {
      console.log("other_recipient_callback3", err);
    }
  },
  async ctx => {
    try {
      const user_id =
        ctx.update.message?.from?.id || ctx.update.callback_query?.from?.id;
      const selected_number_button = await edit_markup(ctx);
      if (!selected_number_button) return ctx.scene.leave();
      if (selected_number_button.includes(2))
        return ctx.scene.enter("other_recipient");

      const { invoice_id } = await get_invoice_id(user_id);
      await set_correct(invoice_id, true);
      ctx.session['to_chEck_correct'] = true;
      return await ctx.scene.enter('check_correct');
    } catch (err) {
      console.log('other_recipient_callback4', err);
    }
  }
);
