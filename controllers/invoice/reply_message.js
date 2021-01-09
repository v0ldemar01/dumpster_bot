'use strict';
const Markup = require('telegraf/markup');
const { select_all_invoices_by_user } = require('../../util/state/invoice');
const { get_goods_info_by_id } = require('../../util/state/goods');

exports.message_text = async (ctx, first) => {
  try {
    const user_id =
      ctx.update?.message?.chat?.id ||
      ctx.update.callback_query?.message?.chat?.id ||
      ctx.update.callback_query?.from?.id;
    const template_order_info = ctx.i18n.t('order_history.template_history');
    const parse_ordering = template_order_info
      .split('\n')
      .filter((element) => element);

    const all_invoices = await select_all_invoices_by_user(user_id);
    if (!all_invoices.length) {
      return await ctx.reply(ctx.i18n.t('order_history.no_orders'));
    }
    
    if (!ctx.session['own_orders']) {      
      ctx.session['own_orders'] = all_invoices.length;      
    } else if (ctx.session['own_orders'] == all_invoices.length + 1) {
      ctx.session['own_orders'] = 1;
    }
    const index = ctx.session['own_orders'] - 1;  

    const { id, date, goods_id, sum, status } = all_invoices[index];
    
    let message = '';
    message +=
      `<b>${parse_ordering[0]}: ${id}</b>` +
      `\n<b>${parse_ordering[1]}: ${date}</b>` +
      `\n<b>${parse_ordering[2]}</b>`;
    const goods_id_array = goods_id.split(', ');
    for (let j = 0; j < goods_id_array.length; j++) {
      const ms_goods_id = goods_id_array[j];
      const { name, price } = await get_goods_info_by_id(
        ms_goods_id.split('$')[0]
      );
      message += `\n\n${name} - ${price} Грн`;
    }
    message +=
      `\n\n<b>${parse_ordering[3]}: ${sum} Грн</b>` +
      `\n<b>${parse_ordering[4]} ${status}</b>`;
    const markup = Object.assign(
      {
        parse_mode: 'HTML'
      },      
      Markup.inlineKeyboard([
        [
          Markup.callbackButton(
            ctx.i18n.t('general.reverse'), 
            'invoice_reverse'
          ),
          Markup.callbackButton(
            ctx.i18n.t('general.forward'), 
            'invoice_forward'
          ),
        ]
      ]).extra()
    );
    
    if (first) {
      await ctx.reply(message, markup);  
    } else {
      await ctx.editMessageText(message, markup);
    }  
    
  } catch (err) {
    console.log('message_text', err);
  }
};