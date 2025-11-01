import { UI } from '../utils/mensagens.js';
import { db } from '../store/db.js';
import { analisarPrint, analisarLinkHtml } from '../services/vision.js';

function setState(chatId, patch){
  const d = db.get();
  d.users[chatId] = { ...(d.users[chatId]||{}), ...patch };
  db.set(d);
}

export async function fluxoVip(ctx){
  const chatId = String(ctx.chat.id);
  const text = (ctx.message?.text||'').trim();
  const ustate = (db.get().users[chatId]||{});

  if (!ustate.step){
    setState(chatId, { step:'vipPedePrint' });
    await ctx.reply(UI.vipParabens);
    return ctx.reply(UI.pedePrint);
  }

  if (ustate.step==='vipPedePrint'){
    const photo = ctx.message?.photo?.slice(-1)[0];
    if (!photo) return ctx.reply('Envie o *print* em foto, por favor.');
    const file = await ctx.telegram.getFile(photo.file_id);
    const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_TOKEN}/${file.file_path}`;
    setState(chatId, { step:'vipPedeLink', printUrl: fileUrl });
    await ctx.reply(UI.validando);
    return ctx.reply(UI.pedeLink);
  }

  if (ustate.step==='vipPedeLink'){
    const link = text;
    await ctx.reply(UI.validando);
    const { printUrl } = (db.get().users[chatId]||{});
    const printInfo = await analisarPrint({ imageUrl: printUrl });
    if (printInfo?.error) return ctx.reply(UI.validadoErro('falha ao ler print'));
    if (!printInfo.statusAtivo) return ctx.reply(UI.validadoErro('Status não está ATIVO no print'));
    // No VIP, ignoramos patrocinador antigo. Conferimos apenas NOME do link == NOME do print
    const linkInfo = await analisarLinkHtml({ url: link });
    if (linkInfo?.error) return ctx.reply(UI.validadoErro('falha ao ler HTML do link'));
    if (linkInfo.nomeNoLink?.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'') !== printInfo.nomeNoPrint?.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'') ){
      return ctx.reply(UI.validadoErro('Nome do link diferente do nome do print'));
    }
    // promove topo VIP
    const d = db.get();
    d.sponsorsVip.unshift({ nome: printInfo.nomeNoPrint, link, ativos:0, createdAt: Date.now() });
    db.set(d);
    setState(chatId, { step:'fimVip' });
    return ctx.reply('✅ Validado! Você entrou no *topo* da fila VIP. Irei te direcionar novos indicados em prioridade. Divulgue nossa Central 💚');
  }

  return ctx.reply('Vamos recomeçar? Envie "vip" para reiniciar o fluxo VIP.');
}
