'use strict';
const os = require('os');
global.os = global.os ? global.os : os.platform();
const path = __dirname + (global.os == 'linux' ? '/.env.local' : '/.env');
require('dotenv').config({ path });
const { Telegraf } = require('telegraf');
const fastifyApp = require('fastify')();
const telegrafPlugin = require('fastify-telegraf');
const { match } = require('telegraf-i18n');
const Stage = require('telegraf/stage');
const i18n = require('./additional/i18n');
const session = require('telegraf/session');
const StartLanguageScene = require('./controllers/start_language');
const StartScene = require('./controllers/start');
const SearchScene = require('./controllers/smart_search');
const AnswerQuestionScene = require('./controllers/answer_question');
const FavouriteScene = require('./controllers/favourite');
const InvoiceScene = require('./controllers/invoice');
const SelfServiceScene = require('./controllers/self_service');
const SelectScene = require('./controllers/select_filter');
const BudgetScene = require('./controllers/select_budget');
const CartScene = require('./controllers/cart');
const EditCartScene = require('./controllers/edit_cart');
const ManyScene = require('./controllers/select_many');
const ToCartScene = require('./controllers/to_order');
const DeliveryScene = require('./controllers/delivery');
const DeliveryNPScene = require('./controllers/delivery_nova_poshta');
const ORecipientScene = require('./controllers/other_recipient');
const CheckCorrectScene = require('./controllers/check_correct');
const PaymentScene = require('./controllers/payment');
const QuestionScene = require('./controllers/question');
const AboutScene = require('./controllers/about');
const SharesScene = require('./controllers/shares');
const SumUPScene = require('./controllers/sum_up');
const TrackingScene = require('./controllers/tracking');
const ConsignmentNote = require('./controllers/consignment_note');
const MailingGoodsRef = require('./controllers/mailing/mailing_goods_ref');
const { ua, ru } = require('./controllers/start_language/language');
const { callback_query } = require('./controllers/callback_query');
const { inline_query } = require('./controllers/inline_query');
const { chosen_inline_result } = require('./controllers/chosen_inline_result');
const { message } = require('./controllers/message');
const { start } = require('./controllers/start/callback');
const { to_order } = require('./controllers/to_order/callback');
const { cart } = require('./controllers/cart/callback');
const { favourite_cheaper } = require('./controllers/favourite/favourite_cheaper');
const { launchMailingJob } = require('./controllers/mailing/callback');
const { clear_space } = require('./controllers/clear');
let { scenes } = require('./additional/scenes');
const { BOT_TOKEN, SHEET_NAME, PORT } = process.env;
const { config_url } = require('./util/webHook');
const {
  clear_first_action_mailing_execute,
  change_time,
} = require('./util/state/state');
const { full_back, back } = require('./controllers/callback_query/back');
const { guarantee } = require('./controllers/callback_query/guarantee');

(async () => {
  const {PORT, url} = await config_url();
  console.log({PORT, url})
  const bot = new Telegraf(BOT_TOKEN);
  await clear_first_action_mailing_execute();

  const stage = new Stage([
    StartLanguageScene,
    StartScene,
    SearchScene,
    AnswerQuestionScene,
    FavouriteScene,
    InvoiceScene,
    SelfServiceScene,
    SelectScene,
    BudgetScene,
    CartScene,
    EditCartScene,
    ManyScene,
    ToCartScene,
    DeliveryScene,
    DeliveryNPScene,
    ORecipientScene,
    PaymentScene,
    QuestionScene,
    AboutScene,
    SharesScene,
    SumUPScene,
    TrackingScene,
    ConsignmentNote,
    MailingGoodsRef,
    CheckCorrectScene,
  ]);

  bot.use(
    session({
      getSessionKey: ctx => ctx.from && `${ctx.from?.id}:${ctx.chat?.id}`,
    })
  );

  bot.use(i18n.middleware());
  bot.use(stage.middleware());

  bot.start(async (ctx) => {
    scenes = ctx.scene;
    return await start(ctx);
  });
  
  bot.command('mailing', launchMailingJob);

  bot.command('change_bot_mailing_time', async (ctx) => {
    const { text } = ctx.update.message;
    const time = text.split(' ')[1];
    await change_time('bot_schedule_mailing', time);
    return await ctx.reply(`Time bot mailing is changed to ${time}`);
  });

  bot.command('change_cron_mailing_time', async (ctx) => {
    const { text } = ctx.update.message;
    const time = text.split(' ')[1];
    await change_time('cron_schedule_mailing', time);
    return await ctx.reply(`Time cron mailing is changed to ${time}`);
  });

  bot.action('ua', ua);

  bot.action('ru', ru);

  bot.action(
    'search', 
    async ctx => await ctx.scene.enter('smart_search')
  );

  bot.action(
    'self_search',
    async ctx => await ctx.scene.enter('self_search')
  );

  bot.action(
    'select_filter',     
    async ctx => await ctx.scene.enter('select_many')
  );

  bot.action(
    'select_budget',     
    async ctx => await ctx.scene.enter("select_budget")
  );

  bot.action('self_search_to', async (ctx) => {
    if (!ctx.scene) ctx.scene = scenes;
    if (!Object.keys(ctx.scene).length)
      return console.log('!Object.keys(ctx.scene).length');
    if (!ctx.session) ctx.session = {};
    ctx.session['self_search_to'] = true;
    await ctx.scene.enter('self_search');
  });

  bot.action('favourite_cheaper', favourite_cheaper);

  bot.action('back', back);

  bot.action('full_back', full_back);

  bot.action('certain_back', clear_space);

  bot.action('cart', cart);

  bot.action('guarantee_add', guarantee);

  bot.action('edit_cart', async ctx => {
    await clear_space(ctx);
    return await ctx.scene.enter('edit_cart');
  });

  bot.action('save_changes', async ctx => {
    ctx.session['save_changes'] = true;
    return await ctx.scene.enter('cart');
  });

  bot.action('to_order', async ctx => {
    ctx.session['to_order_first'] = true;
    return await to_order(ctx);
  });

  bot.action(
    'delivery', 
    async ctx => ctx.scene.enter('delivery')
  );

  bot.action('own_question', async ctx => {
    if (!ctx.scene) ctx.scene = scenes;
    if (!Object.keys(ctx.scene).length)
      return console.log('!Object.keys(ctx.scene).length');
    return await ctx.scene.enter('question');
  });

  bot.action('mailing_goods_ref', async ctx => {
    if (!ctx.scene) ctx.scene = scenes;
    if (!Object.keys(ctx.scene).length)
      return console.log('!Object.keys(ctx.scene).length');
    return await ctx.scene.enter('mailing_goods_ref');
  });

  bot.on('callback_query', callback_query);

  bot.on('inline_query', inline_query);
  bot.on('connected_website', ctx => console.log(ctx));
  bot.on('chosen_inline_result', chosen_inline_result);

  bot.hears(
    match('main_menu.to_category'),
    async ctx => await ctx.scene.enter('self_search')
  );

  bot.hears(
    match('main_menu.to_search'),
    async ctx => await ctx.scene.enter('smart_search')
  );

  bot.hears( 
    match('main_menu.cart'),   
    async ctx => {
      ctx.session['cart_first_message'] = true;
      return await ctx.scene.enter('cart');
    }
  );

  bot.hears(
    match('main_menu.favourite'),
    async ctx => await ctx.scene.enter('favourite')
  );

  bot.hears(
    match('main_menu.to_my_orders'),
    async ctx => {
      ctx.session['own_orders'] = 1;
      return await ctx.scene.enter('invoice');
    }
  );

  bot.hears(
    match('main_menu.answ_comm_question'),
    async ctx => await ctx.scene.enter('answer_question')
  );

  bot.hears(
    match('main_menu.about_company'),
    async ctx => {
      await ctx.scene.enter('about')
    }
  );

  bot.hears(
    match('main_menu.shares'),    
    async ctx => await ctx.scene.enter('shares')
  );

  bot.on('message', message);

  bot.telegram.setMyCommands([
    {
      command: 'start',
      description: 'Start the bot',
    },
  ]);

  fastifyApp.register(telegrafPlugin, { bot, path: `/${BOT_TOKEN}` });
  bot.telegram.setWebhook(`${url}/${BOT_TOKEN}`);

  fastifyApp.listen(PORT, () => {
    console.log('Example app listening on port 3000!')
  });

  bot.launch();
})();
