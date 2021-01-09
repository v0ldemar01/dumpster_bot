'use strict';
const WizardScene = require('telegraf/scenes/wizard');
const Markup = require('telegraf/markup');
const { get_brands_from } = require('../../util/db/select/get_brands_from');
const {
  get_accessories_to_category,
} = require('../../util/db/select/get_categories_from');
const { markup_template } = require('../../util/markup_column');
const { select_state } = require('../../util/state/state');
const { clear_space } = require('../clear');
let { scenes } = require('../../additional/scenes');

module.exports = new WizardScene(
  'select_filter', 
  async ctx => {
    try {
      const callback = ctx.update.callback_query?.data;
      await clear_space(ctx);

      const user_id =
        ctx.update.callback_query?.message?.chat?.id ||
        ctx.update.callback_query?.from?.id;
      const { selected_category } = await select_state(user_id);
      const brands_result = await get_brands_from(selected_category);
      const markup_callbacks = await markup_template(
        brands_result,
        'brand',
        ctx.i18n,
        [callback]
      );
      const accessory_result = await get_accessories_to_category(
        selected_category
      );
      if (accessory_result.length) {
        const markup_callbacks_accessory = await markup_template(
          accessory_result,
          'category',
          ctx.i18n,
          [callback],
          true
        );
        markup_callbacks.push(...markup_callbacks_accessory);
      }
      markup_callbacks.push([
        Markup.switchToCurrentChatButton(
          ctx.i18n.t('smart_search.show_selected_goods'),
          'goods '
        ),
      ]);
      markup_callbacks.push([
        Markup.callbackButton(ctx.i18n.t('general.back'), 'back'),
      ]);
      if (ctx.scene) {
        scenes = ctx.scene;
      } else {
        ctx.scene = scenes;
      }
      await ctx.reply(
        ctx.i18n.t('smart_search.select_brand'),
        Markup.inlineKeyboard(markup_callbacks).extra()
      );

      return ctx.scene.leave();
    } catch (err) {
      console.log('select_filter_callback', err);
    }
});
