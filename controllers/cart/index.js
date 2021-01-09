'use strict';
const WizardScene = require('telegraf/scenes/wizard');
const Markup = require('telegraf/markup');
const Extra = require('telegraf/extra');
const { message_text } = require('./reply_message');
const { inline_keyboard } = require('./reply_markup');
const { update_users_crater_info } = require('../../util/state/statistics');
const { get_cart_message_id } = require('../../util/state/state');
const { clear_space } = require('../clear');
const { mainKeyboard } = require('../../util/keyboard');
const { updateUser } = require('../../additional/user');
let { scenes } = require('../../additional/scenes');

module.exports = new WizardScene(
  'cart', 
  async ctx => {
    try {      
      await clear_space(ctx, null, 2);
      await updateUser(ctx);
      const user_id =
        ctx.update?.message?.chat?.id ||
        ctx.update.callback_query?.message?.chat?.id ||
        ctx.update.callback_query?.from?.id;
      const keyboard = mainKeyboard(ctx);
      if (ctx.session['cart_first_message']) {
        ctx.telegram.sendMessage(
          user_id,
          ctx.i18n.t('goods_cart.start'),
          keyboard
        );
        delete ctx.session['cart_first_message'];
      } 
        
      const text = await message_text(ctx);

      if (!text) {
        await ctx.telegram.sendMessage(
          user_id,
          ctx.i18n.t('to_order.cart_empty'),
          Markup.inlineKeyboard([
            [
              Markup.callbackButton(
                ctx.i18n.t('greeting.select_category'),
                'self_search'
              ),
            ],
            [
              Markup.callbackButton(
                ctx.i18n.t('greeting.enter_search'),
                'search'
              ),
            ],
          ]).extra()
        );
        return ctx.scene.leave();
      }

      if (ctx.session['save_changes']) {
        const current_message_id = ctx.update.callback_query?.message?.message_id;
        const { edit_message_id } = await get_cart_message_id(user_id);
        for (let i = edit_message_id + 1; i <= current_message_id; i++) {
          await clear_space(ctx, i);
        }
        delete ctx.session['save_changes'];
      }
      await ctx.telegram.sendMessage(
        user_id,
        text,
        Object.assign(
          {},
          Extra.webPreview(false),
          { parse_mode: 'HTML' },
          Markup.inlineKeyboard(inline_keyboard(ctx.i18n)).extra()
        )
      );

      if (ctx.scene) {
        scenes = ctx.scene;
      } else {
        ctx.scene = scenes;
      }

      await update_users_crater_info(user_id, 'crater.goods_cart');
      return ctx.scene.leave();
    } catch (err) {
      console.log('cart_callback', err);
    }
});
