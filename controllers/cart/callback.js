'use strict';
let { scenes } = require('../../additional/scenes');
const { clear_space } = require('../clear');

exports.cart = async ctx => {
  try {
    await clear_space(ctx);
    if (!ctx.scene) ctx.scene = scenes;
    const user_id =
      ctx.update?.message?.chat?.id ||
      ctx.update.callback_query?.message?.chat?.id ||
      ctx.update.callback_query?.from?.id;
    if (!Object.keys(ctx.scene).length) {
      return await ctx.telegram.sendMessage(
        user_id,
        ctx.i18n.t('main_menu.error_back')
      );
    }
    ctx.session['cart_first_message'] = true;
    return ctx.scene.enter('cart');
  } catch (err) {
    console.log("cart", err);
  }
};
