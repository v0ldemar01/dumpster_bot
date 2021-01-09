'use strict';
const { user_language } = require('../../util/language');
const {
  toggle_favourites,
  set_result_id,
  get_result_id,
  toggle_goods_in_cart,
  change_count_of_goods_in_cart,
  select_all_favourites,
  select_all_goods_by_ms_id,
} = require('../../util/state/goods');
const { inline_result } = require('../inline_query/inline_result');
const {
  get_goods_from,
  smart_get_goods,
} = require('../../util/db/select/get_goods_from');
const {
  select_state,
  get_mailing_goods_ref,
} = require('../../util/state/state');
const exceptions = [
  'favourite',
  'to_favourites',
  'is_favourite',
  'forward',
  'reverse',
  'buy',
  'cart_success',
  'add',
  'remove',
];

const card_inline = (new_goods_result, result_id) => {
  try {
    if (!new_goods_result) return console.log('!new_goods_result');
    let isChange;
    const goods_card = new_goods_result
      .filter((goods_res) => goods_res.id === result_id)
      .map(
        ({
          input_message_content: { message_text, parse_mode },
          url,
          reply_markup,
        }) => ({ message_text, parse_mode, url, reply_markup })
      );

    if (!goods_card[0]) {
      return console.log('!goods_card[0]');
    }
    const { message_text, parse_mode, url, reply_markup } = goods_card[0];
    isChange = true;
    const ms_goods_id = url.split('/').slice(-1).join();
    return {
      isChange,
      message_text,
      url,
      ms_goods_id,
      parse_mode,
      reply_markup,
    };
  } catch (err) {
    console.log('card_inline', err);
  }
};

const get_elements_of_goods_inline = (new_goods_result, result_id) => {
  try {
    if (!new_goods_result || !new_goods_result.length) return;
    let isChange;
    const goods_card = new_goods_result
      .filter((goods_res) => goods_res.id === result_id)
      .map(({ title, url, reply_markup }) => ({
        name: title
          .split(" ")
          .slice(0, title.split(" ").length - 1)
          .join(" ")
          .replace(",", ""),
        reply_markup,
        url,
      }));

    if (!goods_card[0]) {
      return console.log('!goods_card[0]');
    }
    const {
      name,
      reply_markup: { inline_keyboard },
      url,
    } = goods_card[0];
    isChange = true;
    const ms_goods_id = url.split('/').slice(-1).join();
    return { isChange, name, url, ms_goods_id, inline_keyboard };
  } catch (err) {
    console.log('get_elements_of_goods_inline', err);
  }
};

exports.goods_inline_menu = async (ctx, callback) => {
  try {
    let new_goods_result;
    let goods_result;
    let count;
    let goods_inline_keyboard;

    const is_favourite_menu = ctx.session
      ? ctx.session['is_favourite_menu']
      : null;
    const is_mailing_goods_ref = ctx.session
      ? ctx.session['mailing_goods_ref']
      : null;

    const user_id = ctx.update.callback_query?.from?.id;

    await user_language(ctx);

    let { result_id } = await get_result_id(user_id);
    const switch_data = await select_state(user_id);

    if (is_favourite_menu) {
      goods_result = await select_all_favourites(user_id);
    } else if (is_mailing_goods_ref) {
      const { mailing_goods_ref } = await get_mailing_goods_ref(user_id);
      const ms_goods_ids = mailing_goods_ref.trim().split(", ");
      goods_result = await select_all_goods_by_ms_id(ms_goods_ids);
    } else if (!Object.values(switch_data).filter((result) => result).length) {
      goods_result = await smart_get_goods(user_id);
    } else {
      if (
        !Object.values(switch_data)
          .slice(-4)
          .filter((result) => result).length
      ) {
        goods_result = await smart_get_goods(user_id);
      } else {
        goods_result = await get_goods_from(user_id);
      }
    }

    goods_result = goods_result.filter((e) => e);
    new_goods_result = await inline_result(
      goods_result,
      ctx,
      user_id,
      is_favourite_menu
    );

    new_goods_result ? new_goods_result : (new_goods_result = []);
    if (callback == exceptions[3] || callback == exceptions[4]) {
      if (callback == exceptions[3]) {
        count = 1;
      } else {
        count = -1;
      }
      result_id += count;
      if (result_id < 0) result_id = new_goods_result.length - 1;
      if (result_id == new_goods_result.length) result_id = 0;
      set_result_id(user_id, result_id);
      const card_inline_result = card_inline(new_goods_result, result_id);
      if (!card_inline_result) return;
      const {
        isChange,
        message_text,
        parse_mode,
        reply_markup,
      } = card_inline_result;
      if (isChange)
        return await ctx.editMessageText(message_text, {
          parse_mode,
          reply_markup,
        });
    }
    if (callback == exceptions[7] || callback == exceptions[8]) {
      if (callback == exceptions[7]) {
        count = 1;
      } else {
        count = -1;
      }
      const goods_inline_element = get_elements_of_goods_inline(
        new_goods_result,
        result_id
      );
      if (!goods_inline_element) return;
      const { ms_goods_id } = goods_inline_element;

      if (!ms_goods_id) return;
      const isNeg = await change_count_of_goods_in_cart(
        user_id,
        ms_goods_id,
        count
      );

      if (isNeg) await toggle_goods_in_cart(user_id, ms_goods_id);

      const new_new_goods_result = await inline_result(
        goods_result,
        ctx,
        user_id,
        is_favourite_menu
      );
      const card_inline_result = card_inline(new_new_goods_result, result_id);
      if (!card_inline_result) return;

      const {
        isChange,
        message_text,
        parse_mode,
        reply_markup,
      } = card_inline_result;
      if (isChange)
        return await ctx.editMessageText(message_text, {
          parse_mode,
          reply_markup,
        });
    }
    if (callback == exceptions[0]) {
      let isChange;
      const goods_inline_elem = get_elements_of_goods_inline(
        new_goods_result,
        result_id
      );
      if (!goods_inline_elem) return;
      const { ms_goods_id, inline_keyboard } = goods_inline_elem;

      if (!ms_goods_id) return;
      const checker = await toggle_favourites(user_id, ms_goods_id);

      goods_inline_keyboard = inline_keyboard.map((inline_row) =>
        inline_row.map((inline_element) => {
          if (inline_element.callback_data == callback) {
            if (checker) {
              inline_element.text = ctx.i18n.t(`goods_card.${exceptions[2]}`);
              ctx.answerCbQuery(
                ctx.i18n.t('goods_card.adding_favourite_success')
              );
            } else {
              inline_element.text = ctx.i18n.t(`goods_card.${exceptions[1]}`);
              ctx.answerCbQuery(
                ctx.i18n.t('goods_card.removing_favourite_success')
              );
            }
            isChange = true;
          }
          return inline_element;
        })
      );
      isChange
        ? await ctx.editMessageReplyMarkup({
            inline_keyboard: goods_inline_keyboard,
          })
        : null;
    }
    if (callback == exceptions[5]) {
      const goods_inline_element = get_elements_of_goods_inline(
        new_goods_result,
        result_id
      );
      if (!goods_inline_element) return console.log('!goods_inline_element');
      const { ms_goods_id } = goods_inline_element;
      if (!ms_goods_id) return console.log('!name');

      const checker = await toggle_goods_in_cart(user_id, ms_goods_id);

      if (checker) {
        await ctx.answerCbQuery(ctx.i18n.t('goods_card.adding_cart_success'));
      }
      const new_new_goods_result = await inline_result(
        goods_result,
        ctx,
        user_id,
        is_favourite_menu
      );

      const card_inline_result = card_inline(new_new_goods_result, result_id);
      if (!card_inline_result) return console.log('!card_inline_result');

      const { isChange, reply_markup } = card_inline_result;
      const new_inline_keyboard = reply_markup.inline_keyboard;

      isChange
        ? await ctx.editMessageReplyMarkup({
            inline_keyboard: new_inline_keyboard,
          })
        : null;
    }
  } catch (err) {
    console.log('goods_inline_menu', err);
  }
};
