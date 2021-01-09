'use strict';
const {
  initial_state,
  initial_state_statistics,
  initial_state_mailing,
  initial_state_exchange_rate,
} = require('../../util/state/init');
const {
  update_statistics_field,
  update_users_crater_info,
} = require('../../util/state/statistics');
const { updateUser } = require('../../additional/user');
const {
  first_action_mailing_execute,
  check_first_action_mailing_execute,
  get_users_count,
} = require('../../util/state/state');
const { launchMailingJob } = require('../mailing/callback');
const { get_way_to_by_crater } = require('../../additional/crater');
const { clear_space } = require('../clear');

exports.start = async ctx => {
  try {
    await clear_space(ctx, null, 2);
    ctx.session = {};
    if (ctx.startPayload) ctx.session['deep_linking'] = ctx.startPayload;

    const { id, username, first_name } = ctx.update?.message?.chat;
    const user = await initial_state(id, username, first_name);
    ctx.session['user'] = user;

    const { count } = await get_users_count();
    await initial_state_statistics();
    await initial_state_mailing();
    await initial_state_exchange_rate();
    await updateUser(ctx);
    await update_statistics_field('user_count', count);    

    const check = await check_first_action_mailing_execute();
    if (!check?.status) {
      await first_action_mailing_execute();
      await launchMailingJob(ctx);
    }

    const direction = await get_way_to_by_crater(ctx);
    if (!direction) {
      await update_users_crater_info(id, 'crater.enter');
      
    }
    return await ctx.scene.enter('start_language');
  } catch (err) {
    console.log('start_callback', err);
  }
};
