import 'dotenv/config';
import { Telegraf } from 'telegraf';

const { TELEGRAM_TOKEN, BASE_URL, WEBHOOK_PATH='/webhook/telegram' } = process.env;
if (!TELEGRAM_TOKEN || !BASE_URL){
  console.error('TELEGRAM_TOKEN/BASE_URL ausentes no .env');
  process.exit(1);
}

const bot = new Telegraf(TELEGRAM_TOKEN);
const url = BASE_URL.replace(/\/$/,'') + WEBHOOK_PATH;
const run = async ()=>{
  await bot.telegram.setWebhook(url);
  console.log('Webhook set =>', url);
  process.exit(0);
};
run();
