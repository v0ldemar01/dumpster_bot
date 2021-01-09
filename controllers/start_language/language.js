'use strict';
const { update_language } = require('../../util/language');
const { get_users_count_by_language } = require('../../util/state/state');
const { update_statistics_field } = require('../../util/state/statistics');
const { clear_space } = require('../clear');
const { updateUser } = require('../../additional/user');
const { get_way_to_by_crater } = require('../../additional/crater');

const template_language_wrapper = async (ctx, language) => {
  try {    
    await update_language(ctx, language);
    await clear_space(ctx);
    const { count } = await get_users_count_by_language(language);
    await update_statistics_field(
      language == 'ua' ? 'ukr_user_count' : 'ru_user_count',
      count
    );

    if (ctx.session['deep_linking'] == 'order_status')
      return await ctx.scene.enter('tracking');

    const direction = await get_way_to_by_crater(ctx);
    
    await updateUser(ctx);
    if (direction == 'cart') ctx.session['cart_first_message'] = true;
    
    return await ctx.scene.enter(direction ? direction : 'start');
    
  } catch (err) {
    console.log('template_language_wrapper', err);
  }
};

exports.ua = async (ctx) => {
  try {
    await template_language_wrapper(ctx, 'ua');
  } catch (err) {
    console.log('ua', err);
  }
};

exports.ru = async ctx => {
  try {
    await template_language_wrapper(ctx, 'ru');
  } catch (err) {
    console.log('ru', err);
  }
};
