'use strict';
const { get_localities } = require('./db/select/get_locations');

exports.current_localities = async (input_locality = '') =>
  await get_localities(input_locality, true);
