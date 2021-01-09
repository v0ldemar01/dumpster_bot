'use strict';
const { update_statistics_field } = require('../../util/state/statistics');

exports.guarantee = async (ctx) => {
  await update_statistics_field('guarantee_count');
};
