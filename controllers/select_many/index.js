'use strict';
const WizardScene = require('telegraf/scenes/wizard');
const Markup = require('telegraf/markup');
const {
  inline_menu_buttons,
  get_length_inline_menu,
} = require('../select_budget/menu');
const { updateUser } = require('../../additional/user');
const { clear_space } = require('../clear');
let { scenes } = require('../../additional/scenes');

module.exports = new WizardScene(
  'select_many', 
  async ctx => {
    try {
      await updateUser(ctx);
      await clear_space(ctx);
      ctx.session['index'] = 0;
      ctx.session['categories_brands_toggle'] = [];

      const markup_callbacks = await inline_menu_buttons(
        ctx,
        ctx.session['index']
      );
      ctx.session['menu_length'] = await get_length_inline_menu(ctx);
      if (ctx.scene) {
        scenes = ctx.scene;
      } else {
        ctx.scene = scenes;
      }
      await ctx.reply(
        ctx.i18n.t('budget.selecting_filter'),
        Markup.inlineKeyboard(markup_callbacks).resize().extra()
      );
      return ctx.scene.leave();
    } catch (err) {
      console.log('select_many', err);
    }
});
