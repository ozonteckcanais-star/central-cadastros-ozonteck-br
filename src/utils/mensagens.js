export const UI = {
  boasVindas: (nome='') => `✨ *Central de Cadastros Ozonteck*\n\nOlá${nome?` ${nome}`:''}! Eu sou a Central que te ajuda a entrar e prosperar no *Consumo Inteligente* da Ozonteck.\n\nVamos seguir juntos? Escolha uma opção abaixo ⤵️`,
  botoesInicio: {
    novo: '🟢 Novo cadastro',
    jaSou: '💙 Já sou Ozonteck'
  },
  pedeLocal: '📍 Me diga *Cidade* e *Estado* (ex: *Queimados, RJ*). Vou localizar o CD mais próximo pra você.',
  resumoEmpresa: `A *Ozonteck* (fundada em 2022) atua com perfumes de bolso de alta qualidade (fragrâncias importadas) e linha de bem-estar. No Consumo Inteligente, você compra a preço de fábrica e pode montar sua renda com recompras.`,

  cdEncontrado: (cds) => {
    if (!cds || !cds.length) return '❌ Não encontrei CD nessa cidade ainda. Posso indicar o mais próximo por geolocalização.';
    const linhas = cds.map((cd,i)=>`${i+1}. *${cd.nome}* — ${cd.endereco}\nResponsável: ${cd.responsavel}\n📞 WhatsApp: ${cd.whatsapp}`);
    return `🏬 Encontrei ${cds.length} CD(s) na sua cidade:\n\n${linhas.join('\n\n')}\n\nVocê pode retirar no CD ou solicitar entrega com frete a combinar.`;
  },
  instruiCompra: (patrocinadorNome, patrocinadorLink) => `💳 Para confirmar seu cadastro, faça *uma compra de R$ 150* em qualquer produto. Recomendamos perfumes de bolso (excelente custo-benefício).\n\n🔗 *Patrocinador*: ${patrocinadorNome}\n👉 ${patrocinadorLink}\n\nDepois, envie *um print da sua tela inicial* (onde aparece seu nome, status e patrocinador).`,
  pedePrint: '📸 Envie o *print da tela inicial* do seu painel (nome, status e patrocinador visíveis).',
  pedeLink: '🔗 Agora envie o *seu link de indicação* (copiado da mesma página).',
  validando: '🔎 Validando suas informações...',
  validadoOk: '✅ Tudo conferido! Seu cadastro foi validado e você foi promovido(a) a *Patrocinador(a)* na Central.',
  validadoErro: (motivo) => `❌ Houve divergência na validação: ${motivo}. Por favor, corrija e reenvie.`,
  fimNormal: '🎉 Pronto! Você entrou na fila da Central. Em breve, a Central direcionará novos indicados para você. Divulgue nossa Central para crescer ainda mais!',
  vipParabens: '💎 Você acessou via *VIP Token*. Parabéns! Já reconheci que você é da Ozonteck. Vamos só validar seu print e link para te colocar no topo da fila VIP.'
}
