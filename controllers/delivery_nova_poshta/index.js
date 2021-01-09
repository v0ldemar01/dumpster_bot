'use strict';
const WizardScene = require('telegraf/scenes/wizard');
const { edit_markup } = require('../delivery/edit_markup');
const { get_invoice_id, get_current_key } = require('../../util/state/state');
const { mainKeyboard, keyboard_action } = require('../../util/keyboard');
const { np_message, np_location } = require('./function');
const { clear_space } = require('../clear');
const { set_correct } = require('../../util/state/invoice');

module.exports = new WizardScene(
  'delivery_nova_poshta',
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
      await np_message(ctx);
      return ctx.wizard.next();
    } catch (err) {
      console.log('delivery_nova_poshta_callback1', err);
    }
  },
  async ctx => {
    try {
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
      const result_bool = await np_location(ctx);
      if (!result_bool) return ctx.scene.enter('delivery_nova_poshta');
      return ctx.wizard.next();
    } catch (err) {
      console.log('delivery_nova_poshta_callback2', err);
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
      if (selected_number_button.includes(2))
        return ctx.scene.enter('delivery_nova_poshta');
      const user_id =
        ctx.update.message?.from?.id || ctx.update.callback_query?.from?.id;
      const { invoice_id } = await get_invoice_id(user_id);
      await set_correct(invoice_id, true);
      ctx.session['to_chEck_correct'] = true;
      return await ctx.scene.enter('check_correct');
    } catch (err) {
      console.log('delivery_nova_poshta_callback3', err);
    }
  }
);
