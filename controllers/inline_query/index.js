'use strict';
const {
  get_goods_from,
  smart_get_goods,
} = require('../../util/db/select/get_goods_from');
const {
  set_smart_state,
  new_query,
  clear_state,
  get_type_inline_mode,
} = require('../../util/state/state');
const { set_offset, get_offset } = require('../../util/state/goods');
const { get_localities } = require('../../util/db/select/get_locations');
const { get_answer_questions } = require('../../util/state/questions');
const { inline_result } = require('./inline_result');
const { inline_result_v2 } = require('./inline_result_v2');
const { inline_result_v3 } = require('./inline_result_v3');
const { update_statistics_field } = require('../../util/state/statistics');
let { scenes } = require('../../additional/scenes');

exports.inline_query = async ctx => {
  try {
    if (ctx.scene) {
      scenes = ctx.scene;
    } else {
      ctx.scene = scenes;
    }
    const { inlineQuery, answerInlineQuery } = ctx;
    let current_offset = parseInt(inlineQuery.offset) || 0;
    const input = inlineQuery.query.trim();
    let results;
    let is_locality;
    let is_answer_questions;
    const user_id = ctx.update.inline_query?.from?.id;

    if (input.includes('locality')) {
      const new_input = input.replace('locality', '');
      is_locality = true;
      results = await get_localities(new_input, true);
    } else if (input.includes('answer_questions')) {
      is_answer_questions = true;
      results = await get_answer_questions();
    } else if (input.includes('this_goods')) {
      const { type_inline_mode } = await get_type_inline_mode(user_id);      
      if (type_inline_mode == 'category') {
        results = await get_goods_from(user_id);
      } else {
        results = await smart_get_goods(user_id);
      }
      const { offset } = await get_offset(user_id);
      console.log(offset);
      current_offset += offset ? offset - 15 : 0;
      if (current_offset <= 0) current_offset = 0;     
    } else if (
      !input.includes('categories') &&
      !input.includes('brands') &&
      !input.includes('budget')
    ) {
      const new_input = input.replace('goods ', '');
      await clear_state(user_id);
      await set_smart_state(new_input, user_id);
      results = await smart_get_goods(user_id);
    } else if (input.includes('goods')) {
      const user_id = ctx.update.inline_query?.from?.id;
      const new_input = input.replace('goods ', '');
      await new_query(user_id, new_input);
      results = await get_goods_from(user_id);
    }
    if (!results) return answerInlineQuery([]);
    await set_offset(user_id, current_offset);
    results = results.slice(current_offset, current_offset + 30);
    const new_results = is_locality
      ? await inline_result_v2(results)
      : is_answer_questions
      ? await inline_result_v3(ctx, results)
      : await inline_result(results, ctx, user_id);

    if (!new_results) return await answerInlineQuery([]);
    await answerInlineQuery(new_results, {
      is_personal: true,
      next_offset: current_offset + new_results.length,
      cache_time: 0,
    });
  } catch (err) {
    console.log('inline_query', err);
  }
};
