'use strict';
const Markup = require('telegraf/markup');
const {
  select_all_goods_by_ms_id,
  select_all_favourites,
  get_results_id,
  get_count_of_goods_at_cart,
  set_result_id,
} = require('./state/goods');
const { get_mailing_goods_ref } = require('./state/state');
const { message_text } = require('../controllers/inline_query/reply_message');
const { inline_keyboard } = require('../controllers/inline_query/reply_markup');
const { user_language } = require('./language');
const { get_status_goods } = require('./db/select/get_status');
const { exchange_rate_analysis } = require('./state/state');

exports.goods_card = async (ctx, is_inline_mode) => {
  try {
    let results;
    let cart_checker;
    let favourite_checker;
    let count;
    const user_id =
      ctx.update?.message?.chat?.id ||
      ctx.update.callback_query?.message?.chat?.id ||
      ctx.update.callback_query?.from?.id;
    if (ctx.session['is_favourite_menu']) {
      results = await select_all_favourites(user_id);
    } else if (ctx.session['mailing_goods_ref']) {
      const { mailing_goods_ref } = await get_mailing_goods_ref(user_id);      
      const ms_goods_ids = mailing_goods_ref?.split(', ');
      results = await select_all_goods_by_ms_id(ms_goods_ids);
    }
    results = results.filter((e) => e);
    if (!results || !results.length)
      return console.log('!results || !results.length');

    const results_favourite_id = await get_results_id(user_id);
    const results_cart_id = await get_results_id(user_id, 'cart');
    const new_results_favourite_id = results_favourite_id
      ? results_favourite_id.map(({ ms_goods_id }) => ms_goods_id)
      : [];
    const new_results_cart_id = results_cart_id
      ? results_cart_id.map(({ ms_goods_id }) => ms_goods_id)
      : [];
    const cart_content = await get_count_of_goods_at_cart(user_id);

    new_results_favourite_id.forEach((result_element) => {
      if (result_element == results[0].ms_goods_id) {
        favourite_checker = true;
      }
    });
    new_results_cart_id.forEach((result_element) => {
      if (result_element == results[0].ms_goods_id) {
        cart_checker = true;
      }
    });

    cart_content
      ? cart_content.forEach((cart_element) => {
          if (cart_element.goods_id === results[0].ms_goods_id)
            count = cart_element.count;
        })
      : null;
    await set_result_id(user_id, 0);
    const exchange_rate = await exchange_rate_analysis(user_id);
    await user_language(ctx);
    const language = ctx.i18n.locale();
    const [status_new, status_used] = await get_status_goods(language);
    const description = message_text(results[0], ctx.i18n, exchange_rate, [
      status_new,
      status_used,
    ]);
    const markup = inline_keyboard(
      ctx.i18n,
      true,
      false,
      favourite_checker,
      cart_checker,
      count
    );

    await ctx.reply(
      description,
      Object.assign(
        {},
        { parse_mode: 'HTML' },
        Markup.inlineKeyboard(markup).extra()
      )
    );
  } catch (err) {
    console.log('goods_card', err);
  }
};
