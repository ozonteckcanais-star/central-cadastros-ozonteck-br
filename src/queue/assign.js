import { db } from '../store/db.js';

function takeFromQueue(kind='normal'){
  const d = db.get();
  const arr = (kind==='vip') ? d.sponsorsVip : d.sponsorsNormal;
  if (!arr.length){
    // se fila estiver vazia, usa um fallback (Leonice -> Alex)
    return { nome:'Leonice dos Anjos Silva', link:'https://office.grupoozonteck.com/register?sponsor=6635788aeebfcf1876fb9fda', kind:'fallback' };
  }
  // devolve o primeiro que ainda não completou 3 ativos
  const item = arr.find(x => (x.ativos||0) < 3) || arr[0];
  return { nome: item.nome, link: item.link, kind };
}

export function pickPatrocinador(kind='normal'){
  return takeFromQueue(kind);
}
