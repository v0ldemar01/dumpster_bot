'use strict';
const WizardScene = require('telegraf/scenes/wizard');
const Markup = require('telegraf/markup');
const { edit_markup } = require('../delivery/edit_markup');
const { checkClickKeyboard } = require('../../additional/keyboard');
const { updateUser } = require('../../additional/user');

module.exports = new WizardScene(
  'shares',
  async ctx => {
    try {
      await updateUser(ctx);
      await ctx.reply(
        `${ctx.i18n.t('shares.subscription')}`,
        Markup.inlineKeyboard([
          [
            Markup.callbackButton(
              `${ctx.i18n.t('shares.toggle_subscription')}`,
              'toggle_subscription'
            ),
          ],
        ]).extra()
      );

      return ctx.wizard.next();
    } catch (err) {
      console.log('shares_callback1', err);
    }
  },
  async ctx => {
    try {
      await edit_markup(ctx);
      const check = checkClickKeyboard(ctx);
      if (check) {
        await ctx.reply(ctx.i18n.t('additional_func.click_again'));
        return ctx.scene.leave();
      }
    } catch (err) {
      console.log('shares_callback2', err);
    }
  }
);
