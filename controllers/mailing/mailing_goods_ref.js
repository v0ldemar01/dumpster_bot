'use strict';
const WizardScene = require('telegraf/scenes/wizard');
const {
  set_update_mailing_conversion_users,
} = require('../../util/state/mailing');
const { goods_card } = require('../../util/goods_card');

module.exports = new WizardScene(
  'mailing_goods_ref', 
  async ctx => {
    try {
      ctx.session['mailing_goods_ref'] = true;
      await goods_card(ctx);
      await set_update_mailing_conversion_users();
      return await ctx.scene.leave();
    } catch (err) {
      console.log('favourite_callback', err);      
    }
});
