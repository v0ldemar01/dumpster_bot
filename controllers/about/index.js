'use strict';
const Markup = require('telegraf/markup');
const WizardScene = require('telegraf/scenes/wizard');

module.exports = new WizardScene(
  'about',
  async ctx => {
    try {
      await ctx.reply(
        `${ctx.i18n.t('to_order.contact')}`,
        Markup.keyboard([
          [
            Markup.contactRequestButton(
              `${ctx.i18n.t('to_order.contact_from_tg')}`
            ),
          ],
          [ctx.i18n.t('main_menu.back')],
        ])
          .oneTime()
          .resize()
          .extra()
      );

      return ctx.wizard.next();
    } catch (err) {
      console.log('about_callback1', err);
    }
  },
  async ctx => {
    try {
      const { contact } = ctx.update?.message;
      if (!contact) return ctx.scene.enter('feedback');
      const { user_id, phone_number } = contact;
      await set_own_contact(user_id, phone_number);

      const keyboard = mainKeyboard(ctx);
      await ctx.reply(
        `${ctx.i18n.t('to_order.enter_yourself')}`,
        Object.assign(
          {},
          Markup.inlineKeyboard([
            [
              Markup.switchToCurrentChatButton(
                ctx.i18n.t('main_menu.answ_comm_question'),
                'answer_questions',
                false
              ),
            ],
          ]).extra(),
          keyboard
        )
      );

      return ctx.scene.leave();
    } catch (err) {
      console.log("about_callback2", err);
    }
  }
);
