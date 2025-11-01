import 'dotenv/config';
import express from 'express';
import { Telegraf } from 'telegraf';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { router } from './src/bot/router.js';
import { db } from './src/store/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { TELEGRAM_TOKEN, WEBHOOK_ENABLED, BASE_URL, WEBHOOK_PATH } = process.env;
if (!TELEGRAM_TOKEN) {
  console.error('Falta TELEGRAM_TOKEN no .env');
  process.exit(1);
}

const app = express();
app.use(express.json({ limit: '15mb' }));

// Health
app.get('/health', (req,res)=>res.status(200).send('OK v4.4'));

// Telegram bot
export const bot = new Telegraf(TELEGRAM_TOKEN);

// Monta roteador (todas mensagens chegam aqui)
router(bot);

// Webhook x Polling
const useWebhook = (String(WEBHOOK_ENABLED||'true').toLowerCase()==='true');

if (useWebhook) {
  if (!BASE_URL) {
    console.warn('BASE_URL vazio. Use GET /set-webhook?baseUrl=https://SEU.onrender.com para registrar.');
  }
  const webhookPath = process.env.WEBHOOK_PATH || '/webhook/telegram';
  app.use(bot.webhookCallback(webhookPath));
  app.get('/set-webhook', async (req,res)=>{
    const baseUrl = req.query.baseUrl || BASE_URL;
    if (!baseUrl) return res.status(400).send('Informe ?baseUrl=https://seu.onrender.com');
    const url = baseUrl.replace(/\/$/,'') + webhookPath;
    await bot.telegram.setWebhook(url);
    return res.status(200).send('Webhook set: '+url);
  });
  app.get('/unset-webhook', async (req,res)=>{
    await bot.telegram.deleteWebhook();
    res.send('Webhook removida');
  });
} else {
  bot.launch().then(()=>console.log('Polling iniciado'));
}

// Porta
const port = process.env.PORT || 10000;
app.listen(port, ()=>console.log('Central Ozonteck v4.4 rodando na porta', port));

// Encerramento gracioso
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
