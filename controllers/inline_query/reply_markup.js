'use strict';
const Markup = require('telegraf/markup');
const { url_message } = require('../start/url_message');

exports.inline_keyboard = (
  i18n,
  first,
  last,
  favourite_checker,
  cart_checker,
  count,
  goods_ref,
  filter
) => {
  try {
    return [
      [
        cart_checker
          ? Markup.callbackButton(
            i18n.t('goods_card.cart_success'), 
            'cart'
          )
          : Markup.callbackButton(
            i18n.t('goods_card.buy'), 
            'buy'
          ),
        favourite_checker
          ? Markup.callbackButton(
              i18n.t('goods_card.is_favourite'),
              'favourite'
            )
          : Markup.callbackButton(
              i18n.t('goods_card.to_favourites'),
              'favourite'
            ),
        cart_checker
          ? Markup.callbackButton(
              `(${count}) ${i18n.t('goods_card.cart')}`,
              'cart'
            )
          : Markup.callbackButton(
            i18n.t('goods_card.to_cart'), 
            'cart'
          ),
      ],
      cart_checker
        ? [
            Markup.callbackButton(
              i18n.t('general.add').replace(/\"/g, ''),
              'add'
            ),
            Markup.callbackButton(
              i18n.t('general.remove').replace(/\"/g, ''),
              'remove'
            ),
          ]
        : [],
      // first ?
      // [
      //   Markup.callbackButton(i18n.t('general.forward'), 'forward'),
      // ] :
      // last ?
      // [
      //   Markup.callbackButton(i18n.t('general.reverse') , 'reverse'),
      // ] :
      [
        Markup.callbackButton(
          i18n.t('general.reverse'), 
          'reverse'
        ),
        Markup.callbackButton(
          i18n.t('general.forward'), 
          'forward'
        ),
      ],
      goods_ref
        ? [
          Markup.urlButton(
            i18n.t('goods_card.details'), 
            goods_ref
          )
        ]
        : [],
      [
        Markup.urlButton(
          ...url_message(i18n.t('goods_card.favourite'),
          null, 
          true
        ))
      ],
      // [
      //   Markup.callbackButton(
      //     i18n.t('goods_card.first_favourite'),
      //     'favourite_cheaper'
      //   ),
      // ],
      !filter
        ? [
            Markup.switchToCurrentChatButton(
              i18n.t('goods_card.continue_search'),
              'this_goods'
            ),
          ]
        : [],
      [
        Markup.switchToCurrentChatButton(
          i18n.t('general.answ_comm_questions'),
          'answer_questions'
        ),
      ],
      [
        Markup.callbackButton(
          i18n.t('general.back'), 
          'back'
        )
      ],
    ];
  } catch (err) {
    console.log('inline_keyboard', err);
  }
};
