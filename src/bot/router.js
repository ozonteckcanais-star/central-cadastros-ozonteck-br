import fs from 'fs';
import { UI } from '../utils/mensagens.js';
import { fluxoNormal } from '../flows/normal.js';
import { fluxoVip } from '../flows/vip.js';
import { db } from '../store/db.js';

export function router(bot){

  bot.start(async (ctx)=>{
    const nome = (ctx.from?.first_name||'').trim();
    const kb = {
      reply_markup: {
        keyboard: [[{text: UI.botoesInicio.novo}, {text: UI.botoesInicio.jaSou}]],
        resize_keyboard: true,
        one_time_keyboard: false
      },
      parse_mode: 'Markdown'
    };
    await ctx.reply(UI.boasVindas(nome), kb);
  });

  bot.hears([UI.botoesInicio.novo, /novo cadastro/i], async (ctx)=>{
    // reseta state
    const d = db.get(); d.users[String(ctx.chat.id)] = { fluxo:'normal', step:null }; db.set(d);
    return fluxoNormal(ctx);
  });

  bot.hears([UI.botoesInicio.jaSou, /já sou/i, /ja sou/i], async (ctx)=>{
    // para simplificar, tratamos como fluxo VIP via missão (entrada direta)
    const d = db.get(); d.users[String(ctx.chat.id)] = { fluxo:'vip', step:null }; db.set(d);
    return fluxoVip(ctx);
  });

  // fallback: roteia pelo estado salvo
  bot.on('message', async (ctx)=>{
    const d = db.get();
    const u = d.users[String(ctx.chat.id)] || {};
    if (u.fluxo==='normal') return fluxoNormal(ctx);
    if (u.fluxo==='vip') return fluxoVip(ctx);

    // caso nenhum fluxo esteja ativo:
    const kb = {
      reply_markup: {
        keyboard: [[{text: UI.botoesInicio.novo}, {text: UI.botoesInicio.jaSou}]],
        resize_keyboard: true
      },
      parse_mode: 'Markdown'
    };
    return ctx.reply('Use os botões abaixo para continuar:', kb);
  });
}
