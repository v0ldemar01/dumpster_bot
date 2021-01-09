'use strict';
const Markup = require('telegraf/markup');
const WizardScene = require('telegraf/scenes/wizard');
const { set_current_key } = require('../../util/state/state');
const { updateUser } = require('../../additional/user');

const answer_question = async (ctx) => {
  try {
    const user_id =
      ctx.update.callback_query?.message?.chat?.id ||
      ctx.update.callback_query?.from?.id;
    await set_current_key(user_id, ctx.i18n.t('main_menu.answ_comm_question'));
    await ctx.reply(
      ctx.i18n.t('general.answ_comm_questions'),
      Markup.inlineKeyboard([
        [
          Markup.switchToCurrentChatButton(
            ctx.i18n.t('main_menu.answ_comm_question'),
            'answer_questions',
            false
          ),
        ],
      ]).extra()
    );
  } catch (err) {
    console.log('answer_question', err);
  }
};

module.exports = new WizardScene(
  'answer_question', 
  async ctx => {
    try {
      await updateUser(ctx);
      await answer_question(ctx);

      return ctx.scene.leave();
    } catch (err) {
      console.log('answer_question_callback', err);
    }
});
