'use strict';
const WizardScene = require('telegraf/scenes/wizard');
const Markup = require('telegraf/markup');
const { checkClickKeyboard } = require('../../additional/keyboard');

module.exports = new WizardScene(
  'sum_up',
  async ctx => {
    try {
      await ctx.reply(
        `${ctx.i18n.t('additional_func.response')}`,
        Markup.inlineKeyboard([
          [
            Markup.callbackButton(
              `${ctx.i18n.t('additional_func.evaluation')}`,
              'evaluation'
            ),
          ],
        ]).extra()
      );

      return ctx.wizard.next();
    } catch (err) {
      console.log('sum_up_callback1', err);
    }
  },
  async ctx => {
    try {
      const check = await checkClickKeyboard(ctx);
      if (check) {
        return ctx.scene.leave();
      }
      const array = [...Array(10)].map((_, i) => i + 1);
      const array_star = array.map((_, i) =>
        ctx.i18n.t('additional_func.star')
      );
      const markup = array.map((_, i) =>
        Markup.callbackButton(i + 1, `star${i + 1}`)
      );
      const new_length = markup.length / 2;
      const new_markup = new Array(2)
        .fill()
        .map((_) => markup.splice(0, new_length));
      await ctx.reply(
        `${ctx.i18n.t('additional_func.put_star')}\n${array_star.join("")}`,
        Markup.inlineKeyboard(new_markup).extra()
      );
      return ctx.scene.leave();
    } catch (err) {
      console.log('sum_up_callback2', err);
    }
  }
);
