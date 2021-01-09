'use strict';
const Markup = require('telegraf/markup');
const Extra = require('telegraf/extra');
const { url_message } = require('../start/url_message');

exports.favourite_cheaper = async ctx => {
  try {
    const user_id =
      ctx.update?.message?.chat?.id ||
      ctx.update.callback_query?.message?.chat?.id ||
      ctx.update.callback_query?.from?.id;
    const markup = Object.assign(
      { parse_mode: 'HTML' },
      Extra.webPreview(false),
      Markup.inlineKeyboard([
        [
          Markup.callbackButton(
            ctx.i18n.t('main_menu.back'), 
            'certain_back'
          )
        ],
      ]).extra()
    );

    const message = url_message(ctx.i18n.t('goods_card.favourite'), true);
    await ctx.telegram.sendMessage(user_id, message, markup);
  } catch (err) {
    console.log('favourite_cheaper', err);
  }
};
