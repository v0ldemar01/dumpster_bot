'use strict';
const Markup = require('telegraf/markup');
const { user_language } = require('../../util/language');

exports.inline_result_v3 = async (ctx, results) => {
  try {
    if (!results || !results.length)
      return console.log('!results_v3 || !result_v3.length');
    await user_language(ctx);
    const language = ctx.i18n.locale();
    const new_results = results
      .filter(({ code }) =>
        code ? code.split('_')?.pop()[0] == language[0] : null
      )
      .filter((e) => e);
    return new_results.map((result, i) => ({
      type: 'article',
      id: i,
      title: result.question,
      description: result.answer,
      thumb_url: result.url
        ? result.url
        : 'https://upload.wikimedia.org/wikipedia/ru/9/99/%D0%91%D0%B5%D0%BB%D1%8B%D0%B9_%D0%BA%D0%B2%D0%B0%D0%B4%D1%80%D0%B0%D1%82.jpg',
      input_message_content: {
        message_text: `${result.question}\n\n${result.answer}\n\n${ctx.i18n.t(
          'additional_func.receive_response'
        )} `,
      },
      reply_markup: {
        inline_keyboard: [
          [
            Markup.callbackButton(
              ctx.i18n.t('additional_func.receive_response_status_yes'),
              'receive_response_status_yes'
            ),
            Markup.switchToCurrentChatButton(
              ctx.i18n.t('additional_func.more_questions'),
              'answer_questions'
            ),
          ],
          [
            Markup.callbackButton(
              ctx.i18n.t('additional_func.own_question'),
              'own_question'
            ),
          ],
          [
            Markup.callbackButton(
              ctx.i18n.t('additional_func.to_manager'),
              'to_manager'
            ),
          ],
        ],
      },
    }));
  } catch (err) {
    console.log('inline_result_v3', err);
  }
};
