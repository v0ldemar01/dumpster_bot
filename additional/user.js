'use strict';
const {
  update_user_status,
  get_bot_user_info,
} = require('../util/state/state');
const {
  get_statistics_data,
  get_user_statistics_data,
  get_count_users_time,
} = require('../util/state/statistics');
const {
  update_statistics,
  update_bot_user_info,
  update_crater_info,
  insert_areas_statistics,
  update_time_users,
} = require('../util/googlesheets/user');
const { get_company_areas } = require('../util/novaposhta/nova_poshta');
const { count_users_in_areas } = require('../util/state/invoice');
const { checkClickKeyboard } = require('./keyboard');

const find_name_by_callback = ctx => {
  const inline_keyboard =
    ctx.update.callback_query?.message?.reply_markup?.inline_keyboard;
  const callback = ctx.update.callback_query?.data;
  let text;
  if (callback && inline_keyboard) {
    inline_keyboard.some((inline_keyboard_element) => {
      if (inline_keyboard_element[0].callback_data == callback) {
        text = inline_keyboard_element[0].text;
        return true;
      }
    });
  }
  return text;
};

const get_position = ctx => {
  const prev_position =
    ctx.update.message?.text ||
    find_name_by_callback(ctx) ||
    ctx.update.callback_query?.data;
  const all_position = {
    [`/start`]: 'Старт',
    [`${ctx.i18n.t('start.select_language')}`]: 'Вибір мови',
    [`${ctx.i18n.t('start.left_language')}`]: 'Вибір мови',
    [`${ctx.i18n.t('greeting.select_category')}`]: 'Вибір категорії товару',
    [`${ctx.i18n.t('main_menu.to_category')}`]: 'Вибір категорії товару',
    [`${ctx.i18n.t(
      'smart_search.group_by_budget'
    )}`]: 'Підібрать під мій бюджет',
    [`${ctx.i18n.t('main_menu.to_search')}`]: 'Розумний пошук',
    [`cart`]: 'Корзина',
    [`${ctx.i18n.t('main_menu.cart')}`]: 'Корзина',
    [`${ctx.i18n.t('goods_cart.to_order')}`]: 'Оформлення замовлення',
    [`${ctx.i18n.t('payment.ordering_successful')}`]: 'Оплата',
  };
  return all_position[prev_position];
};

exports.updateUser = async ctx => {
  try {
    const user_id =
      ctx.update?.message?.chat?.id ||
      ctx.update.callback_query?.message?.chat.id ||
      ctx.update.callback_query?.from.id;
    const position = get_position(ctx);
    const time = new Date().toLocaleString({ timeZone: 'Europe/Kiev' });
    await update_user_status(user_id, time, position);
  } catch (err) {
    console.log('updateUser', err);
  }
};

exports.updateKey = async (ctx, next) => {
  try {
    await checkClickKeyboard(ctx);
    return next ? next() : null;
  } catch (err) {
    console.log('updateKey', err);
  }
};

exports.updateStatistics = async () => {
  try {
    const data = await get_statistics_data();
    const areas_users = await count_users_in_areas();
    await update_statistics(
      Object.values(data).filter((_, i) => i),
      Object.entries(areas_users)
    );
  } catch (err) {
    console.log('updateStatistics', err);
  }
};

exports.updateUserInfo = async () => {
  try {
    const { users_info_result, favourites_result } = await get_bot_user_info();
    const format_favourites_result = favourites_result.reduce(
      (acc, current) => {
        const elem = acc.find((item) => item.user_id === current.user_id);
        if (!elem) {
          if (!Array.isArray(current.ms_goods_id)) {
            current.ms_goods_id = [current.ms_goods_id];
          }
          return [...acc, current];
        } else {
          elem.ms_goods_id = Array.isArray(elem.ms_goods_id)
            ? elem.ms_goods_id
            : [elem.ms_goods_id];
          const currData = elem.ms_goods_id.filter(
            name => name === current.ms_goods_id
          );
          if (!currData.length) {
            elem.ms_goods_id.push(current.ms_goods_id);
          }
          return [...acc];
        }
      },
      []
    );
    const new_format_favourites_result = format_favourites_result.map(
      ({ ms_goods_id, user_id }) => ({
        ms_goods_id: Array.isArray(ms_goods_id)
          ? ms_goods_id.join(', ')
          : ms_goods_id,
        user_id,
      })
    );

    const combine_data = new_format_favourites_result.map(
      ({ user_id, ms_goods_id }) => {
        const favourite_elem = users_info_result.find(
          (result) => result.user_id == user_id
        );
        if (favourite_elem) favourite_elem.ms_goods_id = ms_goods_id;
        return favourite_elem;
      }
    );
    await update_bot_user_info(combine_data);
  } catch (err) {
    console.log('updateUserInfo', err);
  }
};

exports.updateCraterInfo = async () => {
  try {
    const users_crater_info = await get_user_statistics_data();
    await update_crater_info(users_crater_info);
  } catch (err) {
    console.log('updateCraterInfo', err);
  }
};

exports.updateAreasInfo = async () => {
  try {
    const areas_data = await get_company_areas();
    areas_data.unshift('Київ');
    await insert_areas_statistics(areas_data);
  } catch (err) {
    console.log('updateAreasInfo', err);
  }
};

exports.updateActiveTimes = async () => {
  try {
    const times_users = await get_count_users_time();
    console.log(times_users);
    await update_time_users(times_users);
  } catch (err) {
    console.log('updateActiveTimes', err);
  }
};
