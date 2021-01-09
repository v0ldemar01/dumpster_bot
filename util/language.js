'use strict'
const path = global.os == 'win32' ?
  __dirname.split('\\').slice(0, -1).join('\\') :
  __dirname.split('/').slice(0, -1).join('/');
require('dotenv').config({ path: path + '/.env' });
const {PROJECT_ID} = process.env;
const {Translate} = require('@google-cloud/translate').v2;
const translate = new Translate({
  projectId: PROJECT_ID,
  keyFilename: path + '/dumpster-google.json'
});
const { transliterate } = require('transliteration');
const { get_user_language, set_user_language } = require('./state/state');

exports.translate_names = async (result, language, only_one) => {
  try {
    const new_result = [];
    if (only_one) {
      const [translation] = await translate.translate(result, language);
      return translation;
    } else {
      for await (const name of result) {
        try {
          const [translation] = await translate.translate(name, language);
          new_result.push(translation);
        } catch (err) {
          console.log(err);
        }
      }
    }
    return new_result;
  } catch (err) {
    console.log('translate_names', err);
  }
};

const timeout = msec => new Promise(resolve => setTimeout(resolve, msec));

exports.transliterate_names = (result, only_one) => {
  try {
    const new_result = [];
    if (only_one) {
      return transliterate(result);
    } else {
      for (const name of result) {
        try {
          const translation = transliterate(name);
          new_result.push(translation);
        } catch (err) {
          console.log(err);
        }
      }
    }
    return new_result;
  } catch (err) {
    console.log('transliterate_names', err);
  }
};

exports.update_language = async (ctx, new_language) => {
  try {
    const user_id =
      ctx.update?.message?.chat?.id ||
      ctx.update.callback_query?.message?.chat?.id ||
      ctx.update.callback_query?.from?.id;
    await set_user_language(user_id, new_language);
    await ctx.i18n.locale(new_language);
  } catch (err) {
    console.log('update_language', err);
  }
};

exports.current_language = (bool) =>
  bool ? 'left_language' : 'select_language';

exports.user_language = async (ctx) => {
  try {
    const user_id =
      ctx.update?.message?.chat?.id ||
      ctx.update.callback_query?.message?.chat?.id ||
      ctx.update.callback_query?.from?.id ||
      ctx.update.inline_query?.from?.id;
    const { language } = await get_user_language(user_id);
    if (language != ctx.i18n.locale()) ctx.i18n.locale(language);
  } catch (err) {
    console.log('user_language', err);
  }
};
