'use strict';
const WizardScene = require('telegraf/scenes/wizard');
const { set_question_text } = require('../../util/state/questions');

module.exports = new WizardScene(
  'question',
  async ctx => {
    try {
      await ctx.reply(
        `${ctx.i18n.t('additional_func.write_own_question')}`
      );
      return ctx.wizard.next();
    } catch (err) {
      console.log('question_callback1', err);
    }
  },
  async ctx => {
    try {
      const user_id =
        ctx.update.message?.from?.id || ctx.update.callback_query?.from?.id;
      const { text } = ctx.update.message;
      await set_question_text(user_id, text);
      await ctx.reply(
        `${ctx.i18n.t('additional_func.automatic_answer')}` +
          `\n\n${ctx.i18n.t('additional_func.contact_for_answer')}` +
          `\n\n${ctx.i18n.t('additional_func.working_time')}`
      );
      return ctx.scene.leave();
    } catch (err) {
      console.log('question_callback2', err);
    }
  }
);
