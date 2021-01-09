'use strict';
const WizardScene = require('telegraf/scenes/wizard');
const { message_text } = require('./reply_message');
let { scenes } = require('../../additional/scenes');
const { clear_space } = require('../clear');
const { update_users_crater_info } = require('../../util/state/statistics');

module.exports = new WizardScene(
  'edit_cart', 
  async ctx => {
    try {
      await clear_space(ctx, null, 2);

      await ctx.reply(`${ctx.i18n.t('goods_сart.you_ordering')}`);
      await message_text(ctx);
      if (ctx.scene) {
        scenes = ctx.scene;
      } else {
        ctx.scene = scenes;
      }

      const user_id =
        ctx.update?.message?.chat?.id ||
        ctx.update.callback_query?.message?.chat?.id ||
        ctx.update.callback_query?.from?.id;
      await update_users_crater_info(user_id, 'crater.edit_cart');

      return ctx.scene.leave();
    } catch (err) {
      console.log('edit_cart', err);
    }
});
