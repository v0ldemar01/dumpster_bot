'use strict';
const WizardScene = require('telegraf/scenes/wizard');
const {
  get_data_from_invoice,
  delete_data_from_invoice,
} = require('../../util/state/invoice');
const { clear_space } = require('../clear');
const { get_invoice_id, get_current_key } = require('../../util/state/state');
const { edit_markup } = require('../delivery/edit_markup');
const { mainKeyboard, keyboard_action } = require('../../util/keyboard');
const { template_user_info } = require('./user_info_data');
const { update_users_crater_info } = require('../../util/state/statistics');
const { updateUser } = require('../../additional/user');
const {
  request_contact_message,
  check_regexp_contact,
  check_correct_full_name,
  request_city,
  check_correct_city,
} = require('./function');

module.exports = new WizardScene(
  'to_order',
  async ctx => {
    try {
      if (ctx.session['to_order_first']) {
        await updateUser(ctx);
        delete ctx.session['to_order_first']; 
      }
      await clear_space(ctx);
      const user_id =
        ctx.update?.message?.chat?.id ||
        ctx.update.callback_query?.message?.chat?.id ||
        ctx.update.callback_query?.from?.id;
      await update_users_crater_info(user_id, 'crater.to_order');
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

      let init;
      const callback = ctx.update.callback_query?.data;
      const { invoice_id } = await get_invoice_id(user_id);
      if (callback && callback == 'write_yes') {
        ctx.session['first_iteration'] = true;
        return await ctx.scene.enter('payment');
      } else if (callback && callback == 'no_rewrite') {
        await clear_space(ctx);
        await delete_data_from_invoice(invoice_id);
      } else if (!ctx.session['template_order']) {
        ctx.session['template_order'] = true;
        const user_data = await get_data_from_invoice(user_id);
        if (user_data && user_data.length) {
          const result_bool = await template_user_info(
            ctx,
            user_id,
            user_data,
            invoice_id
          );
          if (result_bool) return;
          init = true;
        }
      }
      await request_contact_message(ctx, init);
      delete ctx.session['template_order'];
      delete ctx.session['main_menu'];
      return ctx.wizard.next();
    } catch (err) {
      console.log('to_order_callback1', err);
    }
  },
  async ctx => {
    try {
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

      const check_contact = await check_regexp_contact(ctx, true);
      if (!check_contact) {
        await clear_space(ctx);
        await ctx.wizard.next();
      } else if (check_contact && check_contact == 'callback') {
        return;
      } else {
        return await ctx.scene.enter('to_order');
      }
    } catch (err) {
      console.log('to_order_callback2', err);
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

      const check_full_name = await check_correct_full_name(ctx, true);
      return check_full_name ? null : await ctx.wizard.next();
    } catch (err) {
      console.log('to_order_callback3', err);
    }
  },
  async (ctx) => {
    try {
      await edit_markup(ctx, true);
      const user_id =
        ctx.update?.message?.chat?.id ||
        ctx.update.callback_query?.message?.chat?.id ||
        ctx.update.callback_query?.from?.id;
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
      } else {
        await request_city(ctx);
        return ctx.wizard.next();
      }
    } catch (err) {
      console.log('to_order_callback4', err);
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

      await check_correct_city(ctx, true);
      return await ctx.scene.enter('delivery');
    } catch (err) {
      console.log('to_order_callback5', err);
    }
  }
);
