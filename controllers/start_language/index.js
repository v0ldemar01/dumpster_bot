'use strict';
const WizardScene = require('telegraf/scenes/wizard');
const Markup = require('telegraf/markup');
const { current_language } = require('../../util/language');

module.exports = new WizardScene(
  'start_language', 
  async ctx => {
    try {
      const isUA = ctx.i18n.languageCode === 'ua';
      await ctx.reply(
        ctx.i18n.t('start.welcome_language'),
        Markup.inlineKeyboard([
          [
            Markup.callbackButton(
              ctx.i18n.t(`start.${current_language(isUA)}`),
              'ua'
            ),
          ],
          [
            Markup.callbackButton(
              ctx.i18n.t(`start.${current_language(!isUA)}`),
              'ru'
            ),
          ],
        ]).extra()
      );

      return ctx.scene.leave();
    } catch (err) {
      console.log('start_language_callback', err);
    }
});
