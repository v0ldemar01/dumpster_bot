'use strict';
const WizardScene = require('telegraf/scenes/wizard');
const Markup = require('telegraf/markup');
const { checkClickKeyboard } = require('../../additional/keyboard');
const {
  print_consignment_note,
  delete_consignment_note_file,
} = require('../../util/novaposhta/nova_poshta');
const {
  get_consignment_note,
  get_true_recipient_full_name,
} = require('../../util/state/invoice');
const { update_statistics_field } = require('../../util/state/statistics');

const sleep = sec => new Promise(resolve => setTimeout(resolve, sec));

module.exports = new WizardScene(
  'tracking',
  async ctx => {
    try {
      await update_statistics_field('tracking_count');
      const check = await checkClickKeyboard(ctx);
      if (check) {
        await ctx.reply(ctx.i18n.t('additional_func.click_again'));
        return ctx.scene.leave();
      }
      await ctx.reply(`${ctx.i18n.t('order_status.check_by_order_number')}`);

      return ctx.wizard.next();
    } catch (err) {
      console.log('tracking_callback1', err);
    }
  },
  async ctx => {
    try {
      const check = await checkClickKeyboard(ctx);
      if (check) {
        await ctx.reply(ctx.i18n.t('additional_func.click_again'));
        return ctx.scene.leave();
      }
      let error;
      const text = ctx.update.message.text;
      if (!text || isNaN(parseInt(text))) error = true;
      if (error) return ctx.scene.enter('tracking');
      ctx.session['invoice_id'] = text;

      await ctx.reply(
        `${ctx.i18n.t('order_status.check_by_contact')}`,
        Markup.keyboard([
          [
            Markup.contactRequestButton(
              `${ctx.i18n.t('to_order.contact_from_tg')}`
            ),
          ],
          [ctx.i18n.t('main_menu.back')],
        ])
          .oneTime()
          .resize()
          .extra()
      );
      return ctx.wizard.next();
    } catch (err) {
      console.log('tracking_callback2', err);
    }
  },
  async (ctx) => {
    try {
      const check = await checkClickKeyboard(ctx);
      if (check) {
        await ctx.reply(ctx.i18n.t('additional_func.click_again'));
        return ctx.scene.leave();
      }
      const contact = ctx.update.message.contact;
      if (!contact) return ctx.scene.enter('tracking');
      const { user_id } = contact;
      const invoice_id = ctx.session['invoice_id'];

      const { consignment_note } = await get_consignment_note(invoice_id);
      const name = await get_true_recipient_full_name(invoice_id);
      const full_name = parseInt(name.is_recipient)
        ? name.own_full_name
        : name.recipient_full_name;

      const message = ctx.i18n
        .t('order_status.result_number')
        .replace('@', full_name)
        .replace('№', consignment_note);
      await ctx.reply(`${message}`);

      await print_consignment_note(consignment_note, user_id);
      const source = await print_consignment_note(consignment_note, user_id);
      await sleep(1500);
      await ctx.replyWithDocument({ source });
      await delete_consignment_note_file(user_id);
      return ctx.scene.leave();
    } catch (err) {
      console.log('tracking_callback3', err);
    }
  }
);
