'use strict';
const WizardScene = require('telegraf/scenes/wizard');
const { message_text } = require('./reply_message');
const { updateUser } = require('../../additional/user');

exports.invoice = async ctx => await invoice_local(ctx);

const invoice_local = async (ctx, first) => {
  try {
    await message_text(ctx, first);
  } catch (err) {
    console.log('invoice', err);
  }
};

module.exports = new WizardScene(
  'invoice', 
  async ctx => {
    try {    
      await updateUser(ctx);
      await invoice_local(ctx, true);
      return await ctx.wizard.next();
    } catch (err) {
      console.log('invoice_callback', err);
    }
  }, 
  async ctx => {
    try {
      const callback = ctx.update.callback_query?.data;  
      if (callback && (callback == 'invoice_reverse' || callback == 'invoice_forward')) {
        if (callback == 'invoice_reverse') {
          ctx.session['own_orders'] -= 1;
        } else {
          ctx.session['own_orders'] += 1;
        }
        return await invoice_local(ctx);    
      } 
      return await ctx.scene.leave();
    } catch (err) {
      console.log(err);
    }
});
