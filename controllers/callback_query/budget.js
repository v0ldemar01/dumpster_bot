"use strict";
const { inline_menu_buttons } = require('../select_budget/menu');
const { toggle_inline_menu } = require('./toggle');
const { insert_state, select_state } = require('../../util/state/state');
const exceptions = ['forward", "reverse'];
const filter = ['categories', 'brands', 'budget', 'memory'];

const filter_inline_query = (inline_array) => {
  try {
    const new_inline_array = [];
    inline_array.forEach((inline_array_element, index, self) => {
      if (!isNaN(inline_array_element))
        return new_inline_array.push(inline_array_element);
      if (inline_array_element.includes(filter[0])) {
        new_inline_array.push(inline_array_element);
        let next_category_index = self.findIndex(
          (element, i) =>
            typeof element != 'number' &&
            element.includes(filter[0]) &&
            i > index
        );
        if (next_category_index == -1) next_category_index = self.length;
        const category_array = self.slice(index + 1, next_category_index);
        if (category_array.length == 1)
          return new_inline_array.push(...category_array);
        const new_category_array = category_array.map(
          (category_array_element, element_index) => {
            if (!element_index) return category_array_element;
            return typeof category_array_element != 'number'
              ? category_array_element.replace(` ${filter[1]} `, '')
              : category_array_element;
          }
        );
        new_inline_array.push(...new_category_array);
      }
    });
    return new_inline_array;
  } catch (err) {
    console.log('filter_inline_query', err);
  }
};

const parse_switch_data = (switch_data) => {
  try {
    const new_switch_data = [];
    if (!switch_data) return console.log('!switch_data');
    Object.entries(switch_data)
      .filter(
        ([key, switch_data_element]) =>
          switch_data_element && switch_data_element != ''
      )
      .reverse()
      .forEach(([key, element]) => {
        if (!isNaN(element) && key == 'selected_budget')
          return new_switch_data.push(filter[2] + element);
        element
          ? element.split(" ").forEach((select_element) => {
              if (!select_element) return;
              if (select_element.includes('__')) {
                const many = select_element.split('__');
                many.forEach((many_element, index) => {
                  new_switch_data.push(` ${filter[index]} ${many_element}`);
                });
              }
            })
          : null;
      });
    const new_new_switch_data = new_switch_data.filter(
      (item, index, self) => self.indexOf(item) === index
    );
    return filter_inline_query(new_new_switch_data).join(' ');
  } catch (err) {
    console.log('parse_switch_data', err);
  }
};

exports.make_parse_switch_data = (switch_data) =>
  parse_switch_data(switch_data);

exports.budget_inline_menu = async (
  ctx,
  message_markup,
  callback,
  message_text,
  user_id
) => {
  try {
    let index = ctx.session['index'] || 0;
    const inline_result_length = ctx.session['inline_result_length'];
    let isChangeMenu;
    console.log(index, inline_result_length);
    if (callback === exceptions[0] || callback === exceptions[1]) {
      if (callback === exceptions[0]) {
        if (index < inline_result_length - 3) {
          index += 2;
        } else {
          index = 0;
        }
      } else if (callback === exceptions[1]) {
        if (index > 1) {
          index -= 2;
        } else {
          index = inline_result_length - 3;
        }
      }
      isChangeMenu = true;
    }

    if (isChangeMenu) message_markup = await inline_menu_buttons(ctx, index);
    ctx.session['index'] = index;
    
    const [
      new_message_markup,
      isChange,
      check_active,
    ] = await toggle_inline_menu(ctx, message_markup, callback, message_text);

    await insert_state(ctx, check_active, user_id, message_text);
    const switch_data = await select_state(user_id);

    const inline_query_data = parse_switch_data(switch_data);

    if (switch_data)
      new_message_markup[
        new_message_markup.length - 2
      ][0].switch_inline_query_current_chat = 'goods ' + inline_query_data;
    isChangeMenu || isChange
      ? await ctx.editMessageReplyMarkup({
          inline_keyboard: new_message_markup,
        })
      : null;
  } catch (err) {
    console.log("budget_inline_menu", err);
  }
};
