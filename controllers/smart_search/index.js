'use strict';
const Markup = require('telegraf/markup');
const WizardScene = require('telegraf/scenes/wizard');
const {
  update_users_crater_info,
  update_statistics_field,
  get_count_crater_by_user,
} = require('../../util/state/statistics');
const { updateUser } = require('../../additional/user');
const { clear_space } = require('../clear');

const smart_search = async ctx => {
  try {
    await clear_space(ctx, null, 2);
    await ctx.reply(
      ctx.i18n.t('smart_search.smart_search'),
      Markup.inlineKeyboard([
        [
          Markup.switchToCurrentChatButton(
            ctx.i18n.t('main_menu.to_search'),
            '',
            false
          ),
        ],
        [
          Markup.callbackButton(
            ctx.i18n.t('main_menu.back'), 
            'full_back'
          )
        ],
      ]).extra()
    );
  } catch (err) {
    console.log('smart_search', err);
  }
};

module.exports = new WizardScene(
  'smart_search', 
  async ctx => {
    try {
      delete ctx.session['is_favourite_menu'];
      delete ctx.session['mailing_goods_ref'];
      await updateUser(ctx);
      await smart_search(ctx);

      const user_id =
        ctx.update?.message?.chat?.id ||
        ctx.update.callback_query?.message?.chat?.id ||
        ctx.update.callback_query?.from?.id;
      await update_users_crater_info(user_id, 'crater.smart_search');
      const { users_count } = await get_count_crater_by_user('smart_search');
      await update_statistics_field('smart_search_count', users_count);

      return ctx.scene.leave();
    } catch (err) {
      console.log('smart_search_callback', err);
    }
});
