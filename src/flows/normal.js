import { UI } from '../utils/mensagens.js';
import { pickPatrocinador } from '../queue/assign.js';
import { db } from '../store/db.js';
import { analisarPrint, analisarLinkHtml } from '../services/vision.js';
import axios from 'axios';

function setState(chatId, patch){
  const d = db.get();
  d.users[chatId] = { ...(d.users[chatId]||{}), ...patch };
  db.set(d);
}

export async function fluxoNormal(ctx){
  const chatId = String(ctx.chat.id);
  const text = (ctx.message?.text||'').trim();

  const ustate = (db.get().users[chatId]||{});
  if (!ustate.step){
    // inicia
    setState(chatId, { step:'pedeLocal' });
    await ctx.reply(UI.resumoEmpresa);
    return ctx.reply(UI.pedeLocal);
  }

  if (ustate.step==='pedeLocal'){
    // tenta extrair Cidade, Estado simples por vírgula
    const parts = text.split(',').map(s=>s.trim());
    let cidade = parts[0]||'';
    let estado = (parts[1]||'').toUpperCase();
    const data = db.get();
    const allCds = JSON.parse(fs.readFileSync('data/cds.json','utf-8'));
    const naCidade = allCds.filter(cd => (cd.cidade||'').toLowerCase()===cidade.toLowerCase() and (cd.estado||'').upper()===(estado||'').upper());
    let msg;
    if (naCidade.length){
      msg = UI.cdEncontrado(naCidade);
    } else {
      // escolhe Queimados como fallback provisório
      const fallback = allCds.filter(cd=>cd.cidade==='Queimados');
      msg = UI.cdEncontrado(fallback);
    }
    setState(chatId, { step:'enviaPatrocinador', cidade, estado });
    return ctx.reply(msg, { disable_web_page_preview: true });
  }

  if (ustate.step==='enviaPatrocinador'){
    // seleciona patrocinador da fila
    const patrocinador = pickPatrocinador('normal'); // {nome, link}
    setState(chatId, { step:'esperaPrint', patrocinador });
    await ctx.reply(UI.instruiCompra(patrocinador.nome, patrocinador.link), { disable_web_page_preview: true });
    return ctx.reply(UI.pedePrint);
  }

  if (ustate.step==='esperaPrint'){
    // esperar foto
    const photo = ctx.message?.photo?.slice(-1)[0];
    if (!photo){
      return ctx.reply('Envie a *foto/print* da tela inicial, por favor.');
    }
    // pega URL do arquivo no Telegram
    const fileId = photo.file_id;
    const file = await ctx.telegram.getFile(fileId);
    const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_TOKEN}/${file.file_path}`;
    setState(chatId, { step:'esperaLink', printUrl: fileUrl });
    await ctx.reply(UI.validando);
    return ctx.reply(UI.pedeLink);
  }

  if (ustate.step==='esperaLink'){
    const link = text;
    await ctx.reply(UI.validando);
    // validações
    const { printUrl, patrocinador } = (db.get().users[chatId]||{});
    const printInfo = await analisarPrint({ imageUrl: printUrl });
    if (printInfo?.error){
      return ctx.reply(UI.validadoErro('falha ao ler print'));
    }
    // precisa estar ativo e patrocinador no print = patrocinador enviado
    if (!printInfo.statusAtivo){
      return ctx.reply(UI.validadoErro('Status não está ATIVO no print'));
    }
    if (printInfo.patrocinadorNoPrint?.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'') !== patrocinador.nome.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'') ){
      return ctx.reply(UI.validadoErro('Patrocinador no print diferente do indicado pela Central'));
    }
    // agora valida link (deve apontar para o NOME do usuário que está enviando o print)
    const linkInfo = await analisarLinkHtml({ url: link });
    if (linkInfo?.error){
      return ctx.reply(UI.validadoErro('falha ao ler HTML do link'));
    }
    if (linkInfo.nomeNoLink?.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'') !== printInfo.nomeNoPrint?.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'') ){
      return ctx.reply(UI.validadoErro('Nome do link não confere com o nome do print'));
    }

    await ctx.reply(UI.validadoOk);
    // promove a patrocinador (fila normal)
    const d = db.get();
    d.sponsorsNormal.push({ nome: printInfo.nomeNoPrint, link, ativos:0, createdAt: Date.now() });
    db.set(d);

    setState(chatId, { step:'fim' });
    return ctx.reply(UI.fimNormal);
  }

  return ctx.reply('Vamos recomeçar? Envie "Oi" para iniciar.');
}
