'use strict';
const exceptions = [
  'select_filter',
  'select_budget',
  'show_selected_goods',
  'show',
  'empty',
  'forward',
  'reverse',
  'self_search',
  'accessories',
];
const { inline_menu_buttons } = require('../select_budget/menu');

const toggle_button = (inline_markup_button, caption, force, tick = '✅') => {
  try {
    if (!inline_markup_button) return;
    const inline_button_text = inline_markup_button.text.includes(tick);
    if (!caption) {
      if (!inline_button_text) {
        inline_markup_button.text != ' '
          ? (inline_markup_button.text =
              tick == '✅'
                ? tick + inline_markup_button.text
                : inline_markup_button.text + tick)
          : ' ';
      } else if (!force) {
        inline_markup_button.text = inline_markup_button.text.replace(tick, '');
      }
    } else {
      const caption_text = caption[0].text.includes(tick);
      if (caption_text) {
        if (!inline_button_text) {
          inline_markup_button.text != ' '
            ? (inline_markup_button.text =
                tick == '✅'
                  ? tick + inline_markup_button.text
                  : inline_markup_button.text + tick)
            : ' ';
        }
      } else {
        if (inline_button_text && !force) {
          inline_markup_button.text = inline_markup_button.text.replace(
            tick,
            ''
          );
        }
      }
    }
  } catch (err) {
    console.log('toggle_button', err);
  }
};

const find_header_button = (message_markup, callback) => {
  try {
    let current_markup_block_index;
    let next_markup_block_index;
    message_markup.forEach((markup_element, index, self) => {
      if (!next_markup_block_index) {
        if (
          markup_element.length == 1 &&
          markup_element[0].callback_data === callback
        ) {
          current_markup_block_index = index;
          next_markup_block_index = self.findIndex(
            (element) =>
              element.length == 1 &&
              element[0].callback_data != callback &&
              !element[0].callback_data?.includes(exceptions[8])
          );
          if (next_markup_block_index == -1 || next_markup_block_index == 0)
            next_markup_block_index = self.length - 3;
        }
      }
    });
    return [current_markup_block_index, next_markup_block_index];
  } catch (err) {
    console.log('find_header_button', err);
  }
};

const find_only_header = (message_markup, index) => {
  if (index > 0 && message_markup[index].length != 1)
    return find_only_header(message_markup, index - 1);
  return index;
};

const check_active_history = async (ctx) => {
  try {
    const inline_result_length = ctx.session['inline_result_length'] || 7;
    let index_length = 0;
    const check_active = [];
    let category_checker;
    while (index_length < inline_result_length - 2) {
      const message_markup = await inline_menu_buttons(ctx, index_length);
      message_markup.forEach((markup_button, index, self) => {
        markup_button.forEach((inline_markup_button, i) => {
          Array.isArray(ctx.session['categories_brands_toggle'])
            ? ctx.session['categories_brands_toggle'].forEach(
                (history_element) => {
                  if (history_element[0] != index_length) return;
                  if (
                    markup_button.length == 1 &&
                    history_element[1] == index &&
                    !markup_button[0].callback_data?.includes(exceptions[8])
                  ) {
                    if (!markup_button[0])
                      console.log('!markup_button[0]');
                    check_active.push([inline_markup_button.callback_data]);
                  } else if (
                    index == history_element[1] &&
                    i == history_element[2]
                  ) {
                    check_active.push(inline_markup_button.callback_data);
                    category_checker = true;
                  }
                }
              )
            : null;
        });
      });
      index_length = index_length + 2;
    }
    return check_active;
  } catch (err) {
    console.log('check_active_history', err);
  }
};

exports.toggle_inline_menu = async (
  ctx,
  message_markup,
  callback,
  message_text
) => {
  try {
    let isChange;
    let this_form;
    let category_select;
    let check_active = [];
    const message_markup_left =
      ctx.i18n.t('budget.selecting_filter') == message_text
        ? message_markup.map((markup_button, index) => {
            return markup_button.map((inline_markup_button, i) => {
              Array.isArray(ctx.session['categories_brands_toggle'])
                ? ctx.session['categories_brands_toggle'].forEach(
                    (history_element) => {
                      if (history_element[0] != ctx.session["index"]) return;
                      if (
                        markup_button.length == 1 &&
                        history_element[1] == index &&
                        !markup_button[0].callback_data?.includes(exceptions[8])
                      ) {
                        if (!markup_button[0])
                          console.log('!markup_button[0]');
                        toggle_button(markup_button[0], null, true);
                      } else if (
                        index == history_element[1] &&
                        i == history_element[2]
                      ) {
                        toggle_button(inline_markup_button, null, true);
                      }
                    }
                  )
                : null;
              return inline_markup_button;
            });
          })
        : message_markup;
    ctx.i18n.t('budget.selecting_filter') == message_text
      ? (check_active = await check_active_history(ctx))
      : null;

    if (!exceptions.join(' ').includes(callback.split('_')[0]))
      this_form = true;
    const new_message_markup = message_markup_left.map((markup_button, index) =>
      markup_button.map((inline_markup_button) => {
        if (inline_markup_button.callback_data === callback && this_form) {
          if (ctx.i18n.t('smart_search.select_category') === message_text) {
          } else {
            toggle_button(inline_markup_button);
            if (
              markup_button.length == 1 &&
              !markup_button[0].callback_data.includes(exceptions[8])
            ) {
              category_select = find_header_button(
                message_markup_left,
                callback
              );
            }
            this_form = false;
            isChange = true;
          }
        }
        return inline_markup_button;
      })
    );
    if (category_select) {
      new_message_markup.forEach((markup_button, index, self) => {
        if (index > category_select[0] && index < category_select[1]) {
          markup_button.forEach((inline_markup_button) =>
            toggle_button(inline_markup_button, self[category_select[0]])
          );
        }
      });
    }
    ctx.session['categories_brands_toggle'] = Array.isArray(
      ctx.session['categories_brands_toggle']
    )
      ? ctx.session['categories_brands_toggle'].filter((history_element) => {
          return history_element[0] != ctx.session['index'];
        })
      : null;

    new_message_markup.forEach((markup_button, index, self) => {
      let category_checker;
      let header_index;
      markup_button.forEach((inline_markup_button, i) => {
        if (
          inline_markup_button.text.includes('✅') &&
          inline_markup_button.callback_data != exceptions[0]
        ) {
          if (ctx.i18n.t('budget.selecting_filter') != message_text) {
            if (
              ctx.i18n.t('smart_search.select_category') ==
              message_text.replace(/\n+/g, '')
            ) {
              check_active.push([inline_markup_button.callback_data]);
            } else {
              check_active.push(inline_markup_button.callback_data);
            }
          } else {
            Array.isArray(ctx.session['categories_brands_toggle'])
              ? ctx.session['categories_brands_toggle']
              : (ctx.session['categories_brands_toggle'] = []);
            ctx.session['categories_brands_toggle'].push([
              ctx.session['index'],
              index,
              i,
            ]);

            if (
              markup_button.length == 1 &&
              !markup_button[0].callback_data?.includes(exceptions[8])
            ) {
              check_active.push([inline_markup_button.callback_data]);
            } else {
              check_active.push(inline_markup_button.callback_data);
              if (!inline_markup_button.callback_data.includes('__'))
                category_checker = true;
            }
          }
        }
      });
      if (category_checker) {
        check_active.push([
          self[find_only_header(new_message_markup, index)][0].callback_data,
        ]);
      }
    });
    if (ctx.i18n.t('smart_search.select_category') === message_text) {
      check_active.push([callback]);
    }
    ctx.session['categories_brands_toggle'] = ctx.session[
      'categories_brands_toggle'
    ]
      ? Array.from(
          new Set(ctx.session['categories_brands_toggle'].map(JSON.stringify)),
          JSON.parse
        )
      : null;
    return [
      new_message_markup,
      isChange,
      check_active.filter((item, index, self) => self.indexOf(item) === index),
    ];
  } catch (err) {
    console.log('toggle_inline_menu', err);
  }
};

exports.general_toogle = (inline_markup_button, type_tick) =>
  type_tick
    ? toggle_button(inline_markup_button, null, null, type_tick)
    : toggle_button(inline_markup_button);
