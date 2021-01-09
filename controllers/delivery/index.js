'use strict';
const WizardScene = require('telegraf/scenes/wizard');
const { edit_markup } = require('./edit_markup');
const {
  get_locality,
  get_info_is_recipient,
  set_correct,
} = require('../../util/state/invoice');
const { clear_space } = require('../clear');
const { mainKeyboard, keyboard_action } = require('../../util/keyboard');
const { get_invoice_id, get_current_key } = require('../../util/state/state');
const {
  delivery_type_message,
  payment_type_message,
  confirm_message,
} = require('./function');

const locality = ['Львів'];

module.exports = new WizardScene(
  'delivery',
  async ctx => {
    try {
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
      } else {
        await delivery_type_message(ctx, true);
        return await ctx.wizard.next();
      }
    } catch (err) {
      console.log('delivery_callback1', err);
    }
  },
  async ctx => {
    try {
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
      } else {
        const check_selected = await payment_type_message(ctx, true);
        if (check_selected) ctx.scene.leave();
        return ctx.wizard.next();
      }
    } catch (err) {
      console.log('delivery_callback2', err);
    }
  },
  async ctx => {
    try {
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
      const check_selected = await confirm_message(ctx, true);
      if (check_selected) return await ctx.scene.leave();
      return ctx.wizard.next();
    } catch (err) {
      console.log('delivery_callback3', err);
    }
  },
  async ctx => {
    try {
      const selected_number_button = await edit_markup(ctx);
      await clear_space(ctx);
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
      if (!selected_number_button) return ctx.scene.leave();
      const user_id = ctx.update.callback_query?.from?.id;
      const { invoice_id } = await get_invoice_id(user_id);

      const { is_recipient } = await get_info_is_recipient(invoice_id);
      ctx.session['is_recipient'] = parseInt(is_recipient);
      const { locality } = await get_locality(invoice_id);
      if (parseInt(is_recipient) && locality.includes(locality[0])) {
        await set_correct(invoice_id, true);
        ctx.session['to_chEck_correct'] = true;
        return await ctx.scene.enter('check_correct');
      }
      if (
        parseInt(is_recipient) ||
        (parseInt(is_recipient) && !locality.includes(locality[0]))
      ) {
        return ctx.scene.enter('delivery_nova_poshta');
      } else if (!parseInt(is_recipient)) {
        return ctx.scene.enter('other_recipient');
      }
    } catch (err) {
      console.log('delivery_callback4', err);
    }
  }
);
