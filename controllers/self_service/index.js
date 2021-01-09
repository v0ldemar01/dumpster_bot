'use strict';
const WizardScene = require('telegraf/scenes/wizard');
const Markup = require('telegraf/markup');
const { markup_template } = require('../../util/markup_column');
const {
  get_categories_from,
} = require('../../util/db/select/get_categories_from');
const {
  clear_state,
  set_current_key,
  get_inline_message_id,
} = require('../../util/state/state');
const { user_language } = require('../../util/language');
const { updateUser } = require('../../additional/user');
const { update_users_crater_info } = require('../../util/state/statistics');
const { clear_space } = require('../clear');
let { scenes } = require('../../additional/scenes');

module.exports = new WizardScene(
  'self_search', 
  async ctx => {
    try {
      delete ctx.session['is_favourite_menu'];
      delete ctx.session['mailing_goods_ref'];

      await updateUser(ctx);
      //await checkClickKeyboard(ctx);
      const user_id =
        ctx.update?.message?.chat?.id ||
        ctx.update.callback_query?.message?.chat?.id ||
        ctx.update.callback_query?.from?.id;

      const from_back = ctx.update.callback_query?.data;
      if (from_back && from_back == 'back') {
        const { inline_message_id } = await get_inline_message_id(user_id);
        
        inline_message_id
          ? await clear_space(ctx, parseInt(inline_message_id))
          : await clear_space(ctx);
      } else {
        await clear_space(ctx, null, 2);
      }
      if (ctx.session['self_search_to']) {
        delete ctx.session['self_search_to'];
      }

      if (ctx.scene) {
        scenes = ctx.scene;
      } else {
        ctx.scene = scenes;
      }

      await update_users_crater_info(user_id, 'crater.category');
      await set_current_key(user_id, ctx.i18n.t('main_menu.to_category'));

      await user_language(ctx);

      await clear_state(user_id);
      const categories_result = await get_categories_from(true);
      const markup_callbacks = await markup_template(
        categories_result,
        'category',
        ctx.i18n,
        true
      );

      markup_callbacks.push([
        Markup.callbackButton(
          ctx.i18n.t('smart_search.select_categories'),
          'select_filter'
        ),
      ]);
      markup_callbacks.push([
        Markup.callbackButton(
          ctx.i18n.t('smart_search.group_by_budget'),
          'select_budget'
        ),
      ]);
      markup_callbacks.push([
        Markup.callbackButton(ctx.i18n.t('main_menu.back'), 'full_back'),
      ]);

      await ctx.telegram.sendMessage(
        user_id,
        ctx.i18n.t('smart_search.select_category'),
        Markup.inlineKeyboard(markup_callbacks).extra()
      );

      return ctx.scene.leave();
    } catch (err) {
      console.log('self_search_callback', err);
    }
});
