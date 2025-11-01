import axios from 'axios';

const useReal = String(process.env.VISION_MODE||'real').toLowerCase()==='real';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Analisa o print via GPT-Vision (ou mock).
 * Retorna { nomeNoPrint, patrocinadorNoPrint, statusAtivo, contadorCor }
 */
export async function analisarPrint({ imageUrl }){
  if (!useReal) {
    // MOCK: retorna campos genéricos
    return { nomeNoPrint: 'Alex Victor dos Anjos Silva', patrocinadorNoPrint: 'Leonice dos Anjos Silva', statusAtivo: true, contadorCor: 'verde' };
  }
  const prompt = "Extraia do print: nome do usuário, nome do patrocinador, se está ativo (sim/não) e cor do contador (verde/amarelo/vermelho). Responda em JSON com chaves nomeNoPrint, patrocinadorNoPrint, statusAtivo(boolean), contadorCor.";
  try{
    const rsp = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-4o-mini",
      messages: [
        {role:"system", content:"Você é um extrator de dados de prints."},
        {role:"user", content: [
          {type:"text", text: prompt},
          {type:"image_url", image_url: { url: imageUrl }}
        ]}
      ],
      temperature: 0.2
    },{
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` }
    });
    const txt = rsp.data?.choices?.[0]?.message?.content?.trim() || "{}";
    return JSON.parse(txt);
  }catch(e){
    return { error: String(e) };
  }
}

/**
 * Lê HTML do link de indicação e tenta extrair o nome do patrocinador no link.
 * Retorna { nomeNoLink }
 */
export async function analisarLinkHtml({ url }){
  const useHtmlReal = String(process.env.HTML_MODE||'real').toLowerCase()==='real';
  if (!useHtmlReal) {
    // MOCK: supõe que o nome no link é o mesmo do print do Alex
    return { nomeNoLink: 'Alex Victor dos Anjos Silva' };
  }
  // Estratégia: enviar o HTML como contexto para o GPT extrair o nome.
  try{
    // Baixa HTML
    const html = await axios.get(url).then(r=>r.data);
    const prompt = ´Leia o HTML a seguir e extraia *apenas* o nome do patrocinador presente no formulário de cadastro. Responda em JSON: { "nomeNoLink": "..." }´;
    const rsp = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-4o-mini",
      messages: [
        {role:"system", content:"Você extrai dados de HTML."},
        {role:"user", content: `${prompt}

HTML:
${html.slice(0,12000)}`}
      ],
      temperature: 0.1
    },{
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` }
    });
    const txt = rsp.data?.choices?.[0]?.message?.content?.trim() || "{}";
    return JSON.parse(txt);
  }catch(e){
    return { error: String(e) };
  }
}
