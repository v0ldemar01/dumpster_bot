'use strict';
const { get_many_many } = require('../../util/db/select/get_many_many');
const { markup_template_many } = require('../../util/markup_column');
const Markup = require('telegraf/markup');

const inline_menu_buttons = async (ctx, index) => {
  try {
    const many_many_result = await get_many_many();

    const inline_result = await markup_template_many(
      many_many_result,
      ctx.i18n
    );

    ctx.session['inline_result_length'] = inline_result.length;
    if (index == undefined) return inline_result.flat();
    const markup_callbacks = inline_result.slice(index, index + 2);
    markup_callbacks.push(inline_result[inline_result.length - 1]);

    const new_markup_callbacks = markup_callbacks.flat();
    new_markup_callbacks.push([
      Markup.switchToCurrentChatButton(
        ctx.i18n.t('smart_search.show_selected_goods'),
        ''
      ),
    ]);
    new_markup_callbacks.push([
      Markup.callbackButton(
        ctx.i18n.t('general.back'), 
        'back'
      ),
    ]);

    // if (!index) {
    //   new_markup_callbacks[new_markup_callbacks.length - 3].shift();
    // } else if (index + 3 == inline_result.length) {
    //   new_markup_callbacks[new_markup_callbacks.length - 3].pop();
    // }
    return new_markup_callbacks;
  } catch (err) {
    console.log('inline_menu_buttons', err);
  }
};

const get_length_inline_menu = async ctx => {
  const inline_result = await inline_menu_buttons(ctx);
  return inline_result.length;
};

module.exports = { inline_menu_buttons, get_length_inline_menu };
