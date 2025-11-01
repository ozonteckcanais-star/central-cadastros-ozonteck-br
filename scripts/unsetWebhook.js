import 'dotenv/config';
import { Telegraf } from 'telegraf';

const { TELEGRAM_TOKEN } = process.env;
if (!TELEGRAM_TOKEN){
  console.error('TELEGRAM_TOKEN ausente no .env');
  process.exit(1);
}
const bot = new Telegraf(TELEGRAM_TOKEN);
const run = async ()=>{
  await bot.telegram.deleteWebhook();
  console.log('Webhook removido');
  process.exit(0);
};
run();
