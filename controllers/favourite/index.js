'use strict';
const WizardScene = require('telegraf/scenes/wizard');
const { goods_card } = require('../../util/goods_card');
const { clear_space } = require('../clear');
const { updateUser } = require('../../additional/user');
const { mainKeyboard } = require('../../util/keyboard');

module.exports = new WizardScene(
  'favourite', 
  async ctx => {
    try {
      await clear_space(ctx, null, 2);
      await updateUser(ctx);
      ctx.session['is_favourite_menu'] = true;
      const keyboard = mainKeyboard(ctx);
      await ctx.reply(ctx.i18n.t('additional_func.saved_goods'), keyboard);

      await goods_card(ctx);
      return ctx.scene.leave();
    } catch (err) {
      console.log('favourite_callback', err);
    }
});
