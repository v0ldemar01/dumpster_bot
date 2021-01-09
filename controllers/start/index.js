'use strict';
const WizardScene = require('telegraf/scenes/wizard');
const Markup = require('telegraf/markup');
const Extra = require('telegraf/extra');
const { url_message } = require('./url_message');
const { mainKeyboard } = require('../../util/keyboard');
const { update_users_crater_info } = require('../../util/state/statistics');

module.exports = new WizardScene(
  'start', 
  async ctx => {
    try {
      let markup = mainKeyboard(ctx);
      markup = Object.assign({}, Extra.webPreview(false), markup);

      let message = url_message(ctx.i18n.t('greeting.welcome_message'), true);
      await ctx.replyWithHTML(message, markup);

      markup = Object.assign(
        {},
        Extra.webPreview(false),
        Markup.inlineKeyboard([
          [
            Markup.callbackButton(
              ctx.i18n.t('greeting.select_category'),
              'self_search'
            ),
          ],
          [Markup.callbackButton(ctx.i18n.t('greeting.enter_search'), 'search')],
        ]).extra()
      );

      message = url_message(ctx.i18n.t('greeting.video_greeting'), true);
      await ctx.replyWithHTML(message, markup);

      const user_id =
        ctx.update?.message?.chat?.id ||
        ctx.update.callback_query?.message?.chat?.id ||
        ctx.update.callback_query?.from?.id;
      await update_users_crater_info(user_id, 'crater.greeting');

      return ctx.scene.leave();
    } catch (err) {
      console.log('start_callback', err);
    }
});
