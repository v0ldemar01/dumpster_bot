'use strict';
const { message_text } = require('./reply_message');
const { inline_keyboard } = require('./reply_markup');
const { get_many_many } = require('../../util/db/select/get_many_many');
const {
  get_results_id,
  get_count_of_goods_at_cart,
} = require('../../util/state/goods');
const { inline_description } = require('./inline_result_description');
const { exchange_rate_analysis } = require('../../util/state/state');
const { user_language } = require('../../util/language');
const { get_status_goods } = require('../../util/db/select/get_status');

exports.inline_result = async (results, ctx, user_id, filter) => {
  try {
    if (!results || !results.length)
      return console.log('!results || !results.length');
    const results_favourite_id = !filter ? await get_results_id(user_id) : null;
    const results_cart_id = await get_results_id(user_id, 'cart');

    const new_results_favourite_id = results_favourite_id
      ? results_favourite_id.map(({ ms_goods_id }) => ms_goods_id)
      : [];
    const new_results_cart_id = results_cart_id
      ? results_cart_id.map(({ ms_goods_id }) => ms_goods_id)
      : [];
    const cart_content = await get_count_of_goods_at_cart(user_id);
    const get_many = await get_many_many();

    const exchange_rate = await exchange_rate_analysis(user_id);
    await user_language(ctx);
    const language = ctx.i18n.locale();
    const [status_new, status_used] = await get_status_goods(language);
    return results.map((result, i, self) => {
      if (!result) return;
      let first = false;
      let count;
      let last = false;
      let favourite_checker;
      let cart_checker;
      if (!i) {
        first = true;
      } else if (i == self.length - 1) {
        last = true;
      }
      new_results_favourite_id.forEach((result_element) => {
        if (result_element == result.ms_goods_id) {
          favourite_checker = true;
        }
      });
      new_results_cart_id.forEach((result_element) => {
        if (result_element == result.ms_goods_id) {
          cart_checker = true;
        }
      });

      cart_content
        ? cart_content.forEach((cart_element) => {
            if (cart_element.ms_goods_id === result.ms_goods_id)
              count = cart_element.count;
          })
        : null;

      return {
        type: 'article',
        id: i,
        title: `${result.name}, ${
          result.status === 'Used' ? status_used : status_new
        }`,
        description: inline_description(result, get_many, ctx.i18n),
        thumb_url: result.img_src ? result.img_src : '',
        url: result.meta_href ? result.meta_href : '',
        hide_url: true,
        input_message_content: {
          message_text: message_text(result, ctx.i18n, exchange_rate, [
            status_new,
            status_used,
          ]),
          parse_mode: 'HTML',
          disable_web_page_preview: false,
        },
        reply_markup: {
          inline_keyboard: inline_keyboard(
            ctx.i18n,
            first,
            last,
            !filter ? favourite_checker : true,
            cart_checker,
            count,
            result.goods_ref,
            filter
          ),
        },
      };
    });
  } catch (err) {
    console.log('inline_result', err);
  }
};
