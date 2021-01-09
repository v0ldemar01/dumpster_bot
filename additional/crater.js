'use strict';
const { get_user_statistics_crater } = require('../util/state/statistics');

exports.get_way_to_by_crater = async ctx => {
  try {
    const user_id =
      ctx.update?.message?.chat?.id ||
      ctx.update.callback_query?.message?.chat?.id ||
      ctx.update.callback_query?.from?.id;
    const result = await get_user_statistics_crater(user_id); 
    if (result && result.crater) {
      const direction = get_position(result.crater);
      return direction ? direction : false;
    } else {
      return false;
    }
  } catch (err) {
    console.log('get_way_to_by_crater', err);
  }
};

const get_position = prev_position => {
  const prev_position_id = prev_position?.split('.')[1];
  console.log(prev_position_id)
  const all_position = {
    ['greeting']: 'start',
    ['category']: 'self_search',
    ['budget']: 'selected_many',
    ['smart_search']: 'smart_search',
    ['goods_cart']: 'cart',    
  };
  return all_position[prev_position_id];
};