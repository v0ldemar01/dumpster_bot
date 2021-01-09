'use strict';
const { clear_space } = require('../clear');

const local_back = async (isFull, ctx) => {
  try {
    await clear_space(ctx);
    return isFull
      ? await ctx.scene.enter('start')
      : await ctx.scene.enter('self_search');
  } catch (err) {
    console.log("local_back", err);
  }
};

exports.full_back = local_back.bind(null, true);

exports.back = local_back.bind(null, false);
