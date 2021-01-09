'use strict';
const Markup = require('telegraf/markup');

exports.inline_keyboard = i18n => [
  [
    Markup.callbackButton(
      i18n.t('goods_сart.edit'), 
      'edit_cart'
    )
  ],
  [
    Markup.callbackButton(
      i18n.t('goods_сart.guarantee_add').replace(/\"/g, ''),
      'guarantee_add'
    ),
  ],
  [
    Markup.callbackButton(
      i18n.t('goods_сart.to_order'), 
      'to_order'
    )
  ],
  [
    Markup.switchToCurrentChatButton(
      i18n.t('general.answ_comm_questions'),
      'answer_questions'
    ),
  ],
];
