'use strict';

exports.clear_space = async (ctx, current_message_id, count, down) => {
  try {
    count = count ? count : 1;
    down = down ? down : 0;
    const callback = ctx.update.callback_query;
    const chat_id =
      ctx.update.callback_query?.message?.chat?.id ||
      ctx.update.message?.chat?.id ||
      ctx.update.callback_query?.from?.id;
    const message_id = current_message_id
      ? current_message_id
      : ctx.update.callback_query?.message?.message_id ||
        ctx.update.message?.message_id ||
        ctx.update.callback_query?.inline_message_id;
    if (!chat_id || !message_id) 
      return console.log('!chat_id || !message_id');
    for (let i = 0; i < count; i++) {
      try {
        callback
          ? await ctx.telegram.deleteMessage(
              chat_id,
              message_id - count + i + 1
            )
          : await ctx.telegram.deleteMessage(chat_id, message_id - count + i);
        down
          ? await ctx.telegram.deleteMessage(chat_id, message_id + down)
          : null;
      } catch (err) {
        console.log(err);
      }
    }
    for (let i = 0; i < down; i++) {
      try {
        await ctx.telegram.deleteMessage(chat_id, message_id + i);
      } catch (err) {
        console.log(err);
      }
    }
  } catch (err) {
    console.log('clear_space', err);
  }
};
