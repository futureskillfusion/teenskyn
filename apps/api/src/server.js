import 'dotenv/config';
import fs from 'node:fs';
import { createApp } from './app.js';
import { UPLOADS_DIR } from './lib/paths.js';

fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const app = createApp();
const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
