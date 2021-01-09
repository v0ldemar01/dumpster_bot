'use strict';
const { set_result_id } = require('../../util/state/goods');
const { update_users_crater_info } = require('../../util/state/statistics');
const { change_count_click } = require('../../util/state/questions');
const { clear_space } = require('../clear');
let { scenes } = require('../../additional/scenes');

exports.chosen_inline_result = async ctx => {
  try {
    if (ctx.scene) {
      scenes = ctx.scene;
    } else {
      ctx.scene = scenes;
    }

    const { chosenInlineResult } = ctx;
    const {
      from: { id },
      result_id,
      query,
    } = chosenInlineResult;
    if (query.includes('answer_questions')) {
      let language = ctx.i18n.locale();
      if (language == 'ru') {
      } else {
        language = 'ukr';
      }
      await change_count_click(language, parseInt(result_id) + 1);
    } else {
      await set_result_id(id, result_id);
    }

    await update_users_crater_info(id, 'crater.goods_card');
  } catch (err) {
    console.log('chosen_inline_result', err);
  }
};
