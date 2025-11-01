import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../../data/db.json');

function read() {
  try {
    const raw = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(raw);
  } catch(e) {
    return { users:{}, sponsorsNormal:[], sponsorsVip:[], assignments:[], precadastros:[], vipTokens:[], messagesLog:[] };
  }
}
function write(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
}
export const db = {
  get(){ return read(); },
  set(data){ write(data); },
  patch(patchObj){
    const cur = read();
    const merged = { ...cur, ...patchObj };
    write(merged);
    return merged;
  }
}
