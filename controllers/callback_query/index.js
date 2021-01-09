'use strict';
const { toggle_inline_menu } = require('./toggle');
const { budget_inline_menu } = require('./budget');
const { insert_state, select_state } = require('../../util/state/state');
const { goods_inline_menu } = require('./card');
const { edit_cart_inline } = require('./cart');
const { make_parse_switch_data } = require('./budget');
const exceptions = ['delete'];
let { scenes } = require('../../additional/scenes');

exports.callback_query = async (ctx) => {
  try {
    const user_id =
      ctx.update.callback_query?.message?.chat?.id ||
      ctx.update.callback_query?.from?.id;
    let message_markup =
      ctx.callbackQuery.message?.reply_markup?.inline_keyboard;
    const callback = ctx.update.callback_query?.data;
    const message_text = ctx.callbackQuery.message?.text;
    if (ctx.scene) {
      scenes = ctx.scene;
    } else {
      ctx.scene = scenes;
    }
    if (ctx.i18n.t('budget.selecting_filter') === message_text) {
      await budget_inline_menu(
        ctx,
        message_markup,
        callback,
        message_text,
        user_id
      );
    } else if (
      ctx.update.callback_query.inline_message_id ||
      ctx.session['is_favourite_menu'] ||
      ctx.session['mailing_goods_ref']
    ) {
      return await goods_inline_menu(ctx, callback, user_id);
    } else if (callback.includes(exceptions[0])) {
      return await edit_cart_inline(ctx, user_id);
    } else {
      const [
        new_message_markup,
        isChange,
        check_active,
      ] = await toggle_inline_menu(ctx, message_markup, callback, message_text);
      ctx.session['check_active'] = check_active.length;

      await insert_state(ctx, check_active, user_id, message_text);
      const switch_data = await select_state(user_id);
      const inline_query_data = make_parse_switch_data(switch_data);

      if (ctx.i18n.t('smart_search.select_category') === message_text)
        return ctx.scene.enter('select_filter');

      if (switch_data)
        new_message_markup[
          new_message_markup.length - 2
        ][0].switch_inline_query_current_chat = 'goods ' + inline_query_data;
      if (isChange)
        await ctx.editMessageReplyMarkup({
          inline_keyboard: new_message_markup,
        });
    }
  } catch (err) {
    console.log("callback_query", err);
  }
};
