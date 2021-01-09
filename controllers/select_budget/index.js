'use strict';
const WizardScene = require('telegraf/scenes/wizard');
const Markup = require('telegraf/markup');
const { insert_state } = require('../../util/state/state');
const { updateUser } = require('../../additional/user');
const { clear_space } = require('../clear');
const { update_users_crater_info } = require('../../util/state/statistics');
let { scenes } = require('../../additional/scenes');

module.exports = new WizardScene(
  'select_budget',
  async ctx => {
    try {
      await clear_space(ctx);
      await updateUser(ctx);
      await update_statistics_field('with_budget_count');

      await ctx.reply(
        ctx.i18n.t('budget.budget_range'),
        Markup.inlineKeyboard([
          [
            Markup.callbackButton(
              ctx.i18n.t('general.back'), 
              'back'
            )
          ],
        ]).extra()
      );

      const user_id =
        ctx.update?.message?.chat?.id ||
        ctx.update.callback_query?.message?.chat?.id ||
        ctx.update.callback_query?.from?.id;
      await update_users_crater_info(user_id, 'crater.budget');

      return ctx.wizard.next();
    } catch (err) {
      console.log('select_budget_callback1', err);
    }
  },
  async ctx => {
    try {
      const input = ctx.message?.text;
      const user_id = ctx.update.message?.chat?.id;
      const callback = ctx.update.callback_query?.data;
      if (callback && callback == 'back') return ctx.scene.enter('self_search');
      if (isNaN(parseInt(input))) {
        await ctx.reply(ctx.i18n.t('budget.error_budget'));
        return ctx.scene.enter('select_budget');
      }
      await insert_state(ctx, input, user_id);
      await ctx.reply(ctx.i18n.t('budget.budget_range'));

      if (ctx.scene) {
        scenes = ctx.scene;
      } else {
        ctx.scene = scenes;
      }
      return ctx.scene.enter('select_many');
    } catch (err) {
      console.log('select_budget_callback2', err);
    }
  }
);
